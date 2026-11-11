
from uuid import UUID
from datetime import date
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database.supabase_client import supabase
from chatbot.gemini_service import generate_ai_response
from agents.orchestrator_agent import orchestrator_agent, detect_specialist


# ==========================================
# INITIALIZE FASTAPI
# ==========================================

app = FastAPI(
    title="BuildWise AI",
    description="AI-Powered Construction Project Intelligence and Site Management System",
    version="1.0.0"
)



# ==========================================
# CORS CONFIGURATION
# ==========================================


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://buildwise-5rw2r7o51-tuba-nadeem.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# ==========================================
# HOME & HEALTH CHECK
# ==========================================

@app.get("/")
def home():
    return {
        "message": "Welcome to BuildWise AI Backend!",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": "BuildWise AI"
    }



# ==========================================
# SMART AI CHATBOT API
# ==========================================

class ChatHistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatHistoryMessage] = []
    project_id: UUID | None = None


@app.post("/chat")
async def chat(request: ChatRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a message."
        )

    try:
        user_query = request.message.strip()

        # 1. Detect whether a specialist is required
        selected_agent = detect_specialist(user_query)

        # 2. General conversation does not need project lookup
        project_id = str(request.project_id) if request.project_id else ""

        # 3. Find the correct project for specialist analysis
        if selected_agent and not project_id:

            projects_response = (
                supabase.table("projects")
                .select("id, name")
                .order("created_at", desc=True)
                .execute()
            )

            projects = projects_response.data or []

            if not projects:
                return {
                    "status": "success",
                    "reply": (
                        "No project is available in BuildWise AI yet. "
                        "Please create a project before requesting "
                        "project-specific analysis."
                    ),
                    "selected_agent": "general_conversation"
                }

            # Match a project name mentioned by the user
            matching_projects = [
                project for project in projects
                if project["name"].lower() in user_query.lower()
            ]

            if len(matching_projects) == 1:
                project_id = str(matching_projects[0]["id"])

            elif len(projects) == 1:
                project_id = str(projects[0]["id"])

            else:
                project_names = "\n".join(
                    f"- {project['name']}"
                    for project in projects
                )

                return {
                    "status": "success",
                    "reply": (
                        "Which project would you like me to analyze?\n\n"
                        f"{project_names}\n\n"
                        "Please mention the project name."
                    ),
                    "selected_agent": "general_conversation"
                }

        # 4. Execute the orchestrator
        result = await orchestrator_agent(
            project_id=project_id,
            user_query=user_query
        )

        # 5. Handle orchestrator errors
        if not isinstance(result, dict):
            raise HTTPException(
                status_code=500,
                detail="Invalid orchestrator response."
            )

        if result.get("status") != "success":
            return {
                "status": "error",
                "reply": result.get(
                    "message",
                    "Unable to process your request."
                ),
                "selected_agent": result.get("selected_agent")
            }

        # 6. Extract a readable chatbot response
        agent_result = result.get("result", {})

        if isinstance(agent_result, dict):

            reply = (
                agent_result.get("response")
                or agent_result.get("analysis")
                or agent_result.get("message")
            )

            if not reply:
                import json
                reply = json.dumps(
                    agent_result,
                    indent=2,
                    ensure_ascii=False,
                    default=str
                )

        else:
            reply = str(agent_result)

        return {
            "status": "success",
            "reply": str(reply),
            "selected_agent": result.get("selected_agent")
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Chatbot error: {str(error)}"
        )

# ==========================================
# DATABASE CONNECTION TEST
# ==========================================

@app.get("/database-test")
def database_test():

    tables = ["projects", "tasks", "expenses", "materials"]

    try:
        results = {}

        for table in tables:
            supabase.table(table).select("id").limit(1).execute()
            results[table] = "Connected successfully"

        return {
            "status": "success",
            "message": "BuildWise AI database is connected!",
            "tables": results
        }

    except Exception as error:
        return {
            "status": "error",
            "message": "Database connection test failed.",
            "details": str(error)
        }


# ==========================================
# PROJECT MANAGEMENT API
# ==========================================

class ProjectCreate(BaseModel):
    name: str
    location: str
    budget: float
    progress: int = 0
    status: str = "Planning"


class ProjectUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    budget: float | None = None
    progress: int | None = None
    status: str | None = None


