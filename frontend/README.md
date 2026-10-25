# Incident Desk frontend

React + TypeScript + Tailwind CSS, using the Enterprise Blue light layout.

## Run

Start the backend on port 8000, then run these commands in the frontend directory:

```sh
npm ci
npm start
```

Open http://localhost:3000. The existing package.json proxy forwards `/api` requests
to http://127.0.0.1:8000. Install the packages with `npm ci` before starting a fresh checkout.

## Implemented

- Load incidents from the backend, with loading, error, retry and empty states.
- Search by ID, title or service; filter by status and priority.
- Show 20 rows per page, with previous/next controls and matching-result counts.
- Select an incident and display its details.
- Preserve selection in `?incident=INC-1001`, including refresh and Back/Forward.
- Read and switch between the incident report, logs, change and runbook.
- Cancel obsolete data requests when changing incidents or leaving the page.
- Stream an AI investigation grounded in the selected incident and evidence.
- Ask follow-up questions, stop an answer or start a new conversation.
- Display provider errors and preserve partial answers when stopped.

All incidents and evidence are fictional demo data. Questions and answers are held in
component state and reset when selecting another incident or refreshing; they are not saved.

## Keep the code straightforward

- `src/services/api.ts` contains the data requests and streaming AI request. The backend validates the data.
- `IncidentListPage` loads incidents and owns incident selection.
- `IncidentListPanel` owns search, filtering and pagination locally.
- `EvidencePanel` loads and selects its own sources.
- `InvestigationPanel` owns the conversation, request cancellation and
  streamed answer updates.
- The existing `AppLayout`, `IncidentTable`, `IncidentRow`, `IncidentHeader` and
  `Badge` components keep their original responsibilities.

There is no Redux, generic loading hook, frontend response parser, router package,
conversation reducer or duplicated frontend incident JSON. The list keeps stable
incident references and renders at most 20 rows; filtering happens locally over
the 100 demo records. This is client-side pagination, not server-side pagination.

## Check

```sh
npm test -- --watchAll=false --watchman=false
npm run build
```

The component tests cover selection, search, filters, pagination, deep links,
navigation, retry/empty states, evidence switching and obsolete evidence requests.

CRA's proxy is for development. A production host must forward `/api` to the
backend or use an explicitly configured API URL.
