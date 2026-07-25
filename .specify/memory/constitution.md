<!--
Sync Impact Report
==================
Version change: [TEMPLATE] → 1.0.0 (initial ratification)
Modified principles: n/a (first concrete version, template placeholders replaced)
Added sections:
  - I. Spec-Driven Development (NON-NEGOTIABLE)
  - II. Test-First (TDD, NON-NEGOTIABLE)
  - III. Simplicity & YAGNI
  - IV. Zero-Cost, Client-Side Architecture
  - V. Quality Gates (CI + Review)
  - Technology Constraints
  - Development Workflow
  - Governance
Removed sections: none (template placeholders only)
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (generic "Constitution Check" gate remains compatible, no edit needed)
  - .specify/templates/spec-template.md ✅ (no constitution-specific references, no edit needed)
  - .specify/templates/tasks-template.md ✅ (generic structure remains compatible, no edit needed)
  - .claude/skills/speckit-*/SKILL.md ✅ (agent-agnostic, no CLAUDE-only references found)
Follow-up TODOs: none
-->

# Badzwanzen Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

Every feature MUST go through the Spec Kit flow before implementation code is written:
`/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
No feature branch may contain application code that does not trace back to an approved
`spec.md`, `plan.md`, and `tasks.md` under `specs/[###-feature-name]/`. Ambiguities MUST be
resolved via `/speckit-clarify` (or explicit `NEEDS CLARIFICATION` markers) rather than silently
assumed. Rationale: this is a hobby project used to practice the discipline of spec-driven
development itself, not just to ship a game — skipping the flow defeats the purpose of the
project.

### II. Test-First (TDD, NON-NEGOTIABLE)

Tests MUST be written before implementation, MUST be observed to fail, and only then may
implementation code be written to make them pass (Red-Green-Refactor). Testing stack is
Vitest for unit/logic tests and React Testing Library for component tests. A task list that
introduces behavior (game logic, scoring, question/player flow) without a preceding failing
test is incomplete. Rationale: TDD is an explicit learning goal for the student on this
project, alongside being good engineering practice.

### III. Simplicity & YAGNI

Build only what the current feature's spec requires. No speculative abstractions, no
frameworks-within-frameworks, no premature configuration options "for later." Prefer three
similar lines of code over a shared abstraction used only twice. Rationale: as a hobby project
maintained by two people in spare time, complexity that isn't earned yet is the main risk to
the project ever getting finished.

### IV. Zero-Cost, Client-Side Architecture

The application MUST run entirely client-side (static site: Vite + React + TailwindCSS) with
no server, no database, and no user accounts, since gameplay happens locally around one shared
phone or laptop. Any persistence (e.g. custom question sets, players) MUST use client-side
storage (e.g. `localStorage`) — not a backend. The project MUST stay deployable on Vercel's
free hosting tier, and no paid service, API, or infrastructure may be introduced without an
explicit constitution amendment. Rationale: this is a non-commercial hobby project; the
constraint of "free to run" is a hard requirement, not a preference.

### V. Quality Gates (CI + Review)

Every change MUST go through a feature branch and a pull request on GitHub — even when both
contributors are working side by side on one machine — and MUST be reviewed before merging to
`main`. GitHub Actions CI MUST run the test suite and linter on every push and pull request;
merging is blocked while CI is red. Rationale: the PR/CI discipline is itself part of what the
student is here to learn, and it keeps `main` always in a demoable state.

## Technology Constraints

- **Stack**: Vite, React, TailwindCSS, TypeScript-or-JavaScript (decide per project setup, stay
  consistent once chosen).
- **Testing**: Vitest + React Testing Library.
- **Hosting**: Vercel (free tier), deployed as a static site.
- **Target platform**: mobile-first responsive web (primary use is a single phone/laptop
  screen passed around the group), no native app.
- **Source control**: GitHub, using feature branches and pull requests.

## Development Workflow

- Contributors: two people (a student learning software engineering, and an experienced
  software engineer), typically working together at one machine.
- Workflow per feature: create a feature branch → run the Spec Kit flow (Principle I) → write
  failing tests → implement → open a pull request → CI must pass → review (even informal,
  side-by-side review counts) → merge.
- Commits should stay small and map to individual tasks from `tasks.md` where practical.
- Deployment to Vercel is expected to happen automatically from `main` (or is configured to do
  so as part of project setup); no manual, undocumented deployment steps.

## Governance

This constitution supersedes ad-hoc practices for this project. Amendments require agreement
between both contributors and MUST be recorded via `/speckit-constitution`, which updates this
file, bumps the version per semantic versioning, and propagates any required changes to the
Spec Kit templates. Versioning policy:

- **MAJOR**: Backward-incompatible governance changes or removal/redefinition of a principle
  (e.g., dropping the client-side-only constraint).
- **MINOR**: A new principle or materially expanded guidance is added.
- **PATCH**: Wording, clarification, or non-semantic fixes.

Every pull request implicitly asserts compliance with this constitution; a reviewer who spots a
violation should raise it before merging rather than after. Complexity that violates Principle
III or IV MUST be justified in the relevant `plan.md`'s Complexity Tracking table or rejected.

**Version**: 1.0.0 | **Ratified**: 2026-07-25 | **Last Amended**: 2026-07-25
