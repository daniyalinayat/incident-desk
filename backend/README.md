# Incident Desk backend

A small FastAPI application using fictional JSON fixtures. No AI provider or SDK
is connected.

## Run

From the backend directory, using the existing virtual environment:

```sh
source .venv/bin/activate
python -m uvicorn main:app --reload
```

For a fresh environment:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

## Files

- `main.py`: load fixtures once, find incidents, define the four endpoints.
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

Interactive API documentation: http://127.0.0.1:8000/docs

There is no repository class, dependency injection or custom startup lifecycle.
The dataset is loaded into process memory, appropriate for this small local demo.
Multiple workers would each load their own copy.

## AI integration later

Add your provider call and investigation endpoint in main.py when you are ready.
The frontend entry point is InvestigationPanel.tsx. No placeholder AI endpoint,
fake generated response or credentials have been added.
