# BuildWise AI

**AI-Powered Construction Project Management Platform**

BuildWise AI is a web-based construction project management platform
designed to help teams organize construction projects, monitor budgets
and materials, manage tasks, and identify project risks with AI
assistance.

## Overview

Construction projects involve multiple moving parts: schedules, budgets,
materials, tasks, and risks. BuildWise AI brings these workflows
together in one platform and adds AI-powered assistance to support
project analysis and decision-making.

## Key Features

-   **Project Management:** Create and manage construction projects and
    track their status.
-   **Task Management:** Organize project tasks and monitor progress.
-   **Budget Management:** Review project budgets and expense
    information.
-   **Materials Management:** Track construction materials and related
    information.
-   **AI Insights:** Use AI-assisted analysis to surface project and
    construction risks.
-   **AI Chatbot:** Ask questions and receive project-related
    assistance.
-   **Multi-Agent Architecture:** Specialist agents support project
    management, financial analysis, and construction risk analysis.
-   **MCP Integration:** Includes an MCP server and tools to support
    agent workflows.
-   **Settings:** Includes interface preferences such as language,
    theme, and currency display.

## Technology Stack

### Frontend

-   Next.js
-   React
-   TypeScript

### Backend

-   Python
-   FastAPI
-   Uvicorn
-   Pydantic

### AI and Integrations

-   Google Gemini API (`google-genai`)
-   Multi-agent workflow
-   Model Context Protocol (MCP)
-   Skills

### Database and Services

-   Supabase

### Deployment

-   Frontend: Vercel
-   Backend: Railway

## Project Structure

``` text
buildwise-ai/
├── backend/
│   ├── agents/
│   ├── api/
│   ├── chatbot/
│   ├── database/
│   ├── mcp_server/
│   ├── skills/
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
└── frontend/
    └── Next.js application
```

## Getting Started

### Prerequisites

Install the following before running the project locally:

-   Python 3.11 or a compatible Python version supported by the
    dependencies
-   Node.js and npm
-   A Supabase project
-   A Google Gemini API key

### 1. Clone the repository

``` bash
git clone https://github.com/tubanadeem511-coder/buildwise-ai.git
cd buildwise-ai
```

### 2. Set up the backend

Open a terminal in the `backend` directory:

``` bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

``` powershell
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**

``` bash
source venv/bin/activate
```

Install backend dependencies:

``` bash
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` and add your own credentials:

``` env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend from the `backend` directory:

``` bash
uvicorn main:app --reload
```

The local API will normally be available at:

-   API root: `http://127.0.0.1:8000/`
-   Interactive API documentation: `http://127.0.0.1:8000/docs`

### 3. Set up the frontend

Open another terminal:

``` bash
cd frontend
npm install
npm run dev
```

Open the local frontend address shown in the terminal (typically
`http://localhost:3000`).

If the frontend needs a backend API URL, configure the environment
variable used by the frontend code and point it to your local backend
(`http://127.0.0.1:8000`) or deployed backend URL. Check the frontend
source for the exact variable name before adding it.

## Deployment

### Backend --- Railway

The backend is deployed on Railway.

-   **Railway service Root Directory:** `backend`
-   **Start command:**

``` bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

-   **Backend URL:**
    https://buildwise-ai-production-f4413c39.up.railway.app
-   **API documentation:**
    https://buildwise-ai-production-f4413c39.up.railway.app/docs

Add the following variables in the Railway service's Variables settings:

``` env
SUPABASE_URL
SUPABASE_KEY
GEMINI_API_KEY
```

Use your own secret values. Do not commit `.env` files or API keys to
GitHub.

### Frontend --- Vercel

The frontend is deployed on Vercel. Connect the GitHub repository to
Vercel and configure the frontend project with `frontend` as its Root
Directory. Add any required frontend environment variables in Vercel
using the exact names referenced by the frontend source code.

## Testing

Backend tests are located in `backend/tests/`.

To run them locally, activate the backend virtual environment, install
the test tools if they are not already installed, and run:

``` bash
pip install pytest
pytest
```

Some tests may require valid environment variables or service
credentials, depending on the test configuration.

## Security Notes

-   Never commit `.env` files, API keys, database credentials, or other
    secrets.
-   Keep production credentials in Railway and Vercel environment
    variable settings.
-   Do not expose private service keys in frontend code.
-   Use only the appropriate Supabase key for the operations performed
    by the backend.

## Project Goal

BuildWise AI aims to make construction project workflows more organized
and actionable by combining project management capabilities with
AI-powered insights and agent-based automation.

## Author

**Tuba Nadeem**

GitHub: [tubanadeem511-coder](https://github.com/tubanadeem511-coder)

------------------------------------------------------------------------

*BuildWise AI --- Smarter Construction Project Management with AI.*
