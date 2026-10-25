import { memo } from 'react';

import type { Incident } from '../../../types/incident';
import Badge from '../../../shared-components/ui/Badge';

interface IncidentRowProps {
  incident: Incident;
  isSelected: boolean;
  onSelect: (incidentId: string) => void;
}

function IncidentRow({ incident, isSelected, onSelect }: IncidentRowProps) {
  return (
    <tr>
      <td className="p-0">
        <button
          type="button"
          aria-pressed={isSelected}
          onClick={() => onSelect(incident.id)}
          className={`w-full border-l-2 px-4 py-3 text-left
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-inset focus-visible:ring-[#1559BF]
            ${ 
              isSelected ? 'border-[#1559BF] bg-[#E7F0FF]' 
                         : 'border-transparent bg-white hover:bg-slate-50'
            }`}
        >
          <span className="block text-sm font-medium text-[#192C45]">
            {incident.title}
          </span>

          <span className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-500">
              {incident.id}
            </span>

            <Badge value={incident.status} />
          </span>

          <span className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              {incident.service}
            </span>

            <Badge value={incident.priority} />
          </span>
        </button>
      </td>
    </tr>
  );
}

export default memo(IncidentRow);