import type { EvidenceSource } from '../types/evidence';
import type { Incident } from '../types/incident';

// The backend validates these responses. This file handles HTTP errors only.
async function get(path: string, signal: AbortSignal): Promise<Response> {
  const response = await fetch(path, { signal, headers: { Accept: 'application/json' }, });

  if (!response.ok) {
    throw new Error(`Request failed (HTTP ${response.status}). Please try again.`);
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Expected JSON. Check the backend server and development proxy.');
  }
  return response;
}

export async function getIncidents(signal: AbortSignal): Promise<readonly Incident[]> {
  const response = await get('/api/incidents', signal);
  return response.json();
}

export async function getIncidentEvidence( incidentId: string, signal: AbortSignal ): Promise<readonly EvidenceSource[]> {
  const response = await get(`/api/incidents/${encodeURIComponent(incidentId)}/evidence`, signal);
  return response.json();
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// export async function streamInvestigation( incidentId: string, question: string, onText: (text: string) => void, signal: AbortSignal ): Promise<void> {
export async function streamInvestigation( incidentId: string, messages: readonly ConversationMessage[], onText: (text: string) => void, signal: AbortSignal ): Promise<void> {
  const response = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}/investigate`, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ messages }),
    // body: JSON.stringify({ question }),
  });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body.detail === 'string' ? body.detail : `Investigation failed (HTTP ${response.status}).`);
    }

    if(!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) {
        throw new Error('Expected an AI stream. Check the backend and proxy.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let completed = false;
    let receivedText = false;

    function readEvent(event: string){
        const data = event.split('\n')
                    .filter(line => line.startsWith('data: '))
                    .map(line => line.slice(5).trimStart())
                    .join('\n')
                    .trim();

        if(!data) return;
        if(data === '[DONE]') {
            completed = true;
            return;
        }

        const chunk = JSON.parse(data);

        if(chunk.error) {
            throw new Error(chunk.error.message || 'The AI provider stopped the answer. Please');
        }

        const choice = chunk.choices?.[0];
        const text = choice?.delta?.content;

        if(text) {
            receivedText = true;
            onText(text);
        }
        if(choice?.finish_reason === 'length') {
            throw new Error('Answer limit reached. Please try again with a shorter question.');
        }
        
        if(choice?.finish_reason === 'content_filter') {
            throw new Error('The AI provider filtered the answer.');
        }
    }

    try{
        while(!completed) {
            const { value, done } = await reader.read();
            if(done){
                buffer += decoder.decode();
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            buffer = buffer.replace(/\r/g, '');

            let boundary = buffer.indexOf('\n\n');
            while(boundary !== -1) {
                readEvent(buffer.slice(0, boundary));
                buffer = buffer.slice(boundary + 2);
                if(completed) break;
                boundary = buffer.indexOf('\n\n');
            }
        }
        if(!completed && buffer.trim()) readEvent(buffer);
        if(!completed) throw new Error('The connection ended before the AI provider finished the answer.');
        if(!receivedText) throw new Error('the model returned no answer. Try a shorter question.');
    }
    finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
    }
}