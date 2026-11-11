import os
import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


# Backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent

# MCP server file
MCP_SERVER_FILE = BACKEND_DIR / "mcp_server" / "server.py"


def get_server_parameters():
    """Configure the BuildWise AI MCP server."""

    return StdioServerParameters(
        command=sys.executable,
        args=[str(MCP_SERVER_FILE)],
        env=os.environ.copy(),
    )


async def get_mcp_tools():
    """Connect to MCP server and retrieve available tools."""

    server_params = get_server_parameters()

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:

            await session.initialize()

            result = await session.list_tools()

            return [
                {
                    "name": tool.name,
                    "description": tool.description,
                    "input_schema": tool.inputSchema,
                }
                for tool in result.tools
            ]


async def call_mcp_tool(tool_name: str, arguments: dict):
    """Execute an MCP tool and return its result."""

    server_params = get_server_parameters()

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:

            await session.initialize()

            result = await session.call_tool(
                tool_name,
                arguments=arguments,
            )

            return {
                "tool_name": tool_name,
                "is_error": result.isError,
                "structured_content": getattr(
                    result, "structuredContent", None
                ),
                "content": [
                    item.text if hasattr(item, "text") else str(item)
                    for item in result.content
                ],
            }