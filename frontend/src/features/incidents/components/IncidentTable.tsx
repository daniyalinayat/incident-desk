import { memo } from 'react';
import type { Incident } from '../../../types/incident';
import IncidentRow from './IncidentRow';

interface IncidentTableProps {
  incidents: readonly Incident[];
  selectedIncidentId: string | null;
  onSelect: (incidentId: string) => void;
}

function IncidentTable({ incidents, selectedIncidentId, onSelect }: IncidentTableProps) {
  if (incidents.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-slate-500" role="status">
       No incidents match your search and filters.
      </p>
    );
  }

  return (
    <table className="w-full table-fixed" aria-label="Incidents">
      <thead className="sr-only">
        <tr>
          <th scope="col">Incident</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {incidents.map((incident) => (
          <IncidentRow
            key={incident.id}
            incident={incident}
            isSelected={incident.id === selectedIncidentId}
            onSelect={onSelect}/>
        ))}
      </tbody>
    </table>
  );
}

export default memo(IncidentTable);