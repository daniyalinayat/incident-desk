
# Incident Desk

Incident Desk is a full-stack incident investigation demo built with **React, TypeScript, Tailwind CSS, and FastAPI**. It contains 100 fictional incidents with supporting evidence and lets users investigate an incident through a streaming AI conversation powered by **OpenRouter**.

The project focuses on incident investigation workflows, API integration, real-time responses, and containerised deployment on OpenShift.

## Features

- **Incident browser:** View 100 simulated incidents, search by ID, title or service, and filter by status and priority.
- **Pagination:** Browse matching incidents in pages of 20, with result counts and previous/next navigation.
- **Incident details:** Select an incident and inspect its report, logs, associated change and runbook.
- **Deep linking:** Keep the selected incident in the URL, including across refreshes and browser Back/Forward navigation.
- **AI investigations:** Ask questions about the selected incident and its evidence, then continue with follow-up questions.
- **Streaming responses:** Display AI answers as they arrive through Server-Sent Events (SSE).
- **Cancellation and error handling:** Stop an investigation, keep partial responses, and handle request or provider failures.
- **Loading and retry states:** Show loading, empty and error states when fetching incident data.

All incidents and evidence are fictional. The application does not connect to real incident-management systems.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, HTTPX |
| AI | OpenRouter API, streamed model responses |
| Data | Local JSON fixtures |
| Deployment | Docker, OpenShift, Kubernetes manifests |
| Routing | Nginx, HTTPS |

## How It Works

1. The React frontend retrieves incident data and evidence from the FastAPI backend.
2. The backend reads the fictional incident and evidence fixtures, which are loaded into memory.
3. When an investigation starts, the frontend sends the conversation to the backend.
4. The backend includes the selected incident and evidence as context and sends the request to OpenRouter.
5. The AI response streams back to the frontend over SSE, where it appears progressively.
6. Users can ask follow-up questions, stop a response or start another conversation.

Conversations are held in the browser's component state, not saved to a database. They reset when the selected incident changes or the page is refreshed. The backend does not store conversations.

## Repository Structure

```text
incident-desk/
├── backend/       # FastAPI endpoints, AI integration and JSON fixtures
├── frontend/      # React application, UI components and API client
├── deploy/        # Deployment configuration
└── README.md
```

Detailed setup and implementation notes are also available in [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).

## Run Locally

### Prerequisites

- Python 3 and pip
- Node.js and npm
- An OpenRouter API key and a valid OpenRouter model ID for AI investigations

### 1. Start the backend

From the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Copy the example environment file and set your credentials:

```bash
cp .env.example .env
```

Configure `backend/.env` with your own values:

```dotenv
OPENROUTER_API_KEY=your-api-key
OPENROUTER_MODEL=your-model-id
```

Start FastAPI:

```bash
python -m uvicorn main:app --reload --env-file .env
```

The API runs at `http://127.0.0.1:8000`, with interactive documentation at `http://127.0.0.1:8000/docs`.

### 2. Start the frontend

In another terminal, from the repository root:

```bash
cd frontend
npm ci
npm start
```

Open `http://localhost:3000`.

In local development, the frontend's existing proxy forwards `/api` requests to the backend on port 8000. The frontend and backend must both be running.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Backend health response |
| GET | `/api/incidents` | Retrieve the incident list |
| GET | `/api/incidents/{incident_id}` | Retrieve a selected incident |
| GET | `/api/incidents/{incident_id}/evidence` | Retrieve incident evidence |
| POST | `/api/incidents/{incident_id}/investigate` | Stream an AI investigation using SSE |

The investigation endpoint accepts an ordered `messages` array containing user and assistant messages. The conversation must start and end with a user message. The backend adds the selected incident's evidence as context before sending the request to OpenRouter.

Unknown incident IDs return HTTP 404. The backend also handles provider rate limits and upstream failures.

## OpenShift Deployment

Incident Desk is containerised with Docker and has been deployed on **OpenShift** using Kubernetes manifests. The deployment configuration is in the [`deploy/`](deploy/) directory.

The deployed setup includes:

- **Containerised application components** deployed through OpenShift.
- **Kubernetes manifests** defining the required deployment configuration.
- **Nginx configuration** to support streaming AI responses without response buffering.
- **HTTPS routing** for access to the application.
- **Readiness probes** to determine when the application is ready to receive traffic.

The frontend's development proxy is intended for local use. In a deployed environment, `/api` traffic must be routed to FastAPI, and the proxy must allow SSE responses to stream without buffering.

Deployment requires an OpenShift environment, container images and the appropriate configuration and credentials. The repository's `deploy/` directory contains the project-specific configuration; exact cluster setup depends on the target environment.

## Testing

Run the frontend tests:

```bash
cd frontend
npm test -- --watchAll=false --watchman=false
```

Build the frontend:

```bash
npm run build
```

The frontend tests cover incident selection, search, filters, pagination, URL-based selection, navigation, loading and retry states, evidence switching and cancellation of obsolete requests.

## Security and Data Handling

- Keep `OPENROUTER_API_KEY` in the backend environment, never in frontend code.
- `backend/.env` is excluded from Git; do not commit credentials or secrets.
- API provider usage and availability depend on the configured OpenRouter model and account.
- All incidents, logs, changes and runbooks are fictional demo data.
- The incident fixtures are read-only through the application API.
- Conversations are not persisted by Incident Desk.

## Project Scope

Incident Desk is a personal engineering project, not a production incident-management platform. It demonstrates full-stack development, API integrations, streaming AI responses, error and cancellation handling, and OpenShift deployment. It does not claim to investigate real incidents or independently verify the accuracy of AI-generated answers.
