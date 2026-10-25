# Incident Desk

A small incident investigation demo built with React, TypeScript, Tailwind CSS and
FastAPI. Browse 100 fictional incidents, inspect their evidence and discuss the
selected incident with an AI assistant through OpenRouter.

## Start locally

1. Follow [backend setup](backend/README.md) and start the API on port 8000.
2. Follow [frontend setup](frontend/README.md) and open http://localhost:3000.

The AI response streams progressively and supports follow-up questions and Stop.
Conversations live only in browser component state and reset on incident changes
or refresh. All incidents, logs, changes and runbooks are fictional demo data.

Credentials stay in the backend `.env` file, which Git ignores. Never put an API
key in the frontend. Copy `backend/.env.example` and supply your own credentials.
The model ID is configurable; provider availability and limits depend on the
selected OpenRouter model.

Deployment has not been configured. CRA's API proxy is for local development;
a production host must route `/api` to FastAPI and support streaming responses.
