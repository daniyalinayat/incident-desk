import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { streamInvestigation } from '../../../services/api';


export default function InvestigationPanel({ incidentId }: { incidentId: string; }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => requestRef.current?.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = question.trim();

    if (!prompt || requestRef.current) return;

    const controller = new AbortController();
    requestRef.current = controller;

    setLoading(true);
    setAnswer('');
    setError('');
    setNotice('');

    try {
      await streamInvestigation(
        incidentId,
        prompt,
        (text) => {
          if (!controller.signal.aborted) {
            setAnswer((previous) => previous + text);
          }
        },
        controller.signal
      );
      if (!controller.signal.aborted) setNotice('Answer complete.');
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Unable to investigate this incident.'
        );
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }

  function stop() {
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
    setNotice('Stopped. Any partial answer is kept.');
  }

  return (
    <section className="mt-7 rounded-lg border border-slate-200 bg-white p-5" aria-label="Investigation">
      <h2 className="text-sm font-semibold">Investigation</h2>
      <p id="investigation-help" className="mt-2 text-sm text-slate-500">
        Ask about {incidentId}. The answer uses its incident report and evidence.
      </p>
      <form onSubmit={handleSubmit} className="mt-4">
        <label htmlFor="investigation-question" className="block text-xs font-medium text-slate-600" >
          Your question
        </label>
        <textarea
          id="investigation-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          aria-describedby="investigation-help"
          maxLength={2000}
          rows={3}
          required
          disabled={loading}
          placeholder="What do the sources establish, and what should we check?"
          className={
            'mt-2 block w-full rounded-md border border-slate-300 ' +
            'p-3 text-sm focus:outline-blue-600 disabled:bg-slate-50'
          }
        />
        <div className="mt-3 flex items-center justify-end gap-3">
          {loading && (
            <button type="button" onClick={stop} className="rounded-md border border-slate-300 px-4 py-2 text-sm" >
              Stop
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className={
              'rounded-md bg-blue-700 px-4 py-2 text-sm font-medium ' +
              'text-white disabled:cursor-not-allowed disabled:opacity-50'
            }
          >
            {loading ? 'Investigating...' : 'Start investigation'}
          </button>
        </div>
      </form>
      {loading && (
        <p role="status" className="mt-4 text-sm text-slate-500">
          {answer ? 'Receiving answer...' : 'Waiting for the model...'}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 text-sm text-slate-500">
          {notice}
        </p>
      )}
      {answer && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <h3 className="text-xs font-semibold uppercase text-slate-500">
            AI answer
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {answer}
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Compare the cited source IDs with Supporting evidence below.
          </p>
        </div>
      )}
    </section>
  );
}
