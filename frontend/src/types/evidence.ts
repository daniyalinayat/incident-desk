export interface EvidenceSource {
  readonly id: string;
  readonly kind: 'incident' | 'logs' | 'change' | 'runbook';
  readonly title: string;
  readonly content: string;
}
