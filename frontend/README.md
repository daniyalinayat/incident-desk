# Incident Desk frontend

React + TypeScript + Tailwind CSS, using the Enterprise Blue light layout.

## Run

Start the backend on port 8000, then run these commands in the frontend directory:

```sh
npm start
```

Open http://localhost:3000. The existing package.json proxy forwards `/api` requests
to http://127.0.0.1:8000. No new packages are required for these changes.

## Implemented

- Load incidents from the backend, with loading, error, retry and empty states.
- Search by ID, title or service; filter by status and priority.
- Show 20 rows per page, with previous/next controls and matching-result counts.
- Select an incident and display its details.
- Preserve selection in `?incident=INC-1001`, including refresh and Back/Forward.
- Read and switch between the incident report, logs, change and runbook.
- Cancel obsolete data requests when changing incidents or leaving the page.
- Draft an investigation question. The submit button is intentionally disabled:
  AI is not connected and there are no AI requests or fabricated answers.

All incidents and evidence are fictional demo data. Question drafts are held in
component state and reset when selecting another incident; they are not saved.

## Keep the code straightforward

- `src/services/api.ts` contains the two HTTP calls. The backend validates the data.
- `IncidentListPage` loads incidents and owns incident selection.
- `IncidentListPanel` owns search, filtering and pagination locally.
- `EvidencePanel` loads and selects its own sources.
- `InvestigationPanel` owns the draft question and is the frontend entry point for
  your future AI integration.
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
