# Component responsibilities

```text
App
└── AppLayout
    └── IncidentListPage
        ├── IncidentListPanel
        │   ├── IncidentFilters
        │   ├── IncidentTable
        │   │   └── IncidentRow → Badge
        │   └── IncidentPagination
        ├── IncidentHeader → Badge
        ├── InvestigationPanel
        └── EvidencePanel
            └── EvidenceDocument
```

The page loads the incident list and owns selection. Queue filters and pagination
stay inside IncidentListPanel; question typing stays inside InvestigationPanel;
evidence loading and selection stay inside EvidencePanel. Those updates therefore
do not start a render from the whole page.

IncidentTable and IncidentRow retain memoization. The visible page and selection
callback keep stable references when their inputs have not changed. No deferred
filtering or virtualization is needed for this small, paginated fixture list.

The service file contains straightforward HTTP calls. Type definitions describe
incident and evidence data. Backend schemas own validation.

AI, streaming, generated messages and notification updates are not implemented.
The investigation panel contains only an editable question and a disabled action.
