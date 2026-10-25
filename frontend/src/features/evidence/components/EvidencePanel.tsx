import { useEffect, useState } from 'react';
import { getIncidentEvidence } from '../../../services/api';
import type { EvidenceSource } from '../../../types/evidence';
import EvidenceDocument from './EvidenceDocument';

export default function EvidencePanel({ incidentId }: { incidentId: string }) {
  const [sources, setSources] = useState<readonly EvidenceSource[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setSelectedId(null);
    async function load() {
      try {
        const data = await getIncidentEvidence(incidentId, controller.signal);
        if (!controller.signal.aborted) setSources(data);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Unable to load evidence.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [incidentId, attempt]);

  const selected = sources.find((source) => source.id === selectedId) ?? sources[0];
  return (
    <section className="mt-7 border-t border-[#DCE5F1] pt-6" aria-label="Supporting evidence">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Supporting evidence</h2>
        <span className="text-xs text-slate-500">Fictional sources for this demo</span>
      </div>
      {loading ? (
        <p className="mt-4 text-sm text-slate-500" role="status">Loading evidence…</p>
      ) : error ? (
        <div className="mt-4">
          <p className="text-sm text-red-700" role="alert">{error}</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)}
            className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">Retry evidence</button>
        </div>
      ) : sources.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No evidence attached to this incident.</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Evidence sources">
            {sources.map((source) => (
              <button key={source.id} type="button" aria-pressed={selected?.id === source.id}
                onClick={() => setSelectedId(source.id)}
                className={`rounded-md border px-3 py-2 text-xs font-medium ${selected?.id === source.id
                  ? 'border-[#1559BF] bg-[#E7F0FF] text-[#124FA7]'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}>
                {source.title}
              </button>
            ))}
          </div>
          {selected && <EvidenceDocument source={selected} />}
        </>
      )}
    </section>
  );
}
