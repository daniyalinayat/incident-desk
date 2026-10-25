from typing import Literal

from pydantic import AwareDatetime, BaseModel


class Incident(BaseModel):
    id: str
    title: str
    description: str
    status: Literal["Open", "In progress", "Resolved"]
    service: str
    priority: Literal["Critical", "High", "Medium", "Low"]
    created_at: AwareDatetime


class EvidenceSource(BaseModel):
    id: str
    kind: Literal["incident", "logs", "change", "runbook"]
    title: str
    content: str
