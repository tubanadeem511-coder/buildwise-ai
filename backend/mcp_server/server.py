import sys
import os
import io
import json
from pathlib import Path
from contextlib import redirect_stdout
from typing import Any

from mcp.server.fastmcp import FastMCP

# Add backend directory to Python path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

# Import Supabase client without printing to MCP stdout
with redirect_stdout(io.StringIO()):
    from database.supabase_client import supabase
    from chatbot.gemini_service import generate_ai_response

mcp = FastMCP("BuildWise AI Construction Tools")


def fetch_project(project_id: str) -> dict[str, Any] | None:
    """Fetch one project from Supabase."""
    response = (
        supabase.table("projects")
        .select("*")
        .eq("id", project_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def fetch_project_data(table_name: str, project_id: str) -> list[dict[str, Any]]:
    """Fetch records belonging to a project."""
    response = (
        supabase.table(table_name)
        .select("*")
        .eq("project_id", project_id)
        .execute()
    )

    return response.data or []


@mcp.tool()
def get_project_details(project_id: str) -> dict:
    """Get complete details of a construction project using its project ID."""
    try:
        project = fetch_project(project_id)

        if not project:
            return {"status": "error", "message": "Project not found."}

        return {"status": "success", "project": project}

    except Exception as error:
        return {"status": "error", "message": str(error)}


@mcp.tool()
def get_project_tasks(project_id: str) -> dict:
    """Get all tasks associated with a construction project."""
    try:
        project = fetch_project(project_id)

        if not project:
            return {"status": "error", "message": "Project not found."}

        tasks = fetch_project_data("tasks", project_id)

        return {
            "status": "success",
            "project_name": project.get("name"),
            "total_tasks": len(tasks),
            "tasks": tasks,
        }

    except Exception as error:
        return {"status": "error", "message": str(error)}


@mcp.tool()
def get_budget_summary(project_id: str) -> dict:
    """Calculate project budget, total expenses, and remaining budget."""
    try:
        project = fetch_project(project_id)

        if not project:
            return {"status": "error", "message": "Project not found."}

        expenses = fetch_project_data("expenses", project_id)

        total_budget = float(project.get("budget") or 0)
        total_expenses = sum(
            float(expense.get("amount") or 0)
            for expense in expenses
        )
        remaining_budget = total_budget - total_expenses

        utilization = (
            (total_expenses / total_budget) * 100
            if total_budget > 0
            else 0
        )

        return {
            "status": "success",
            "project_name": project.get("name"),
            "total_budget": total_budget,
            "total_expenses": total_expenses,
            "remaining_budget": remaining_budget,
            "budget_utilization_percentage": round(utilization, 2),
        }

    except Exception as error:
        return {"status": "error", "message": str(error)}


@mcp.tool()
def get_expense_records(project_id: str) -> dict:
    """Retrieve all expense records for a construction project."""
    try:
        project = fetch_project(project_id)

        if not project:
            return {"status": "error", "message": "Project not found."}

        expenses = fetch_project_data("expenses", project_id)

        return {
            "status": "success",
            "project_name": project.get("name"),
            "total_records": len(expenses),
            "expenses": expenses,
        }

    except Exception as error:
        return {"status": "error", "message": str(error)}


@mcp.tool()
def check_material_stock(project_id: str) -> dict:
    """Check material inventory and identify items at or below minimum stock."""
    try:
        project = fetch_project(project_id)

        if not project:
            return {"status": "error", "message": "Project not found."}

        materials = fetch_project_data("materials", project_id)

        low_stock_materials = [
            material
            for material in materials
            if float(material.get("quantity") or 0)
            <= float(material.get("minimum_stock") or 0)
        ]

        total_inventory_value = sum(
            float(material.get("quantity") or 0)
            * float(material.get("unit_price") or 0)
            for material in materials
        )

        return {
            "status": "success",
            "project_name": project.get("name"),
            "total_materials": len(materials),
            "low_stock_count": len(low_stock_materials),
            "total_inventory_value": total_inventory_value,
            "low_stock_materials": low_stock_materials,
            "all_materials": materials,
        }

    except Exception as error:
        return {"status": "error", "message": str(error)}


@mcp.tool()
def generate_project_risk_report(project_id: str) -> dict:
    """Generate an AI-powered construction risk report for a specific project."""
    try:
        project = fetch_project(project_id)

        if not project:
            return {"status": "error", "message": "Project not found."}

        tasks = fetch_project_data("tasks", project_id)
        expenses = fetch_project_data("expenses", project_id)
        materials = fetch_project_data("materials", project_id)

        project_data = {
            "project": project,
            "tasks": tasks,
            "expenses": expenses,
            "materials": materials,
        }

        prompt = f"""
You are BuildWise AI, an expert construction project risk analyst.

Analyze the following real construction project data.

PROJECT DATA:
{json.dumps(project_data, indent=2, default=str)}

Identify:
1. Budget and financial risks.
2. Delayed or overdue task risks.
3. Material shortage and inventory risks.
4. Project progress and operational risks.
5. Practical recommendations to reduce identified risks.

Return a structured report containing:
- Project name
- Overall risk level (High, Medium, or Low)
- Executive summary
- Identified risks with category, severity, description, and recommendation
- Actionable recommendations

Only identify risks supported by the supplied data.
Do not invent missing information.
"""

        analysis = generate_ai_response(prompt)

        return {
            "status": "success",
            "project_name": project.get("name"),
            "message": "AI project risk report generated successfully.",
            "data_summary": {
                "tasks_analyzed": len(tasks),
                "expenses_analyzed": len(expenses),
                "materials_analyzed": len(materials),
            },
            "analysis": analysis,
        }

    except Exception as error:
        return {"status": "error", "message": str(error)}


if __name__ == "__main__":
    mcp.run(transport="stdio")