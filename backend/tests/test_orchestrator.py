
import asyncio

import agents.orchestrator_agent as orchestrator


PROJECT_ID = "dfe46451-2415-4683-aa70-1a1669362395"


def run_async(coroutine):
    return asyncio.run(coroutine)


def test_project_management_routing(monkeypatch):
    async def fake_agent(**kwargs):
        return {"status": "success", "agent": "Project Management Agent"}

    monkeypatch.setattr(
        orchestrator,
        "generate_ai_response",
        lambda prompt: "project_management"
    )

    monkeypatch.setattr(
        orchestrator,
        "project_management_agent",
        fake_agent
    )

    result = run_async(
        orchestrator.orchestrator_agent(
            PROJECT_ID,
            "Analyze project progress and deadlines."
        )
    )

    assert result["status"] == "success"
    assert result["selected_agent"] == "project_management"
    assert result["result"]["agent"] == "Project Management Agent"


def test_financial_analysis_routing(monkeypatch):
    async def fake_agent(**kwargs):
        return {"status": "success", "agent": "Financial Analysis Agent"}

    monkeypatch.setattr(
        orchestrator,
        "generate_ai_response",
        lambda prompt: "financial_analysis"
    )

    monkeypatch.setattr(
        orchestrator,
        "financial_analysis_agent",
        fake_agent
    )

    result = run_async(
        orchestrator.orchestrator_agent(
            PROJECT_ID,
            "Analyze project budget and expenses."
        )
    )

    assert result["status"] == "success"
    assert result["selected_agent"] == "financial_analysis"
    assert result["result"]["agent"] == "Financial Analysis Agent"


def test_construction_risk_routing(monkeypatch):
    async def fake_agent(**kwargs):
        return {"status": "success", "agent": "Construction Risk Agent"}

    monkeypatch.setattr(
        orchestrator,
        "generate_ai_response",
        lambda prompt: "construction_risk"
    )

    monkeypatch.setattr(
        orchestrator,
        "construction_risk_agent",
        fake_agent
    )

    result = run_async(
        orchestrator.orchestrator_agent(
            PROJECT_ID,
            "Check material stock and construction risks."
        )
    )

    assert result["status"] == "success"
    assert result["selected_agent"] == "construction_risk"
    assert result["result"]["agent"] == "Construction Risk Agent"


def test_invalid_routing_response(monkeypatch):
    monkeypatch.setattr(
        orchestrator,
        "generate_ai_response",
        lambda prompt: "unknown_agent"
    )

    result = run_async(
        orchestrator.orchestrator_agent(
            PROJECT_ID,
            "Analyze the project."
        )
    )

    assert result["status"] == "error"
    assert "Unable to identify" in result["message"]


def test_specialist_error_propagation(monkeypatch):
    async def fake_agent(**kwargs):
        return {
            "status": "error",
            "message": "Agent execution failed."
        }

    monkeypatch.setattr(
        orchestrator,
        "generate_ai_response",
        lambda prompt: "project_management"
    )

    monkeypatch.setattr(
        orchestrator,
        "project_management_agent",
        fake_agent
    )

    result = run_async(
        orchestrator.orchestrator_agent(
            PROJECT_ID,
            "Analyze project progress."
        )
    )

    assert result["status"] == "error"
    assert result["selected_agent"] == "project_management"
    assert result["result"]["message"] == "Agent execution failed."
