# Implementation Plan: Deployment naar Vercel

**Branch**: `005-deployment` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-deployment/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Deploy the existing static Vite + React Badzwanzen app to Vercel, connected to the GitHub
repository so that every push/merge to `main` triggers an automatic production deployment and
every pull request gets its own preview deployment. Technical approach: no application code
changes are needed — this is a configuration + account-setup feature. A `vercel.json` file
pins the build command, output directory, and framework preset in the repo (so the deployment
config is reproducible and reviewable, not just a dashboard setting), and the Vercel GitHub
App is installed against this repository to wire up the automatic build/deploy triggers and
PR checks.

## Technical Context

**Language/Version**: N/A (no new application code; existing project is TypeScript 6 /
React 19, unchanged)

**Primary Dependencies**: Vercel platform (GitHub App + hosting), existing `npm run build`
(`tsc -b && vite build`)

**Storage**: N/A (static site, no data persistence introduced)

**Testing**: No Vitest/RTL tests apply — this is infrastructure/developer-tooling config, not
application behavior. Per Constitution Principle II's non-application-tooling exemption, this
feature instead defines a deterministic manual verification procedure in `quickstart.md`
(push to a test branch → observe preview deploy; merge to `main` → observe production deploy;
intentionally break the build → observe previous deployment stays live). Logged below under
Complexity Tracking as required by that exemption.

**Target Platform**: Vercel static hosting (Vite SPA build output served from `dist/`)

**Project Type**: web — single frontend project (no backend), matches existing repo layout

**Performance Goals**: N/A beyond Vercel's standard CDN static-hosting performance; no
custom targets introduced by this feature

**Constraints**: Must stay on Vercel's free "Hobby" tier (Constitution Principle IV); no
server, database, or paid add-on may be introduced

**Scale/Scope**: Single Vercel project, one repository, two branches of traffic (production
`main` + PR previews); hobby-project scale (not a scale-sensitive feature)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec-Driven Development**: PASS — this plan follows `spec.md`; no code will be written
  outside the traced `spec.md` → `plan.md` → `tasks.md` chain.
- **II. Test-First (TDD)**: PASS via documented exemption — no application code/behavior is
  introduced, so there is no Vitest/RTL surface to test. The required deterministic
  verification procedure is documented in `quickstart.md` and logged in Complexity Tracking
  below, as the exemption requires.
- **III. Simplicity & YAGNI**: PASS — scope is limited to what FR-001..FR-009 require: account,
  project link, prod-branch config, and an explicit `vercel.json`. No CI pipeline duplication,
  no custom domain, no environment-variable management is added since nothing needs it.
- **IV. Zero-Cost, Client-Side Architecture**: PASS — this feature is precisely what Principle
  IV already mandates ("MUST stay deployable on Vercel's free hosting tier"); it implements
  that requirement rather than deviating from it. Free Hobby tier only, no server/backend
  introduced.
- **V. Quality Gates (CI + Review)**: PASS — existing GitHub Actions CI (lint + test) is
  untouched and continues to gate PRs independently of Vercel's own build; this feature adds a
  second, complementary GitHub check (Vercel deployment status) rather than replacing CI.

No violations — Complexity Tracking table below only documents the Principle II tooling
exemption usage, not a rule violation.

## Project Structure

### Documentation (this feature)

```text
specs/005-deployment/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: this feature exposes no API/CLI/component interface — it is
external platform configuration (Vercel account/project) plus one repo-root config file.

### Source Code (repository root)

```text
vercel.json             # New: pins build command, output dir, and framework preset so
                         # deployment config is reproducible from the repo (FR-009),
                         # instead of living only in the Vercel dashboard.
README.md                # Updated: short "Deployment" section documenting the Vercel
                         # setup and how production/preview deployments work.
```

No changes to `src/`, `tests/`, or `.github/workflows/ci.yml` — the existing app code and CI
pipeline are untouched. This feature only adds repo-root deployment configuration.

**Structure Decision**: Single existing frontend project (Vite + React), no new source
directories. This feature is additive, repo-root configuration only (`vercel.json` +
README docs) plus external Vercel account/project setup — no `frontend`/`backend` split and
no `contracts/` needed since there is no API surface.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No Constitution violations. One documented exemption use (not a violation):

| Exemption Used | Why Needed | Verification Substitute |
|-----------------|------------|--------------------------|
| Principle II's non-application-tooling exemption (no Vitest/RTL tests) | Feature is deployment configuration (Vercel account, `vercel.json`, GitHub integration) with no application behavior to unit/component-test | `quickstart.md` defines a deterministic manual red→green verification: (1) push to a test branch and confirm a preview deployment appears, (2) merge to `main` and confirm production updates within minutes, (3) intentionally break the build and confirm the previous production deployment stays live and the broken build is not published |