@app.get("/projects")
def get_projects():
    try:
        response = (
            supabase.table("projects")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "status": "success",
            "projects": response.data
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/projects")
def create_project(project: ProjectCreate):
    try:
        response = (
            supabase.table("projects")
            .insert(project.model_dump())
            .execute()
        )

        return {
            "status": "success",
            "project": response.data[0]
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.put("/projects/{project_id}")
def update_project(project_id: UUID, project: ProjectUpdate):
    try:
        updates = project.model_dump(exclude_unset=True)

        response = (
            supabase.table("projects")
            .update(updates)
            .eq("id", str(project_id))
            .execute()
        )

        return {
            "status": "success",
            "projects": response.data
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.delete("/projects/{project_id}")
def delete_project(project_id: UUID):
    try:
        response = (
            supabase.table("projects")
            .delete()
            .eq("id", str(project_id))
            .execute()
        )

        return {
            "status": "success",
            "deleted": response.data
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# ==========================================
# TASK MANAGEMENT API
# ==========================================

class TaskCreate(BaseModel):
    project_id: UUID
    title: str
    description: str | None = None
    status: str = "Pending"
    priority: str = "Medium"
    due_date: str | None = None


class TaskUpdate(BaseModel):
    project_id: UUID | None = None
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    due_date: str | None = None


@app.get("/tasks")
def get_tasks(project_id: UUID | None = None):
    try:
        query = (
            supabase.table("tasks")
            .select("*")
            .order("created_at", desc=True)
        )

        if project_id:
            query = query.eq("project_id", str(project_id))

        response = query.execute()

        return {
            "status": "success",
            "tasks": response.data
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/tasks")
def create_task(task: TaskCreate):
    try:
        task_data = task.model_dump(exclude_none=True)
        task_data["project_id"] = str(task.project_id)

        response = (
            supabase.table("tasks")
            .insert(task_data)
            .execute()
        )

        return {
            "status": "success",
            "task": response.data[0]
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.put("/tasks/{task_id}")
def update_task(task_id: UUID, task: TaskUpdate):
    try:
        updates = task.model_dump(exclude_unset=True)

        if updates.get("project_id"):
            updates["project_id"] = str(updates["project_id"])

        response = (
            supabase.table("tasks")
            .update(updates)
            .eq("id", str(task_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")

        return {
            "status": "success",
            "task": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.delete("/tasks/{task_id}")
def delete_task(task_id: UUID):
    try:
        response = (
            supabase.table("tasks")
            .delete()
            .eq("id", str(task_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")

        return {
            "status": "success",
            "deleted": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# ==========================================
# BUDGET & EXPENSE MANAGEMENT API
# ==========================================

class ExpenseCreate(BaseModel):
    project_id: UUID
    title: str
    category: str
    amount: float
    expense_date: str
    description: str | None = None


class ExpenseUpdate(BaseModel):
    project_id: UUID | None = None
    title: str | None = None
    category: str | None = None
    amount: float | None = None
    expense_date: str | None = None
    description: str | None = None


@app.get("/expenses")
def get_expenses(project_id: UUID | None = None):
    try:
        query = (
            supabase.table("expenses")
            .select("*")
            .order("created_at", desc=True)
        )

        if project_id:
            query = query.eq("project_id", str(project_id))

        response = query.execute()

        return {
            "status": "success",
            "expenses": response.data
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/expenses")
def create_expense(expense: ExpenseCreate):
    try:
        expense_data = expense.model_dump(exclude_none=True)
        expense_data["project_id"] = str(expense.project_id)

        response = (
            supabase.table("expenses")
            .insert(expense_data)
            .execute()
        )

        return {
            "status": "success",
            "expense": response.data[0]
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.put("/expenses/{expense_id}")
def update_expense(expense_id: UUID, expense: ExpenseUpdate):
    try:
        updates = expense.model_dump(exclude_unset=True)

        if updates.get("project_id"):
            updates["project_id"] = str(updates["project_id"])

        response = (
            supabase.table("expenses")
            .update(updates)
            .eq("id", str(expense_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Expense not found")

        return {
            "status": "success",
            "expense": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: UUID):
    try:
        response = (
            supabase.table("expenses")
            .delete()
            .eq("id", str(expense_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Expense not found")

        return {
            "status": "success",
            "deleted": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# ==========================================
# MATERIALS & INVENTORY MANAGEMENT API
# ==========================================

class MaterialCreate(BaseModel):
    project_id: UUID
    name: str
    category: str
    quantity: float
    unit: str
    unit_price: float
    minimum_stock: float = 0
    supplier: str | None = None


class MaterialUpdate(BaseModel):
    project_id: UUID | None = None
    name: str | None = None
    category: str | None = None
    quantity: float | None = None
    unit: str | None = None
    unit_price: float | None = None
    minimum_stock: float | None = None
    supplier: str | None = None


@app.get("/materials")
def get_materials(project_id: UUID | None = None):
    try:
        query = (
            supabase.table("materials")
            .select("*")
            .order("created_at", desc=True)
        )

        if project_id:
            query = query.eq("project_id", str(project_id))

        response = query.execute()

        return {
            "status": "success",
            "materials": response.data
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/materials")
def create_material(material: MaterialCreate):
    try:
        material_data = material.model_dump(exclude_none=True)
        material_data["project_id"] = str(material.project_id)

        response = (
            supabase.table("materials")
            .insert(material_data)
            .execute()
        )

        return {
            "status": "success",
            "material": response.data[0]
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.put("/materials/{material_id}")
def update_material(material_id: UUID, material: MaterialUpdate):
    try:
        updates = material.model_dump(exclude_unset=True)

        if updates.get("project_id"):
            updates["project_id"] = str(updates["project_id"])

        response = (
            supabase.table("materials")
            .update(updates)
            .eq("id", str(material_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Material not found")

        return {
            "status": "success",
            "material": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.delete("/materials/{material_id}")
def delete_material(material_id: UUID):
    try:
        response = (
            supabase.table("materials")
            .delete()
            .eq("id", str(material_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Material not found")

        return {
            "status": "success",
            "deleted": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# ==========================================
# AI CONSTRUCTION RISK ANALYSIS
# ==========================================

@app.post("/ai-risk-analysis")
def generate_risk_analysis():

    try:
        projects_response = (
            supabase.table("projects")
            .select("*")
            .execute()
        )

        tasks_response = (
            supabase.table("tasks")
            .select("*")
            .execute()
        )

        expenses_response = (
            supabase.table("expenses")
            .select("*")
            .execute()
        )

        materials_response = (
            supabase.table("materials")
            .select("*")
            .execute()
        )

        projects = projects_response.data or []
        tasks = tasks_response.data or []
        expenses = expenses_response.data or []
        materials = materials_response.data or []

        project_names = {
            str(project["id"]): project["name"]
            for project in projects
        }

        construction_data = {
            "analysis_date": str(date.today()),
            "projects": projects,
            "tasks": [
                {
                    **task,
                    "project_name": project_names.get(
                        str(task.get("project_id")),
                        "Unknown Project"
                    )
                }
                for task in tasks
            ],
            "expenses": [
                {
                    **expense,
                    "project_name": project_names.get(
                        str(expense.get("project_id")),
                        "Unknown Project"
                    )
                }
                for expense in expenses
            ],
            "materials": [
                {
                    **material,
                    "project_name": project_names.get(
                        str(material.get("project_id")),
                        "Unknown Project"
                    )
                }
                for material in materials
            ]
        }

        prompt = f"""
You are BuildWise AI, a professional construction risk analyst.

Analyze the following REAL construction project data.

DATA:
{construction_data}

Identify risks in these categories:

1. Schedule Risk:
- Overdue tasks
- Pending tasks
- Project delays

2. Budget Risk:
- Expenses exceeding project budget
- High budget utilization
- Potential overspending

3. Material Risk:
- Materials below minimum stock
- Insufficient inventory

IMPORTANT RULES:
- Only identify risks supported by the provided data.
- Never invent projects, expenses, tasks or materials.
- Compare material quantity with minimum_stock.
- Compare project expenses with the project budget.
- Use today's date for overdue task checks.
- If there is no evidence of a risk, do not invent one.
- If data is missing, mention that it cannot be assessed.

Return ONLY valid JSON using this exact structure:

{{
  "summary": "Short overall analysis",
  "risks": [
    {{
      "title": "Risk title",
      "project": "Actual project name",
      "category": "Material Risk",
      "level": "High",
      "description": "Evidence-based explanation",
      "recommendation": "Practical recommended action"
    }}
  ],
  "recommendations": [
    "Recommendation 1"
  ]
}}

Risk level must be exactly High, Medium or Low.
Category must be Schedule Risk, Budget Risk or Material Risk.
If no risks are identified, return an empty risks array.
Do not include markdown or code fences.
"""

        ai_response = generate_ai_response(prompt)

        return {
            "status": "success",
            "message": "AI construction risk analysis completed.",
            "data_summary": {
                "projects_analyzed": len(projects),
                "tasks_analyzed": len(tasks),
                "expenses_analyzed": len(expenses),
                "materials_analyzed": len(materials)
            },
            "analysis": ai_response
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI risk analysis failed: {str(error)}"
        )


# ==========================================
# AI MULTI-AGENT ORCHESTRATOR API
# ==========================================

class OrchestratorRequest(BaseModel):
    project_id: UUID
    user_query: str


@app.post("/orchestrator")
async def run_orchestrator(request: OrchestratorRequest):

    if not request.user_query.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid query."
        )

    try:
        result = await orchestrator_agent(
            project_id=str(request.project_id),
            user_query=request.user_query
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Orchestrator execution failed: {str(error)}"
        )