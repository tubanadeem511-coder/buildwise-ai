
import asyncio

import agents.construction_risk_agent as agent


PROJECT_ID = "dfe46451-2415-4683-aa70-1a1669362395"


def run_async(coroutine):
    return asyncio.run(coroutine)


def test_construction_risk_success(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        if tool_name == "check_material_stock":
            return {
                "is_error": False,
                "content": ["Material stock retrieved"]
            }

        if tool_name == "generate_project_risk_report":
            return {
                "is_error": False,
                "structured_content": {"status": "success"},
                "content": ["Project risk data retrieved"]
            }

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)
    monkeypatch.setattr(
        agent,
        "generate_ai_response",
        lambda prompt: "Construction risk analysis completed."
    )

    result = run_async(
        agent.construction_risk_agent(
            PROJECT_ID,
            "Analyze construction risks."
        )
    )

    assert result["status"] == "success"
    assert result["agent"] == "Construction Risk Agent"
    assert result["skill"] == "Construction Risk Skill"
    assert result["analysis"] == "Construction risk analysis completed."


def test_material_stock_error(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        return {"is_error": True}

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)

    result = run_async(
        agent.construction_risk_agent(
            PROJECT_ID,
            "Check material stock."
        )
    )

    assert result["status"] == "error"
    assert result["message"] == "Unable to check material stock."


def test_project_risk_data_error(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        if tool_name == "check_material_stock":
            return {"is_error": False}

        return {"is_error": True}

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)

    result = run_async(
        agent.construction_risk_agent(
            PROJECT_ID,
            "Analyze construction risks."
        )
    )

    assert result["status"] == "error"
    assert result["message"] == "Unable to retrieve project risk data."


def test_mcp_risk_report_error(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        if tool_name == "check_material_stock":
            return {"is_error": False}

        return {
            "is_error": False,
            "structured_content": {"status": "error"}
        }

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)

    result = run_async(
        agent.construction_risk_agent(
            PROJECT_ID,
            "Generate project risk report."
        )
    )

    assert result["status"] == "error"
    assert result["message"] == "MCP risk report generation failed."


def test_construction_risk_gemini_error(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        return {
            "is_error": False,
            "structured_content": {"status": "success"}
        }

    def fake_gemini(prompt):
        raise RuntimeError("Gemini test error")

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)
    monkeypatch.setattr(agent, "generate_ai_response", fake_gemini)

    result = run_async(
        agent.construction_risk_agent(
            PROJECT_ID,
            "Analyze construction risks."
        )
    )

    assert result["status"] == "error"
    assert "Gemini test error" in result["message"]
