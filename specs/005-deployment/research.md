# Phase 0 Research: Deployment naar Vercel

## Decision: Deployment platform integration method

**Decision**: Use Vercel's native GitHub App integration (connect repository via the Vercel
dashboard "Import Project" flow), not the Vercel CLI or a custom GitHub Actions deploy step.

**Rationale**: Vercel's GitHub App is the standard, zero-maintenance way to get automatic
production deploys on push-to-`main` and automatic PR preview deploys with GitHub check
statuses (FR-003, FR-006, FR-007) — all without adding any workflow YAML or secrets to
manage. This matches Constitution Principle III (Simplicity & YAGNI): a bespoke GitHub
Actions deploy job would duplicate functionality Vercel already provides for free and would
need its own secret (`VERCEL_TOKEN`) management.

**Alternatives considered**:
- *Vercel CLI inside a GitHub Actions job*: rejected — adds a secret to manage
  (`VERCEL_TOKEN`), duplicates what the GitHub App already does, and is the pattern Vercel
  itself recommends only when you need custom deploy logic, which this feature doesn't.
- *Netlify / GitHub Pages*: out of scope — Constitution Principle IV names Vercel explicitly
  as the hosting platform.

## Decision: Reproducible build configuration

**Decision**: Add a `vercel.json` at the repo root with explicit `buildCommand`,
`outputDirectory`, and `framework` fields, rather than relying solely on values entered in
the Vercel dashboard.

**Rationale**: Satisfies FR-009 (config MUST be captured in the repo where possible). Vercel's
zero-config Vite detection is close to correct (it defaults the output directory to `dist`),
but this project's `build` script is `tsc -b && vite build` (type-checking runs before the
Vite build), not the bare `vite build` Vercel's framework preset assumes by default. Pinning
`buildCommand: "npm run build"` guarantees the deployed build always includes the
type-check step and keeps the source of truth in git instead of an unreviewable dashboard
setting.

**Alternatives considered**:
- *Rely entirely on Vercel dashboard auto-detection*: rejected — works today but is invisible
  to code review and could silently drift from `package.json`'s actual build script; violates
  FR-009's intent.
- *Add a dedicated `vercel-build` npm script*: rejected as unnecessary — the existing `build`
  script already does exactly what's needed; no reason to introduce a second script per
  Principle III (YAGNI).

## Decision: Routing / rewrites configuration

**Decision**: No SPA rewrite rules are added to `vercel.json`.

**Rationale**: The app has no client-side router (`react-router` or similar is not a
dependency; confirmed via `package.json` and a repo-wide search) — it is a single-route page.
Vercel's default static handling (serve `index.html` at `/`, 404 for unknown paths) is
therefore already correct; adding a catch-all rewrite to `index.html` would be speculative
configuration for a routing scenario that doesn't exist (Principle III).

**Alternatives considered**:
- *Add a `"rewrites": [{ "source": "/(.*)", "destination": "/" }]` catch-all now,
  pre-emptively*: rejected as premature — no current route needs it, and it's trivial to add
  later if/when client-side routing is introduced.

## Decision: Environment variables / secrets

**Decision**: None are configured. No `.env` handling is added to `vercel.json` or the Vercel
project settings.

**Rationale**: The app is a fully static client-side game with no API keys, backend, or
per-environment configuration (Constitution Principle IV, and confirmed by the Assumptions in
`spec.md`). Introducing environment variable plumbing now would be speculative.

## Decision: Custom domain

**Decision**: Out of scope. Use Vercel's assigned `*.vercel.app` production URL.

**Rationale**: Matches `spec.md` Assumptions — no custom domain requirement was given, and
adding DNS configuration would introduce an external dependency (a domain registrar) with no
stated need.
