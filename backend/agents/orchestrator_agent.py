
import asyncio
import json
import re

from agents.project_management_agent import project_management_agent
from agents.financial_analysis_agent import financial_analysis_agent
from agents.construction_risk_agent import construction_risk_agent
from chatbot.gemini_service import generate_ai_response


ORCHESTRATOR_NAME = "BuildWise AI Orchestrator"


# ==========================================
# DIRECT CONVERSATION
# ==========================================

def get_direct_response(user_query: str):
    """Handle simple greetings and identity questions."""

    query = user_query.lower().strip()
    query = re.sub(r"[.!?,]+", "", query)

    identity_patterns = [
        r"what is your name",
        r"who are you",
        r"introduce yourself",
        r"tell me your name",
        r"your name"
    ]

    if any(re.search(pattern, query) for pattern in identity_patterns):
        return (
            "I am BuildWise AI, your AI-powered construction project "
            "assistant. I can help you manage projects, track tasks, "
            "monitor budgets, analyze construction risks, and manage "
            "material inventory."
        )

    greeting_patterns = [
        r"^(hi|hello|hey|salam|assalam o alaikum)$",
        r"^(good morning|good afternoon|good evening)$",
        r"^(how are you|how are you doing)$"
    ]

    if any(re.search(pattern, query) for pattern in greeting_patterns):
        return (
            "Hello! Welcome to BuildWise AI. "
            "How can I help you with your construction project today?"
        )

    return None


# ==========================================
# MULTI-AGENT INTENT DETECTION
# ==========================================

def is_overall_project_query(user_query: str):
    """
    Detect questions that require information from
    all three specialist agents.
    """

    query = user_query.lower()

    overall_keywords = [
        "overall condition",
        "overall health",
        "overall status",
        "overall assessment",
        "overall report",
        "complete project report",
        "comprehensive project report",
        "full project report",
        "entire project",
        "all aspects",
        "project health",
        "project performance",
        "project summary",
        "project overview report",
        "what should i prioritize",
        "what should we prioritize",
        "prioritize next",
        "priority next",
        "next priorities",
        "main priorities",
        "overall project analysis"
    ]

    return any(keyword in query for keyword in overall_keywords)


# ==========================================
# SPECIALIST DETECTION
# ==========================================

def detect_specialist(user_query: str):
    """Route specific construction queries to the correct agent."""

    query = user_query.lower()

    financial_keywords = [
        "budget",
        "expense",
        "expenses",
        "spending",
        "financial",
        "finance",
        "cost",
        "payment",
        "remaining amount",
        "remaining budget",
        "overspending",
        "cash flow",
        "profit"
    ]

    risk_keywords = [
        "material",
        "materials",
        "inventory",
        "stock",
        "shortage",
        "low stock",
        "safety",
        "hazard",
        "construction risk",
        "risk assessment",
        "accident",
        "equipment"
    ]

    project_keywords = [
        "project",
        "progress",
        "task",
        "tasks",
        "deadline",
        "schedule",
        "timeline",
        "milestone",
        "project status",
        "completion",
        "work breakdown",
        "project details",
        "project overview"
    ]

    if any(keyword in query for keyword in financial_keywords):
        return "financial_analysis"

    if any(keyword in query for keyword in risk_keywords):
        return "construction_risk"

    if any(keyword in query for keyword in project_keywords):
        return "project_management"

    return None


# ==========================================
# MULTI-AGENT EXECUTION
# ==========================================

