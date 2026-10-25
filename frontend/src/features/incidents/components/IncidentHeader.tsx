import { memo } from 'react';
import type { Incident } from '../../../types/incident';
import Badge from '../../../shared-components/ui/Badge';

interface IncidentHeaderProps {
  incident: Incident;
}

function IncidentHeader({ incident }: IncidentHeaderProps) {
  return (
    <header>
      <p className="font-mono text-xs text-slate-500">
        {incident.id} · {incident.service}
      </p>

      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#192C45]">
        {incident.title}
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge value={incident.status} />
        <Badge value={incident.priority} />
      </div>

      <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600">
        {incident.description}
      </p>
    </header>
  );
}

export default memo(IncidentHeader);
