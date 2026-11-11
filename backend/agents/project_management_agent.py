
import asyncio
import json
from datetime import date
from pathlib import Path

from agents.mcp_client import call_mcp_tool
from chatbot.gemini_service import generate_ai_response


# ==========================================
# LOAD PROJECT MANAGEMENT SKILL
# ==========================================

BACKEND_DIR = Path(__file__).resolve().parent.parent
SKILL_FILE = BACKEND_DIR / "skills" / "project_management_skill.md"


def load_project_management_skill():
    """Load Project Management Skill instructions."""

    if not SKILL_FILE.exists():
        raise FileNotFoundError(
            f"Project Management Skill not found: {SKILL_FILE}"
        )

    return SKILL_FILE.read_text(encoding="utf-8")


# ==========================================
# MCP RESPONSE HANDLING
# ==========================================

def extract_mcp_data(result: dict) -> dict:
    """Extract actual data from MCP tool response."""

    if not isinstance(result, dict):
        raise ValueError("Invalid MCP response format.")

    if result.get("is_error"):
        raise ValueError("MCP tool execution failed.")

    structured_content = result.get("structured_content")

    if isinstance(structured_content, dict):
        return structured_content

    # Fallback: Parse JSON from text content
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
        "Unable to extract actual project data from MCP response."
    )


def validate_mcp_data(data: dict, tool_name: str):
    """Validate MCP tool-level errors."""

    if data.get("status") == "error":
        raise ValueError(
            f"{tool_name} failed: "
            f"{data.get('message', 'Unknown MCP error.')}"
        )


# ==========================================
# PROJECT MANAGEMENT AGENT
# ==========================================

async def project_management_agent(
    project_id: str,
    user_query: str
):
    """
    Analyze actual construction project details and tasks
    using MCP tools, Project Management Skill, and Gemini.
    """

    try:

        # 1. Load specialist skill
        skill_instructions = load_project_management_skill()

        # 2. Retrieve actual project details
        project_result = await call_mcp_tool(
            "get_project_details",
            {"project_id": project_id}
        )

        project_data = extract_mcp_data(project_result)
        validate_mcp_data(project_data, "Project details")

        project = project_data.get("project")

        if not isinstance(project, dict):
            raise ValueError("Project details are unavailable.")

        # 3. Retrieve actual project tasks
        tasks_result = await call_mcp_tool(
            "get_project_tasks",
            {"project_id": project_id}
        )

        tasks_data = extract_mcp_data(tasks_result)
        validate_mcp_data(tasks_data, "Project tasks")

        tasks = tasks_data.get("tasks", [])

        if not isinstance(tasks, list):
            raise ValueError("Invalid project tasks format.")

        # 4. Prepare clean project data
        project_information = {
            "project_id": project_id,
            "project_name": project.get("name"),
            "location": project.get("location"),
            "description": project.get("description"),
            "status": project.get("status"),
            "progress": project.get("progress"),
            "budget": project.get("budget"),
            "start_date": project.get("start_date"),
            "end_date": project.get("end_date")
        }

        project_data_for_ai = {
            "project_details": project_information,
            "tasks": tasks,
            "task_summary": {
                "total_tasks": len(tasks),
                "project_name": project.get("name")
            },
            "analysis_date": date.today().isoformat()
        }

        # 5. Build specialist prompt
        prompt = f"""
You are the BuildWise AI Project Management Agent.

Your responsibility is to provide accurate,
project-specific construction project analysis.

PROJECT MANAGEMENT SKILL:
{skill_instructions}

ACTUAL PROJECT DATA RETRIEVED THROUGH MCP:
{json.dumps(project_data_for_ai, indent=2, default=str)}

USER QUESTION:
{user_query}

IMPORTANT ANALYSIS RULES:

1. Use only the actual project data supplied above.

2. Never invent project details, tasks, milestones,
   dates, budgets, or completion percentages.

3. Clearly identify missing project information.

4. Use the actual project progress value when available.

5. Do not confuse project progress with task completion.

6. If no tasks are recorded, explicitly state:
   "No task records are currently available for this project."

7. Do not invent completed, pending, or overdue tasks.

8. Identify overdue tasks only when a valid due date
   is earlier than the analysis date:
   {date.today().isoformat()}

9. Do not classify future deadlines as overdue.

10. Do not assume that a project is delayed only
    because its progress percentage is low.

11. If project start or end dates are missing,
    clearly mention that timeline assessment is limited.

12. Never assume or invent a currency.

13. Answer the user's actual question first.

14. Do not ask the user to provide information
    that is already available in the supplied data.

15. Follow the response structure defined in
    the Project Management Skill.

16. Provide practical and actionable recommendations
    based on actual project information.

Generate a complete, professional,
project-specific project management analysis.
"""

        # 6. Generate AI analysis without blocking event loop
        response = await asyncio.to_thread(
            generate_ai_response,
            prompt
        )

        if not response or not str(response).strip():
            raise ValueError(
                "Gemini returned an empty project analysis."
            )

        # 7. Return final result
        return {
            "status": "success",
            "agent": "Project Management Agent",
            "skill": "Project Management Skill",
            "project_id": project_id,
            "project_name": project.get("name"),
            "total_tasks": len(tasks),
            "analysis": str(response).strip()
        }

    except Exception as error:

        return {
            "status": "error",
            "agent": "Project Management Agent",
            "project_id": project_id,
            "message": str(error)
        }
