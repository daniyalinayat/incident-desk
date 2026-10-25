
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { streamInvestigation } from '../../../services/api';
import type { ConversationMessage } from '../../../services/api';

interface ConversationTurn {
  question: string;
  answer: string;
}

export default function InvestigationPanel({
  incidentId,
}: {
  incidentId: string;
}) {
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => requestRef.current?.abort();
  }, []);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [turns]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = question.trim();
    if (!prompt || requestRef.current) return;

    // Drop unanswered failed attempts; keep completed and partial answers.
    const previous = turns.filter((turn) => turn.answer.trim());
    const messages: ConversationMessage[] = previous.flatMap((turn) => [
      { role: 'user', content: turn.question },
      { role: 'assistant', content: turn.answer },
    ]);
    messages.push({ role: 'user', content: prompt });

    const controller = new AbortController();
    requestRef.current = controller;
    setTurns([...previous, { question: prompt, answer: '' }]);
    setLoading(true);
    setError('');
    setNotice('');

    try {
      await streamInvestigation(
        incidentId,
        messages,
        (text) => {
          if (!controller.signal.aborted) {
            setTurns((current) =>
              current.map((turn, index) =>
                index === current.length - 1
                  ? { ...turn, answer: turn.answer + text }
                  : turn
              )
            );
          }
        },
        controller.signal
      );
      if (!controller.signal.aborted) {
        setQuestion('');
        setNotice('Answer complete. You can ask a follow-up.');
      }
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(
          cause instanceof Error ? cause.message : 'Unable to get an answer.'
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

  function newConversation() {
    setTurns([]);
    setQuestion('');
    setError('');
    setNotice('');
  }

  const hasAnswer = turns.some((turn) => turn.answer.trim());

  return (
    <section
      className="mt-7 rounded-lg border border-slate-200 bg-white p-5"
      aria-label="Investigation"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Investigation</h2>
        <button
          type="button"
          onClick={newConversation}
          disabled={loading || turns.length === 0}
          className="text-xs text-blue-700 disabled:opacity-40"
        >
          New conversation
        </button>
      </div>
      <p id="investigation-help" className="mt-2 text-sm text-slate-500">
        Discuss {incidentId} and ask follow-up questions about its evidence.
        This conversation resets when you change incidents or refresh.
      </p>

      {turns.length > 0 && (
        <div
          ref={threadRef}
          role="log"
          aria-label="Conversation"
          aria-busy={loading}
          className="mt-4 max-h-[30rem] space-y-4 overflow-y-auto pr-2"
        >
          {turns.map((turn, index) => (
            <div key={index} className="space-y-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-700">You</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {turn.question}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-500">AI</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                  {turn.answer ||
                    (loading && index === turns.length - 1
                      ? 'Waiting for an answer...'
                      : 'No answer received.')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <label
          htmlFor="investigation-question"
          className="block text-xs font-medium text-slate-600"
        >
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
          placeholder={hasAnswer ? 'Ask a follow-up...' : 'Ask about this incident...'}
          className={
            'mt-2 block w-full rounded-md border border-slate-300 ' +
            'p-3 text-sm focus:outline-blue-600 disabled:bg-slate-50'
          }
        />
        <div className="mt-3 flex items-center justify-end gap-3">
          {loading && (
            <button
              type="button"
              onClick={stop}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            >
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
            {loading
              ? 'Investigating...'
              : hasAnswer ? 'Send follow-up' : 'Start investigation'}
          </button>
        </div>
      </form>

      {loading && <p role="status" className="mt-3 text-sm">Receiving answer...</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-3 text-sm text-slate-500">{notice}</p>}
      {hasAnswer && (
        <p className="mt-3 text-xs text-slate-400">
          Compare cited source IDs with Supporting evidence below.
        </p>
      )}
    </section>
  );
}

// import { useEffect, useRef, useState } from 'react';
// import type { FormEvent } from 'react';
// import { streamInvestigation } from '../../../services/api';


// export default function InvestigationPanel({ incidentId }: { incidentId: string; }) {
//   const [question, setQuestion] = useState('');
//   const [answer, setAnswer] = useState('');
//   const [error, setError] = useState('');
//   const [notice, setNotice] = useState('');
//   const [loading, setLoading] = useState(false);

//   const requestRef = useRef<AbortController | null>(null);

//   useEffect(() => {
//     return () => requestRef.current?.abort();
//   }, []);

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     const prompt = question.trim();

//     if (!prompt || requestRef.current) return;

//     const controller = new AbortController();
//     requestRef.current = controller;

//     setLoading(true);
//     setAnswer('');
//     setError('');
//     setNotice('');

//     try {
//       await streamInvestigation(
//         incidentId,
//         prompt,
//         (text) => {
//           if (!controller.signal.aborted) {
//             setAnswer((previous) => previous + text);
//           }
//         },
//         controller.signal
//       );
//       if (!controller.signal.aborted) setNotice('Answer complete.');
//     } catch (cause) {
//       if (!controller.signal.aborted) {
//         setError(
//           cause instanceof Error
//             ? cause.message
//             : 'Unable to investigate this incident.'
//         );
//       }
//     } finally {
//       if (requestRef.current === controller) {
//         requestRef.current = null;
//         if (!controller.signal.aborted) setLoading(false);
//       }
//     }
//   }

//   function stop() {
//     requestRef.current?.abort();
//     requestRef.current = null;
//     setLoading(false);
//     setNotice('Stopped. Any partial answer is kept.');
//   }

//   return (
//     <section className="mt-7 rounded-lg border border-slate-200 bg-white p-5" aria-label="Investigation">
//       <h2 className="text-sm font-semibold">Investigation</h2>
//       <p id="investigation-help" className="mt-2 text-sm text-slate-500">
//         Ask about {incidentId}. The answer uses its incident report and evidence.
//       </p>
//       <form onSubmit={handleSubmit} className="mt-4">
//         <label htmlFor="investigation-question" className="block text-xs font-medium text-slate-600" >
//           Your question
//         </label>
//         <textarea
//           id="investigation-question"
//           value={question}
//           onChange={(event) => setQuestion(event.target.value)}
//           aria-describedby="investigation-help"
//           maxLength={2000}
//           rows={3}
//           required
//           disabled={loading}
//           placeholder="What do the sources establish, and what should we check?"
//           className={
//             'mt-2 block w-full rounded-md border border-slate-300 ' +
//             'p-3 text-sm focus:outline-blue-600 disabled:bg-slate-50'
//           }
//         />
//         <div className="mt-3 flex items-center justify-end gap-3">
//           {loading && (
//             <button type="button" onClick={stop} className="rounded-md border border-slate-300 px-4 py-2 text-sm" >
//               Stop
//             </button>
//           )}
//           <button
//             type="submit"
//             disabled={loading || !question.trim()}
//             className={
//               'rounded-md bg-blue-700 px-4 py-2 text-sm font-medium ' +
//               'text-white disabled:cursor-not-allowed disabled:opacity-50'
//             }
//           >
//             {loading ? 'Investigating...' : 'Start investigation'}
//           </button>
//         </div>
//       </form>
//       {loading && (
//         <p role="status" className="mt-4 text-sm text-slate-500">
//           {answer ? 'Receiving answer...' : 'Waiting for the model...'}
//         </p>
//       )}
//       {error && (
//         <p role="alert" className="mt-4 text-sm text-red-700">
//           {error}
//         </p>
//       )}
//       {notice && (
//         <p role="status" className="mt-4 text-sm text-slate-500">
//           {notice}
//         </p>
//       )}
//       {answer && (
//         <div className="mt-4 border-t border-slate-200 pt-4">
//           <h3 className="text-xs font-semibold uppercase text-slate-500">
//             AI answer
//           </h3>
//           <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
//             {answer}
//           </p>
//           <p className="mt-3 text-xs text-slate-400">
//             Compare the cited source IDs with Supporting evidence below.
//           </p>
//         </div>
//       )}
//     </section>
//   );
// }
