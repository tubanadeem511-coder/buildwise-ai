
import asyncio
import json
from datetime import date
from pathlib import Path

from agents.mcp_client import call_mcp_tool
from chatbot.gemini_service import generate_ai_response


# ==========================================
# LOAD CONSTRUCTION RISK SKILL
# ==========================================

BACKEND_DIR = Path(__file__).resolve().parent.parent
SKILL_FILE = BACKEND_DIR / "skills" / "construction_risk_skill.md"


def load_construction_risk_skill():
    """Load Construction Risk Skill instructions."""

    if not SKILL_FILE.exists():
        raise FileNotFoundError(
            f"Construction Risk Skill not found: {SKILL_FILE}"
        )

    return SKILL_FILE.read_text(encoding="utf-8")


# ==========================================
# MCP RESPONSE HANDLING
# ==========================================

def extract_mcp_data(result: dict) -> dict:
    """Extract actual tool data from an MCP response."""

    if not isinstance(result, dict):
        raise ValueError("Invalid MCP response format.")

    if result.get("is_error"):
        raise ValueError("MCP tool execution failed.")

    structured_content = result.get("structured_content")

    if isinstance(structured_content, dict):
        return structured_content

    # Fallback: Parse JSON from MCP text content
    content = result.get("content", [])

    for item in content:
        if isinstance(item, str):
            try:
                parsed = json.loads(item)

                if isinstance(parsed, dict):
                    return parsed

            except json.JSONDecodeError:
                continue

    raise ValueError(
        "Unable to extract actual data from MCP response."
    )


def validate_mcp_data(data: dict, tool_name: str):
    """Check MCP tool-level errors."""

    if data.get("status") == "error":
        raise ValueError(
            f"{tool_name} failed: "
            f"{data.get('message', 'Unknown MCP error.')}"
        )


# ==========================================
# CONSTRUCTION RISK AGENT
# ==========================================

async def construction_risk_agent(
    project_id: str,
    user_query: str
):
    """
    Analyze actual construction project risks using
    MCP tools, Construction Risk Skill, and Gemini.
    """

    try:

        # 1. Load specialist skill
        risk_skill = load_construction_risk_skill()

        # 2. Retrieve project details
        project_result = await call_mcp_tool(
            "get_project_details",
            {"project_id": project_id}
        )

        project_data = extract_mcp_data(project_result)
        validate_mcp_data(project_data, "Project details")

        project = project_data.get("project")

        if not isinstance(project, dict):
            raise ValueError("Project details are unavailable.")

        # 3. Retrieve material stock
        stock_result = await call_mcp_tool(
            "check_material_stock",
            {"project_id": project_id}
        )

        stock_data = extract_mcp_data(stock_result)
        validate_mcp_data(stock_data, "Material stock")

        # 4. Retrieve project tasks
        task_result = await call_mcp_tool(
            "get_project_tasks",
            {"project_id": project_id}
        )

        task_data = extract_mcp_data(task_result)
        validate_mcp_data(task_data, "Project tasks")

        tasks = task_data.get("tasks", [])

        if not isinstance(tasks, list):
            raise ValueError("Invalid project tasks format.")

        # 5. Retrieve expense records
        expense_result = await call_mcp_tool(
            "get_expense_records",
            {"project_id": project_id}
        )

        expense_data = extract_mcp_data(expense_result)
        validate_mcp_data(expense_data, "Expense records")

        expenses = expense_data.get("expenses", [])

        if not isinstance(expenses, list):
            raise ValueError("Invalid expense records format.")

        # 6. Extract actual material records
        materials = stock_data.get("all_materials", [])

        if not isinstance(materials, list):
            raise ValueError("Invalid material records format.")

        # 7. Prepare actual project data
        risk_data = {
            "project": {
                "project_id": project_id,
                "project_name": project.get("name"),
                "location": project.get("location"),
                "status": project.get("status"),
                "progress": project.get("progress"),
                "budget": project.get("budget"),
                "start_date": project.get("start_date"),
                "end_date": project.get("end_date")
            },
            "material_assessment": {
                "total_materials": stock_data.get("total_materials"),
                "low_stock_count": stock_data.get("low_stock_count"),
                "low_stock_materials": stock_data.get(
                    "low_stock_materials", []
                ),
                "all_materials": materials
            },
            "tasks": tasks,
            "expenses": expenses,
            "data_summary": {
                "total_tasks": len(tasks),
                "total_materials": len(materials),
                "low_stock_materials": stock_data.get(
                    "low_stock_count", 0
                ),
                "total_expense_records": len(expenses)
            },
            "analysis_date": date.today().isoformat()
        }

        # 8. Build specialist prompt
        prompt = f"""
You are the BuildWise AI Construction Risk Agent.

Your responsibility is to analyze real construction
project information and identify supported risks.

CONSTRUCTION RISK SKILL:
{risk_skill}

ACTUAL PROJECT DATA RETRIEVED THROUGH MCP:
{json.dumps(risk_data, indent=2, default=str)}

USER QUESTION:
{user_query}

IMPORTANT ANALYSIS RULES:

1. Use only the actual project data supplied above.

2. Never invent project details, tasks, materials,
   expenses, dates, or records.

3. Identify low-stock materials when actual quantity
   is less than or equal to minimum stock.

4. Use actual quantity and minimum_stock values
   when explaining material risks.

5. Identify overdue tasks only when a valid due date
   is earlier than the analysis date:
   {date.today().isoformat()}

6. Do not classify future deadlines as overdue.

7. Distinguish confirmed risks from potential risks.

8. Assign High, Medium, or Low severity only
   when supported by actual project evidence.

9. If task, material, or expense records are empty,
   explicitly mention that no records were found.

10. Do not assume missing project information.

11. Do not assume or invent a currency.
    If currency is missing, display amounts as plain numbers.

12. Do not claim that a project is delayed merely
    because its progress percentage is low.
    Use available dates and task records as evidence.

13. Answer the user's actual question first.

14. Do not ask the user to manually provide information
    that is already available in the supplied data.

15. Follow the response structure defined in
    the Construction Risk Skill.

16. If no significant risks are supported by the data,
    state that clearly and explain any data limitations.

17. Provide practical preventive and corrective actions.

Generate a complete, professional,
project-specific construction risk analysis.
"""

        # 9. Generate final risk analysis
        response = await asyncio.to_thread(
            generate_ai_response,
            prompt
        )

        if not response or not str(response).strip():
            raise ValueError(
                "Gemini returned an empty risk analysis."
            )

        # 10. Return final result
        return {
            "status": "success",
            "agent": "Construction Risk Agent",
            "skill": "Construction Risk Skill",
            "project_id": project_id,
            "project_name": project.get("name"),
            "data_summary": risk_data["data_summary"],
            "analysis": str(response).strip()
        }

    except Exception as error:

        return {
            "status": "error",
            "agent": "Construction Risk Agent",
            "project_id": project_id,
            "message": str(error)
        }
