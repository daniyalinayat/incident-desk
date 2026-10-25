import { memo, useCallback, useMemo, useState } from 'react';
import type { Incident } from '../../../types/incident';
import IncidentFilters, { IncidentFilterValues } from './IncidentFilters';
import IncidentPagination from './IncidentPagination';
import IncidentTable from './IncidentTable';

const PAGE_SIZE = 20;

interface IncidentListPanelProps {
  incidents: readonly Incident[];
  selectedIncidentId: string | null;
  onSelect: (id: string) => void;
}

function IncidentListPanel({ incidents, selectedIncidentId, onSelect }: IncidentListPanelProps) {
  const [filters, setFilters] = useState<IncidentFilterValues>({ search: '', status: '', priority: '' });
  const [requestedPage, setPage] = useState(1);
  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return incidents.filter((incident) =>
      `${incident.id} ${incident.title} ${incident.service}`.toLowerCase().includes(query) &&
      (!filters.status || incident.status === filters.status) &&
      (!filters.priority || incident.priority === filters.priority)
    );
  }, [incidents, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const visible = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const updateFilters = useCallback((patch: Partial<IncidentFilterValues>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  return (
    <aside className="flex min-w-0 flex-col border-b border-[#DCE5F1] bg-white md:sticky md:top-0 md:h-[calc(100vh-4rem)] md:border-b-0 md:border-r"
      aria-label="Incident queue">
      <div className="flex items-center justify-between px-4 py-5">
        <h2 className="text-sm font-semibold">Incident queue</h2>
        <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">{incidents.length} total</span>
      </div>
      <IncidentFilters values={filters} onChange={updateFilters} />
      <div className="max-h-[32rem] overflow-y-auto md:min-h-0 md:max-h-none md:flex-1">
        <IncidentTable incidents={visible} selectedIncidentId={selectedIncidentId} onSelect={onSelect} />
      </div>
      <IncidentPagination page={page} pageCount={pageCount} pageSize={PAGE_SIZE}
        total={filtered.length} onPageChange={setPage} />
    </aside>
  );
}

export default memo(IncidentListPanel);