async def run_all_specialists(project_id: str, user_query: str):
    """
    Execute all three specialist agents concurrently
    and collect their actual project analysis.
    """

    agents = {
        "project_management": project_management_agent,
        "financial_analysis": financial_analysis_agent,
        "construction_risk": construction_risk_agent
    }

    agent_names = list(agents.keys())

    tasks = [
        agent(
            project_id=project_id,
            user_query=user_query
        )
        for agent in agents.values()
    ]

    results = await asyncio.gather(
        *tasks,
        return_exceptions=True
    )

    combined_results = {}
    successful_agents = []
    failed_agents = []

    for agent_name, result in zip(agent_names, results):

        if isinstance(result, Exception):
            failed_agents.append({
                "agent": agent_name,
                "error": str(result)
            })
            continue

        if not isinstance(result, dict):
            failed_agents.append({
                "agent": agent_name,
                "error": "Invalid response format"
            })
            continue

        if result.get("status") != "success":
            failed_agents.append({
                "agent": agent_name,
                "error": result.get("message", "Agent execution failed")
            })
            continue

        combined_results[agent_name] = result
        successful_agents.append(agent_name)

    return {
        "combined_results": combined_results,
        "successful_agents": successful_agents,
        "failed_agents": failed_agents
    }


# ==========================================
# CONSOLIDATED PROJECT ANALYSIS
# ==========================================

async def generate_overall_project_report(
    project_id: str,
    user_query: str
):
    """
    Generate a consolidated project report using
    financial, risk and project management analysis.
    """

    agent_data = await run_all_specialists(
        project_id=project_id,
        user_query=user_query
    )

    combined_results = agent_data["combined_results"]

    if not combined_results:
        return {
            "status": "error",
            "message": "All specialist agents failed to retrieve project data.",
            "failed_agents": agent_data["failed_agents"]
        }

    project_data = json.dumps(
        combined_results,
        indent=2,
        ensure_ascii=False,
        default=str
    )

    failed_agents = json.dumps(
        agent_data["failed_agents"],
        indent=2,
        ensure_ascii=False
    )

    report_prompt = f"""
You are BuildWise AI, an expert construction project
management and multi-agent analysis system.

Your task is to prepare a consolidated project assessment
using the actual results of three specialist agents.

USER QUESTION:
{user_query}

SPECIALIST AGENT DATA:

{project_data}

FAILED AGENTS, IF ANY:

{failed_agents}

IMPORTANT DATA ACCURACY RULES:

1. Use only the information provided by the specialist agents.
2. Never invent project information, expenses, tasks,
   dates, material quantities or financial figures.
3. Keep the project budget separate from project progress.
4. Project progress must be reported as a percentage.
5. Never describe the budget amount as project progress.
6. Do not calculate task completion percentage when
   no task records are available.
7. Do not assume a currency if it is not specified.
8. Clearly identify missing information and data gaps.
9. Distinguish confirmed risks from potential risks.
10. Do not describe missing records as proof that
    the project has no real-world problems.
11. Use the latest analysis date available in the data.
12. If an agent failed, clearly mention that its analysis
    is unavailable. Do not fabricate its findings.
13. Do not repeat the same information unnecessarily.

REPORT STRUCTURE:

1. Executive Summary
2. Project Overview
3. Project Progress and Management Assessment
4. Financial Health Assessment
5. Construction Risk and Material Assessment
6. Major Issues and Data Gaps
7. Recommended Priorities
8. Overall Project Assessment

RECOMMENDATIONS:

- Prioritize actions based on actual project data.
- Explain why each action is important.
- Separate immediate priorities from future improvements.
- Keep recommendations practical and relevant to
  the current project stage.

FINAL REQUIREMENT:

Provide a professional, clearly structured and
easy-to-understand consolidated report.

Answer the user's actual question directly.
"""

    response = await asyncio.to_thread(
        generate_ai_response,
        report_prompt
    )

    if not response or not str(response).strip():
        return {
            "status": "error",
            "message": "Unable to generate the consolidated project report."
        }

    return {
        "status": "success",
        "agent": "BuildWise AI Multi-Agent Orchestrator",
        "project_id": project_id,
        "successful_agents": agent_data["successful_agents"],
        "failed_agents": agent_data["failed_agents"],
        "analysis": str(response).strip(),
        "specialist_data": combined_results
    }


# ==========================================
# MAIN ORCHESTRATOR
# ==========================================

