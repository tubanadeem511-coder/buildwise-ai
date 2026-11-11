
import asyncio
from types import SimpleNamespace

from agents import mcp_client


class FakeAsyncContextManager:
    def __init__(self, value):
        self.value = value

    async def __aenter__(self):
        return self.value

    async def __aexit__(self, exc_type, exc_value, traceback):
        return False


class FakeSession:
    def __init__(self, read, write):
        self.initialized = False
        self.called_tool = None
        self.called_arguments = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        return False

    async def initialize(self):
        self.initialized = True

    async def list_tools(self):
        tool = SimpleNamespace(
            name="get_project_details",
            description="Retrieve project details",
            inputSchema={"type": "object"},
        )
        return SimpleNamespace(tools=[tool])

    async def call_tool(self, tool_name, arguments):
        self.called_tool = tool_name
        self.called_arguments = arguments

        return SimpleNamespace(
            isError=False,
            structuredContent={"status": "success"},
            content=[
                SimpleNamespace(text="Tool executed successfully"),
                "Non-text content",
            ],
        )


def test_get_server_parameters():
    parameters = mcp_client.get_server_parameters()

    assert parameters.command == mcp_client.sys.executable
    assert parameters.args == [str(mcp_client.MCP_SERVER_FILE)]
    assert parameters.env is not None


def test_get_mcp_tools(monkeypatch):
    fake_session = FakeSession(None, None)

    monkeypatch.setattr(
        mcp_client,
        "stdio_client",
        lambda params: FakeAsyncContextManager(("fake_read", "fake_write")),
    )

    monkeypatch.setattr(
        mcp_client,
        "ClientSession",
        lambda read, write: fake_session,
    )

    result = asyncio.run(mcp_client.get_mcp_tools())

    assert len(result) == 1
    assert result[0]["name"] == "get_project_details"
    assert result[0]["description"] == "Retrieve project details"
    assert result[0]["input_schema"] == {"type": "object"}
    assert fake_session.initialized is True


def test_call_mcp_tool(monkeypatch):
    fake_session = FakeSession(None, None)

    monkeypatch.setattr(
        mcp_client,
        "stdio_client",
        lambda params: FakeAsyncContextManager(("fake_read", "fake_write")),
    )

    monkeypatch.setattr(
        mcp_client,
        "ClientSession",
        lambda read, write: fake_session,
    )

    arguments = {"project_id": "test-project-id"}

    result = asyncio.run(
        mcp_client.call_mcp_tool("get_project_details", arguments)
    )

    assert result["tool_name"] == "get_project_details"
    assert result["is_error"] is False
    assert result["structured_content"] == {"status": "success"}
    assert result["content"][0] == "Tool executed successfully"
    assert result["content"][1] == "Non-text content"

    assert fake_session.called_tool == "get_project_details"
    assert fake_session.called_arguments == arguments
    assert fake_session.initialized is True
