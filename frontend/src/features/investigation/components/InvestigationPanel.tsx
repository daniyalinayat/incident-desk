import { useState } from 'react';

export default function InvestigationPanel({ incidentId }: { incidentId: string }) {
  const [question, setQuestion] = useState('');
  return (
    <section className="mt-7 rounded-lg border border-slate-200 bg-white p-5" aria-label="Investigation">
      <h2 className="text-sm font-semibold">Investigation</h2>
      <p className="mt-2 text-sm text-slate-500">Draft a question about {incidentId}. AI is not connected yet.</p>
      <label htmlFor="investigation-question" className="mt-4 block text-xs font-medium text-slate-600">Your question</label>
      <textarea id="investigation-question" value={question} onChange={(event) => setQuestion(event.target.value)} rows={3}
        className="mt-2 block w-full rounded-md border border-slate-300 p-3 text-sm" />
      <button type="button" disabled className="mt-3 rounded-md bg-blue-700 px-4 py-2 text-sm text-white opacity-50">Start investigation</button>
    </section>
  );
}
