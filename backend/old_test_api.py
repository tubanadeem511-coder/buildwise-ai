
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_home_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert "BuildWise AI" in response.json()["message"]


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["project"] == "BuildWise AI"


def test_chat_empty_message():
    response = client.post(
        "/chat",
        json={"message": "   "}
    )

    assert response.status_code == 200
    assert response.json()["status"] == "error"
    assert response.json()["reply"] == "Please enter a message."


def test_orchestrator_empty_query():
    response = client.post(
        "/orchestrator",
        json={
            "project_id": "dfe46451-2415-4683-aa70-1a1669362395",
            "user_query": "   "
        }
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Please enter a valid query."


def test_orchestrator_invalid_project_id():
    response = client.post(
        "/orchestrator",
        json={
            "project_id": "invalid-uuid",
            "user_query": "Analyze project risks"
        }
    )

    assert response.status_code == 422
