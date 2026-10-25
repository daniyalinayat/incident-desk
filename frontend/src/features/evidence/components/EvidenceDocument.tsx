import type { EvidenceSource } from '../../../types/evidence';

export default function EvidenceDocument({ source }: { source: EvidenceSource }) {
  return (
    <article className="mt-4 overflow-hidden rounded-lg border border-[#DCE5F1] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#DCE5F1] bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-semibold">{source.title}</h3>
        <span className="text-xs capitalize text-slate-500">{source.kind}</span>
      </div>
      <pre aria-label={`${source.title} content`}
        className={`max-h-80 overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-6 text-slate-700 ${source.kind === 'logs' ? 'font-mono' : 'font-sans'}`}>
        {source.content}
      </pre>
      <p className="border-t border-[#DCE5F1] px-4 py-2 font-mono text-xs text-slate-400">Source: {source.id}</p>
    </article>
  );
}
