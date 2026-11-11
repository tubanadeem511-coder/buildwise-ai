
import asyncio
import json
from decimal import Decimal, InvalidOperation
from pathlib import Path

from agents.mcp_client import call_mcp_tool
from chatbot.gemini_service import generate_ai_response


# ==========================================
# LOAD FINANCIAL ANALYSIS SKILL
# ==========================================

BACKEND_DIR = Path(__file__).resolve().parent.parent
SKILL_FILE = BACKEND_DIR / "skills" / "financial_analysis_skill.md"


def load_financial_skill():
    """Load Financial Analysis Skill instructions."""

    if not SKILL_FILE.exists():
        raise FileNotFoundError(
            f"Financial Analysis Skill not found: {SKILL_FILE}"
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

    # Prefer structured content
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

    raise ValueError("Unable to extract actual data from MCP response.")


def validate_mcp_data(data: dict, tool_name: str):
    """Check whether an MCP tool returned a successful result."""

    if data.get("status") == "error":
        raise ValueError(
            f"{tool_name} failed: "
            f"{data.get('message', 'Unknown MCP error.')}"
        )


# ==========================================
# FINANCIAL CALCULATIONS
# ==========================================

def to_decimal(value):
    """Safely convert a numeric value to Decimal."""

    if value is None:
        return None

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def calculate_financial_metrics(
    project_budget,
    expenses
):
    """Calculate financial metrics using actual database records."""

    total_budget = to_decimal(project_budget)

    expense_amounts = [
        to_decimal(expense.get("amount"))
        for expense in expenses
        if isinstance(expense, dict)
    ]

    valid_amounts = [
        amount for amount in expense_amounts
        if amount is not None
    ]

    total_expenses = sum(valid_amounts, Decimal("0"))

    # Do not calculate remaining budget if budget is missing.
    if total_budget is None:
        remaining_budget = None
        utilization = None

    else:
        remaining_budget = total_budget - total_expenses

        utilization = (
            round(
                (total_expenses / total_budget) * 100,
                2
            )
            if total_budget > 0
            else None
        )

    return {
        "total_budget": (
            float(total_budget)
            if total_budget is not None
            else None
        ),
        "total_expenses": float(total_expenses),
        "remaining_budget": (
            float(remaining_budget)
            if remaining_budget is not None
            else None
        ),
        "budget_utilization_percentage": (
            float(utilization)
            if utilization is not None
            else None
        ),
        "expense_records_count": len(expenses),
        "unreadable_expense_amounts": (
            len(expense_amounts) - len(valid_amounts)
        )
    }


# ==========================================
# FINANCIAL ANALYSIS AGENT
# ==========================================

async def financial_analysis_agent(
    project_id: str,
    user_query: str
):
    """
    Analyze construction project budgets and expenses
    using MCP tools, Financial Analysis Skill, and Gemini.
    """

    try:

        # 1. Load Financial Analysis Skill
        financial_skill = load_financial_skill()

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

        # 3. Retrieve budget summary
        budget_result = await call_mcp_tool(
            "get_budget_summary",
            {"project_id": project_id}
        )

        budget_data = extract_mcp_data(budget_result)
        validate_mcp_data(budget_data, "Budget summary")

        # 4. Retrieve expense records
        expense_result = await call_mcp_tool(
            "get_expense_records",
            {"project_id": project_id}
        )

        expense_data = extract_mcp_data(expense_result)
        validate_mcp_data(expense_data, "Expense records")

        expenses = expense_data.get("expenses", [])

        if not isinstance(expenses, list):
            raise ValueError("Invalid expense records format.")

        # 5. Calculate metrics using actual project budget
        metrics = calculate_financial_metrics(
            project.get("budget"),
            expenses
        )

        # 6. Prepare clean financial data for Gemini
        financial_data = {
            "project": {
                "project_id": project_id,
                "project_name": project.get("name"),
                "budget": project.get("budget"),
                "status": project.get("status")
            },
            "budget_summary": {
                **metrics
            },
            "expense_records": expenses,
            "currency": (
                "Currency not specified in project records."
            )
        }

        # 7. Build specialist prompt
        prompt = f"""
You are the BuildWise AI Financial Analysis Agent.

Your task is to provide accurate, professional,
project-specific financial analysis.

FINANCIAL ANALYSIS SKILL:
{financial_skill}

ACTUAL PROJECT FINANCIAL DATA:
{json.dumps(financial_data, indent=2, default=str)}

USER QUESTION:
{user_query}

IMPORTANT ANALYSIS RULES:

1. Use only the actual project data supplied above.

2. Never invent budgets, expenses, amounts,
   expense categories, or financial records.

3. Never assume or invent a currency.

4. Do not use $, USD, PKR, Rs, or any currency symbol.

5. Display financial amounts as plain numbers.

6. If currency is unavailable, explicitly state:
   "Currency not specified in project records."

7. Use the supplied calculated financial metrics.
   Do not invent alternative figures.

8. If total budget is null, clearly state that
   the project budget is not available.

9. If remaining budget or utilization is null,
   explain why it cannot be calculated.

10. If expense records are empty, explicitly state
    that no recorded expenses were found.

11. If expense amounts are missing or unreadable,
    disclose this limitation.

12. Distinguish recorded expenses from estimated
    future costs.

13. Identify overspending only when actual data
    supports that conclusion.

14. Follow the response structure in the skill.

15. Answer the user's actual question first.

16. Provide practical recommendations based
    on the available financial evidence.

Do not ask the user to manually provide information
that is already available in the supplied data.

Generate a complete and professional analysis.
"""

        # 8. Generate AI analysis without blocking the event loop
        response = await asyncio.to_thread(
            generate_ai_response,
            prompt
        )

        if not response or not str(response).strip():
            raise ValueError(
                "Gemini returned an empty financial analysis."
            )

        # 9. Return final result
        return {
            "status": "success",
            "agent": "Financial Analysis Agent",
            "skill": "Financial Analysis Skill",
            "project_id": project_id,
            "project_name": project.get("name"),
            "financial_metrics": metrics,
            "analysis": str(response).strip()
        }

    except Exception as error:

        return {
            "status": "error",
            "agent": "Financial Analysis Agent",
            "project_id": project_id,
            "message": str(error)
        }
