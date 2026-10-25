import json
from pathlib import Path

from fastapi import FastAPI, HTTPException

from models import EvidenceSource, Incident


app = FastAPI(title="Incident Desk API")
data_dir = Path(__file__).resolve().parent / "data"

# Load and validate the small demo dataset once, rather than on every request.
incidents = [
    Incident(**record)
    for record in json.loads((data_dir / "incidents.json").read_text(encoding="utf-8"))
]

incidents.sort(key=lambda incident: incident.created_at, reverse=True)

incidents_by_id = {incident.id: incident for incident in incidents}

if len(incidents_by_id) != len(incidents):
    raise ValueError("The incident fixture contains duplicate IDs.")

evidence_by_incident = {
    incident_id: [EvidenceSource(**source) for source in sources]
    for incident_id, sources in json.loads(
        (data_dir / "evidence.json").read_text(encoding="utf-8")
    ).items()
}


def find_incident(incident_id: str) -> Incident:
    incident = incidents_by_id.get(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@app.get("/health", tags=["Health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/incidents", response_model=list[Incident], tags=["Incidents"])
async def list_incidents() -> list[Incident]:
    return incidents


@app.get("/api/incidents/{incident_id}", response_model=Incident, tags=["Incidents"])
async def get_incident(incident_id: str) -> Incident:
    return find_incident(incident_id)


@app.get("/api/incidents/{incident_id}/evidence", response_model=list[EvidenceSource], tags=["Incidents"])
async def get_evidence(incident_id: str) -> list[EvidenceSource]:
    incident = find_incident(incident_id)
    report = EvidenceSource(
        id=f"{incident.id}-record",
        kind="incident",
        title="Incident report",
        content=incident.description,
    )
    return [report, *evidence_by_incident.get(incident_id, [])]