async def orchestrator_agent(
    project_id: str,
    user_query: str
):
    """
    Route user queries to individual specialist agents,
    general Gemini conversation or all three agents.
    """

    try:

        if not user_query or not user_query.strip():
            return {
                "status": "error",
                "orchestrator": ORCHESTRATOR_NAME,
                "message": "Please enter a question."
            }

        # 1. Handle greetings and identity questions

        direct_response = get_direct_response(user_query)

        if direct_response:
            return {
                "status": "success",
                "orchestrator": ORCHESTRATOR_NAME,
                "selected_agent": "general_conversation",
                "user_query": user_query,
                "result": {
                    "status": "success",
                    "agent": "BuildWise AI Assistant",
                    "response": direct_response
                }
            }

        # 2. Detect questions requiring all three agents

        if is_overall_project_query(user_query):

            if not project_id:
                return {
                    "status": "error",
                    "orchestrator": ORCHESTRATOR_NAME,
                    "message": "Please select a project before requesting an overall project assessment."
                }

            result = await generate_overall_project_report(
                project_id=project_id,
                user_query=user_query
            )

            if result.get("status") != "success":
                return {
                    "status": "error",
                    "orchestrator": ORCHESTRATOR_NAME,
                    "selected_agent": "multi_agent_orchestrator",
                    "result": result
                }

            return {
                "status": "success",
                "orchestrator": ORCHESTRATOR_NAME,
                "selected_agent": "multi_agent_orchestrator",
                "user_query": user_query,
                "result": result
            }

        # 3. Detect a single relevant specialist

        selected_agent = detect_specialist(user_query)

        # 4. General conversation

        if selected_agent is None:

            general_prompt = f"""
You are BuildWise AI, a helpful construction project assistant.

Answer the user's question naturally, clearly and concisely.

IMPORTANT RULES:
- Do not automatically generate a project report.
- Do not invent project information.
- Do not analyze project data unless the user asks.
- Do not select a specialist for general conversation.
- If asked your name, say you are BuildWise AI.
- If information is missing, ask a relevant follow-up question.
- Keep answers focused on the user's actual question.

USER QUESTION:
{user_query}

Provide a direct conversational answer.
"""

            response = await asyncio.to_thread(
                generate_ai_response,
                general_prompt
            )

            return {
                "status": "success",
                "orchestrator": ORCHESTRATOR_NAME,
                "selected_agent": "general_conversation",
                "user_query": user_query,
                "result": {
                    "status": "success",
                    "agent": "BuildWise AI Assistant",
                    "response": str(response).strip()
                }
            }

        # 5. Execute only the selected specialist

        agent_functions = {
            "project_management": project_management_agent,
            "financial_analysis": financial_analysis_agent,
            "construction_risk": construction_risk_agent
        }

        if not project_id:
            return {
                "status": "error",
                "orchestrator": ORCHESTRATOR_NAME,
                "selected_agent": selected_agent,
                "message": "Please select a project before requesting project analysis."
            }

        result = await agent_functions[selected_agent](
            project_id=project_id,
            user_query=user_query
        )

        # 6. Validate specialist response

        if not isinstance(result, dict):
            return {
                "status": "error",
                "orchestrator": ORCHESTRATOR_NAME,
                "selected_agent": selected_agent,
                "message": "Specialist returned an invalid response."
            }

        if result.get("status") != "success":
            return {
                "status": "error",
                "orchestrator": ORCHESTRATOR_NAME,
                "selected_agent": selected_agent,
                "user_query": user_query,
                "result": result
            }

        # 7. Return specialist result

        return {
            "status": "success",
            "orchestrator": ORCHESTRATOR_NAME,
            "selected_agent": selected_agent,
            "user_query": user_query,
            "result": result
        }

    except Exception as error:

        return {
            "status": "error",
            "orchestrator": ORCHESTRATOR_NAME,
            "message": str(error)
        }
