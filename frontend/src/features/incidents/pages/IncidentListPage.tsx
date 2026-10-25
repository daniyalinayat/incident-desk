import { useCallback, useEffect, useState } from 'react';
import { getIncidents } from '../../../services/api';
import type { Incident } from '../../../types/incident';
import EvidencePanel from '../../evidence/components/EvidencePanel';
import InvestigationPanel from '../../investigation/components/InvestigationPanel';
import IncidentHeader from '../components/IncidentHeader';
import IncidentListPanel from '../components/IncidentListPanel';

export default function IncidentListPage() {
  const [incidents, setIncidents] = useState<readonly Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get('incident')
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    async function load() {
      try {
        const data = await getIncidents(controller.signal);
        if (!controller.signal.aborted) setIncidents(data);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Unable to load incidents.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    function onBackOrForward() {
      setSelectedId(new URLSearchParams(window.location.search).get('incident'));
    }
    window.addEventListener('popstate', onBackOrForward);
    return () => window.removeEventListener('popstate', onBackOrForward);
  }, []);

  const handleSelect = useCallback((id: string) => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('incident') !== id) {
      url.searchParams.set('incident', id);
      window.history.pushState(null, '', url);
    }
    setSelectedId(id);
  }, []);

  if (loading) {
    return <p className="p-6 text-sm text-slate-500" role="status">Loading incidents…</p>;
  }
  if (error) {
    return (
      <section className="p-6">
        <h1 className="text-xl font-semibold">Unable to load incidents</h1>
        <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}
          className="mt-4 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm">
          Retry incidents
        </button>
      </section>
    );
  }
  if (incidents.length === 0) {
    return (
      <section className="p-6">
        <h1 className="text-xl font-semibold">No incidents</h1>
        <p className="mt-2 text-sm text-slate-500">The backend returned an empty incident list.</p>
      </section>
    );
  }

  const selected = selectedId ? incidents.find((incident) => incident.id === selectedId) : incidents[0];

  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)]">
      <IncidentListPanel incidents={incidents} selectedIncidentId={selected?.id ?? null} onSelect={handleSelect} />
      <section className="min-w-0 p-5 sm:p-6 lg:p-8" aria-label="Selected incident">
        {selected ? (
          <div className="w-full max-w-5xl">
            <IncidentHeader incident={selected} />
            <InvestigationPanel key={`question-${selected.id}`} incidentId={selected.id} />
            <EvidencePanel key={selected.id} incidentId={selected.id} />
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Incident not found</h1>
            <p className="mt-2 text-sm text-slate-500">Choose an incident from the queue.</p>
          </>
        )}
      </section>
    </div>
  );
}
