import type { IncidentPriority, IncidentStatus } from '../../types/incident';

type BadgeValue = IncidentStatus | IncidentPriority;

interface BadgeProps {
  value: BadgeValue;
}

const badgeStyles: Record<BadgeValue, string> = {
  Low: 'bg-slate-100 text-slate-700',
  Critical: 'bg-red-50 text-red-800',
  High: 'bg-orange-50 text-orange-800',
  Resolved: 'bg-green-50 text-green-800',
  Medium: 'bg-yellow-50 text-yellow-800',
  Open: 'bg-blue-50 text-blue-800', 'In progress': 'bg-amber-50 text-amber-800',
};

export default function Badge({ value }: BadgeProps) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ${badgeStyles[value]}`}>
      {value}
    </span>
  );
}

