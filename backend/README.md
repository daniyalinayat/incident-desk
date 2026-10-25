# Incident Desk backend

A small FastAPI application using fictional JSON fixtures and OpenRouter for
streamed AI investigations. The provider is called with HTTPX; no AI SDK is needed.

## Run

Copy `.env.example` to `.env`, then set `OPENROUTER_API_KEY` and
`OPENROUTER_MODEL` to your own key and a valid OpenRouter model ID. `.env` stays
private and is ignored by Git. Restart the backend after changing it.

From the backend directory, using the existing virtual environment:

```sh
source .venv/bin/activate
python -m uvicorn main:app --reload --env-file .env
```

For a fresh environment:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --env-file .env
```

## Files

- `main.py`: load fixtures once, find incidents, define the REST and investigation endpoints.
- `models.py`: the incident and evidence response models.
- `data/incidents.json`: the existing 100 fictional incidents, unchanged.
- `data/evidence.json`: three fictional sources per incident: logs, change, runbook.
  The incident-report source comes directly from the incident description.

The JSON is parsed and checked using the response models when the app imports.
Incidents are sorted newest first. Duplicate incident IDs prevent startup.
Restart the backend after modifying either JSON file. The fixtures are read-only;
the application does not modify them through HTTP.

## Endpoints

| Method | Path | Response |
| --- | --- | --- |
| GET | `/health` | `{"status":"ok"}` |
| GET | `/api/incidents` | List of incidents |
| GET | `/api/incidents/{incident_id}` | One incident or HTTP 404 |
| GET | `/api/incidents/{incident_id}/evidence` | Four sources, or HTTP 404 for an unknown incident |

| POST | `/api/incidents/{incident_id}/investigate` | SSE stream for a conversation |

Interactive API documentation: http://127.0.0.1:8000/docs

There is no repository class, dependency injection or custom startup lifecycle.
The dataset is loaded into process memory, appropriate for this small local demo.
Multiple workers would each load their own copy.

## AI investigation

The POST body contains `messages`, an ordered array of `{ "role": "user" |
"assistant", "content": "..." }` objects. The conversation must start and end with
a user message. The backend adds the selected incident and evidence as context,
then forwards the provider's streaming response. Prior AI answers provide
conversation context and are not treated as new evidence. No conversation is
stored on the server.

The API key stays on the backend. Provider rate limits are returned as HTTP 429;
other provider/network failures return HTTP 502. API docs requests that invoke
the investigation endpoint will contact your configured provider.
