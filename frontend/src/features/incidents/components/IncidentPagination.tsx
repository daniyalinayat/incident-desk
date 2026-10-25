interface IncidentPaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function IncidentPagination({ page, pageCount, pageSize, total, onPageChange }: IncidentPaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const button = 'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <nav className="space-y-3 border-t border-[#DCE5F1] px-4 py-4" aria-label="Incident pages">
      <p className="text-xs text-slate-500" role="status">Showing {first}–{last} of {total} incidents</p>
      <div className="flex items-center justify-between gap-2">
        <button type="button" className={button} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span className="text-xs text-slate-600">{page} / {pageCount}</span>
        <button type="button" className={button} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </nav>
  );
}
