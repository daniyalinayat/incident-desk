import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';
import { getIncidents } from './services/api';
import type { Incident } from './types/incident';

const incidents: Incident[] = Array.from({ length: 24 }, (_, index) => ({
  id: `INC-${1001 + index}`,
  title: `Example incident ${index + 1}`,
  description: `Description for incident ${index + 1}`,
  status: index % 2 === 0 ? 'Open' : 'Resolved',
  priority: index % 3 === 0 ? 'High' : 'Low',
  service: index % 2 === 0 ? 'Payment service' : 'Reporting service',
  created_at: '2026-10-20T12:00:00Z',
}));

const sources = [
  { id: 'source-report', kind: 'incident', title: 'Incident report', content: 'The report text' },
  { id: 'source-runbook', kind: 'runbook', title: 'Service runbook', content: 'Check service connectivity.' },
];

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => data,
  } as unknown as Response;
}

const originalFetch = global.fetch;
const fetchMock = jest.fn();

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (path: string) => jsonResponse(path === '/api/incidents' ? incidents : sources));
  global.fetch = fetchMock;
});

afterAll(() => { global.fetch = originalFetch; });

test('loads the API queue, paginates, searches and selects an incident without AI requests', async () => {
  render(<App />);
  expect(screen.getByText('Loading incidents…')).toBeInTheDocument();
  const queue = await screen.findByRole('complementary', { name: 'Incident queue' });
  expect(within(queue).getAllByRole('button', { name: /INC-/ })).toHaveLength(20);
  fireEvent.click(within(queue).getByRole('button', { name: 'Next' }));
  expect(within(queue).getByText('Showing 21–24 of 24 incidents')).toBeInTheDocument();
  expect(within(queue).getAllByRole('button', { name: /INC-/ })).toHaveLength(4);

  fireEvent.change(within(queue).getByLabelText('Search incidents'), { target: { value: 'INC-1024' } });
  expect(within(queue).getByText('Showing 1–1 of 1 incidents')).toBeInTheDocument();
  fireEvent.click(within(queue).getByRole('button', { name: /INC-1024/ }));
  expect(window.location.search).toBe('?incident=INC-1024');
  expect(screen.getByRole('heading', { name: 'Example incident 24' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Your question'), { target: { value: 'What happened?' } });
  expect(screen.getByRole('button', { name: 'Start investigation' })).toBeDisabled();
  await screen.findByText('The report text');
  expect(fetchMock.mock.calls.every(([path]) => path === '/api/incidents' || /\/api\/incidents\/INC-\d+\/evidence$/.test(path))).toBe(true);
});

test('combines filters, handles zero matches and keeps the open incident selected', async () => {
  render(<App />);
  const queue = await screen.findByRole('complementary', { name: 'Incident queue' });
  fireEvent.change(within(queue).getByLabelText('Status'), { target: { value: 'Open' } });
  fireEvent.change(within(queue).getByLabelText('Priority'), { target: { value: 'High' } });
  expect(within(queue).getAllByRole('button', { name: /INC-/ })).toHaveLength(4);
  fireEvent.change(within(queue).getByLabelText('Search incidents'), { target: { value: 'not-a-match' } });
  expect(within(queue).getByText('Showing 0–0 of 0 incidents')).toBeInTheDocument();
  expect(within(queue).getByRole('button', { name: 'Next' })).toBeDisabled();
  expect(within(queue).getByRole('button', { name: 'Previous' })).toBeDisabled();
  expect(screen.getByRole('heading', { name: 'Example incident 1' })).toBeInTheDocument();
});

test('supports direct URLs, browser navigation and missing incident IDs', async () => {
  window.history.replaceState(null, '', '/?incident=INC-1024');
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Example incident 24' })).toBeInTheDocument();
  act(() => {
    window.history.replaceState(null, '', '/?incident=INC-1002');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(screen.getByRole('heading', { name: 'Example incident 2' })).toBeInTheDocument();
  act(() => {
    window.history.replaceState(null, '', '/?incident=MISSING');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(screen.getByRole('heading', { name: 'Incident not found' })).toBeInTheDocument();
  expect(screen.getByRole('complementary', { name: 'Incident queue' })).toBeInTheDocument();
});

test('shows a request failure and retries incident loading', async () => {
  fetchMock.mockRejectedValueOnce(new Error('Backend unavailable'));
  render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Backend unavailable');
  fireEvent.click(screen.getByRole('button', { name: 'Retry incidents' }));
  expect(await screen.findByRole('complementary', { name: 'Incident queue' })).toBeInTheDocument();
});

test('handles an empty incident dataset', async () => {
  fetchMock.mockResolvedValue(jsonResponse([]));
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'No incidents' })).toBeInTheDocument();
});

test('retries evidence and switches the visible source', async () => {
  fetchMock.mockImplementation(async (path: string) => {
    if (path === '/api/incidents') return jsonResponse(incidents);
    throw new Error('Evidence unavailable');
  });
  render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Evidence unavailable');
  fetchMock.mockResolvedValue(jsonResponse(sources));
  fireEvent.click(screen.getByRole('button', { name: 'Retry evidence' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Service runbook' }));
  expect(screen.getByText('Check service connectivity.')).toBeInTheDocument();
});

test('ignores late evidence from the previously selected incident', async () => {
  let resolveOld: (response: Response) => void = () => {};
  fetchMock.mockImplementation((path: string) => {
    if (path === '/api/incidents') return Promise.resolve(jsonResponse(incidents));
    if (path.includes('INC-1001/')) return new Promise<Response>((resolve) => { resolveOld = resolve; });
    return Promise.resolve(jsonResponse([{ ...sources[0], content: 'Second incident evidence' }]));
  });
  render(<App />);
  const queue = await screen.findByRole('complementary', { name: 'Incident queue' });
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/incidents/INC-1001/evidence', expect.anything()));
  fireEvent.click(within(queue).getByRole('button', { name: /INC-1002/ }));
  expect(await screen.findByText('Second incident evidence')).toBeInTheDocument();
  await act(async () => { resolveOld(jsonResponse([{ ...sources[0], content: 'Old incident evidence' }])); });
  expect(screen.queryByText('Old incident evidence')).not.toBeInTheDocument();
  expect(screen.getByText('Second incident evidence')).toBeInTheDocument();
});

test('handles empty evidence', async () => {
  fetchMock.mockImplementation(async (path: string) => jsonResponse(path === '/api/incidents' ? incidents : []));
  render(<App />);
  expect(await screen.findByText('No evidence attached to this incident.')).toBeInTheDocument();
});

test('reports HTTP failures and a missing JSON proxy response', async () => {
  const signal = new AbortController().signal;
  fetchMock.mockResolvedValueOnce(jsonResponse({}, 503));
  await expect(getIncidents(signal)).rejects.toThrow('HTTP 503');
  fetchMock.mockResolvedValueOnce({ ok: true, headers: { get: () => 'text/html' } });
  await expect(getIncidents(signal)).rejects.toThrow('Expected JSON');
});
