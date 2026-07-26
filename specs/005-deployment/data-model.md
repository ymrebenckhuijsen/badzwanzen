# Phase 1 Data Model: Deployment naar Vercel

This feature introduces no application data model (no new client-side state, no
`localStorage` entities, no database). The "entities" here are external platform
configuration/state managed by Vercel, listed for traceability to `spec.md`'s Key Entities
section.

## Vercel-project (configuration entity)

Represents the link between the GitHub repository and Vercel.

| Field | Description | Source |
|---|---|---|
| GitHub repository | Which repo Vercel builds from | Set during "Import Project" in Vercel dashboard (User Story 2) |
| Production branch | Which branch triggers production deploys | `main` (Vercel default; confirmed during project import) |
| Build command | Command run to produce the static build | `vercel.json` → `"buildCommand": "npm run build"` |
| Output directory | Directory served as the deployment | `vercel.json` → `"outputDirectory": "dist"` |
| Framework preset | Framework Vercel optimizes defaults for | `vercel.json` → `"framework": "vite"` |

State transitions: none (this is a one-time setup entity, not a runtime state machine).

## Deployment (runtime entity, managed entirely by Vercel — not application state)

Represents one built version of the app.

| Field | Description |
|---|---|
| Trigger | `main` push/merge (→ production) or PR commit (→ preview) |
| Status | queued → building → ready \| error |
| URL | Production: stable `*.vercel.app` URL. Preview: unique per-PR URL. |
| GitHub surface | Commit status / PR check reflecting `status` (FR-007) |

State transitions:

```text
queued -> building -> ready   (success path; ready deployment becomes/stays live)
queued -> building -> error   (failure path; previously "ready" production deployment
                                is left untouched, per FR-005)
```

No entity here is stored or manipulated by application code — both are fully owned and
persisted by the Vercel platform. Nothing to add to `src/` for this.
