import { INCIDENT_PRIORITIES, INCIDENT_STATUSES } from '../../../types/incident';
import type { IncidentPriority, IncidentStatus } from '../../../types/incident';

export interface IncidentFilterValues {
  search: string;
  status: IncidentStatus | '';
  priority: IncidentPriority | '';
}

interface IncidentFiltersProps {
  values: IncidentFilterValues;
  onChange: (patch: Partial<IncidentFilterValues>) => void;
}

export default function IncidentFilters({ values, onChange }: IncidentFiltersProps) {
  const control = 'mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600';
  return (
    <div className="space-y-3 px-4 pb-4">
      <label className="block text-xs font-medium text-slate-600">
        Search incidents
        <input type="search" value={values.search} placeholder="ID, title or service" className={control}
          onChange={(event) => onChange({ search: event.target.value })} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs font-medium text-slate-600">
          Status
          <select value={values.status} className={control}
            onChange={(event) => onChange({ status: event.target.value as IncidentStatus | '' })}>
            <option value="">All statuses</option>
            {INCIDENT_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Priority
          <select value={values.priority} className={control}
            onChange={(event) => onChange({ priority: event.target.value as IncidentPriority | '' })}>
            <option value="">All priorities</option>
            {INCIDENT_PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
