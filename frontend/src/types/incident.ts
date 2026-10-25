export type IncidentStatus = 'Open' | 'In progress' | 'Resolved';
export type IncidentPriority = 'Critical' | 'Low' | 'Medium' | 'High';

export interface Incident {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: IncidentStatus;
  readonly service: string;  
  readonly priority: IncidentPriority;
  readonly created_at: string; // ISO date string
}

export const INCIDENT_STATUSES: readonly IncidentStatus[] = [
  'Open',
  'In progress',
  'Resolved',
];

export const INCIDENT_PRIORITIES: readonly IncidentPriority[] = [
  'Critical',
  'High',
  'Medium',
  'Low',
];