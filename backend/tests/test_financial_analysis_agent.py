
import asyncio

import agents.financial_analysis_agent as agent


PROJECT_ID = "dfe46451-2415-4683-aa70-1a1669362395"


def run_async(coroutine):
    return asyncio.run(coroutine)


def test_financial_analysis_success(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        if tool_name == "get_budget_summary":
            return {
                "is_error": False,
                "content": ["Budget summary retrieved"]
            }

        if tool_name == "get_expense_records":
            return {
                "is_error": False,
                "content": ["Expense records retrieved"]
            }

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)
    monkeypatch.setattr(
        agent,
        "generate_ai_response",
        lambda prompt: "Financial analysis completed successfully."
    )

    result = run_async(
        agent.financial_analysis_agent(
            PROJECT_ID,
            "Analyze project budget and expenses."
        )
    )

    assert result["status"] == "success"
    assert result["agent"] == "Financial Analysis Agent"
    assert result["skill"] == "Financial Analysis Skill"
    assert result["analysis"] == "Financial analysis completed successfully."


def test_budget_summary_error(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        return {"is_error": True}

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)

    result = run_async(
        agent.financial_analysis_agent(
            PROJECT_ID,
            "Analyze project budget."
        )
    )

    assert result["status"] == "error"
    assert result["message"] == "Unable to retrieve budget summary."


def test_expense_records_error(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        if tool_name == "get_budget_summary":
            return {"is_error": False}

        return {"is_error": True}

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)

    result = run_async(
        agent.financial_analysis_agent(
            PROJECT_ID,
            "Analyze project expenses."
        )
    )

    assert result["status"] == "error"
    assert result["message"] == "Unable to retrieve expense records."


def test_financial_skill_missing(monkeypatch):
    monkeypatch.setattr(
        agent,
        "load_financial_skill",
        lambda: (_ for _ in ()).throw(
            FileNotFoundError("Financial Skill file missing")
        )
    )

    result = run_async(
        agent.financial_analysis_agent(
            PROJECT_ID,
            "Analyze project budget."
        )
    )

    assert result["status"] == "error"
    assert "Financial Skill file missing" in result["message"]


def test_financial_gemini_error(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        return {"is_error": False}

    def fake_gemini(prompt):
        raise RuntimeError("Gemini test error")

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)
    monkeypatch.setattr(agent, "generate_ai_response", fake_gemini)

    result = run_async(
        agent.financial_analysis_agent(
            PROJECT_ID,
            "Analyze project financial risks."
        )
    )

    assert result["status"] == "error"
    assert "Gemini test error" in result["message"]
