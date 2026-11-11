
import asyncio

import agents.project_management_agent as agent


PROJECT_ID = "dfe46451-2415-4683-aa70-1a1669362395"


def run_async(coroutine):
    return asyncio.run(coroutine)


def test_project_management_agent_success(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        if tool_name == "get_project_details":
            return {
                "is_error": False,
                "content": ["Project details retrieved"]
            }

        if tool_name == "get_project_tasks":
            return {
                "is_error": False,
                "content": ["Project tasks retrieved"]
            }

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)
    monkeypatch.setattr(
        agent,
        "generate_ai_response",
        lambda prompt: "Project analysis completed successfully."
    )

    result = run_async(
        agent.project_management_agent(
            PROJECT_ID,
            "Analyze project progress."
        )
    )

    assert result["status"] == "success"
    assert result["agent"] == "Project Management Agent"
    assert result["skill"] == "Project Management Skill"
    assert result["analysis"] == "Project analysis completed successfully."


def test_project_details_error(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        return {"is_error": True}

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)

    result = run_async(
        agent.project_management_agent(
            PROJECT_ID,
            "Analyze project progress."
        )
    )

    assert result["status"] == "error"
    assert result["message"] == "Unable to retrieve project details."


def test_project_tasks_error(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        if tool_name == "get_project_details":
            return {"is_error": False}

        return {"is_error": True}

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)

    result = run_async(
        agent.project_management_agent(
            PROJECT_ID,
            "Analyze project tasks."
        )
    )

    assert result["status"] == "error"
    assert result["message"] == "Unable to retrieve project tasks."


def test_project_management_skill_missing(monkeypatch):
    monkeypatch.setattr(
        agent,
        "load_project_management_skill",
        lambda: (_ for _ in ()).throw(
            FileNotFoundError("Skill file missing")
        )
    )

    result = run_async(
        agent.project_management_agent(
            PROJECT_ID,
            "Analyze project progress."
        )
    )

    assert result["status"] == "error"
    assert "Skill file missing" in result["message"]


def test_project_management_gemini_error(monkeypatch):
    async def fake_mcp_tool(tool_name, arguments):
        return {"is_error": False}

    def fake_gemini(prompt):
        raise RuntimeError("Gemini test error")

    monkeypatch.setattr(agent, "call_mcp_tool", fake_mcp_tool)
    monkeypatch.setattr(agent, "generate_ai_response", fake_gemini)

    result = run_async(
        agent.project_management_agent(
            PROJECT_ID,
            "Analyze project progress."
        )
    )

    assert result["status"] == "error"
    assert "Gemini test error" in result["message"]
