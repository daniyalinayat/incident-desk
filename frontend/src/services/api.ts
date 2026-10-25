import type { EvidenceSource } from '../types/evidence';
import type { Incident } from '../types/incident';

// The backend validates these responses. This file handles HTTP errors only.
async function get(path: string, signal: AbortSignal): Promise<Response> {
  const response = await fetch(path, { signal, headers: { Accept: 'application/json' }, });

  if (!response.ok) {
    throw new Error(`Request failed (HTTP ${response.status}). Please try again.`);
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Expected JSON. Check the backend server and development proxy.');
  }
  return response;
}

export async function getIncidents(signal: AbortSignal): Promise<readonly Incident[]> {
  const response = await get('/api/incidents', signal);
  return response.json();
}

export async function getIncidentEvidence( incidentId: string, signal: AbortSignal ): Promise<readonly EvidenceSource[]> {
  const response = await get(`/api/incidents/${encodeURIComponent(incidentId)}/evidence`, signal);
  return response.json();
}
