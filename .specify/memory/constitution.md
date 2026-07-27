<!--
Sync Impact Report
==================
Version change: 1.1.0 → 1.2.0 (MINOR: materially expanded guidance — explicitly sanctions a
  new testing tool (Playwright) for a testing category the named stack cannot cover; no
  existing requirement was loosened)
Modified principles:
  - II. Test-First (TDD, NON-NEGOTIABLE) — added a paragraph authorizing Playwright for
    visual-regression testing (pixel-level screenshot comparison of rendered UI), since jsdom
    (Vitest's environment) does not perform real rendering and cannot produce pixel output.
    Playwright supplements, not replaces, Vitest/RTL: it covers only visual-regression
    assertions on rendered screens; all other testing stays on Vitest/RTL. Reference
    screenshots MUST be files in the repository (Principle IV — no paid visual-testing SaaS).
Modified sections:
  - Technology Constraints — Testing line now explicitly lists Playwright alongside
    Vitest + React Testing Library, with its scope (visual regression only).
Added sections: none
Removed sections: none
Governance change: none — the existing Complexity Tracking mechanism is unaffected; this
  amendment instead closes the gap that made Complexity Tracking the wrong tool for this case.
Trigger: /speckit-analyze on feature 006-playwright-visual-ci (C1, CRITICAL) found that
  specs/006-playwright-visual-ci/plan.md justified adding Playwright — a tool not named in
  Technology Constraints' Testing line — via the Complexity Tracking table. Governance only
  authorizes that table for Principle II's non-application-tooling exemption or III/IV
  violations, not for expanding a named Technology Constraint. This is structurally the same
  pattern as the 002-git-worktree-setup precedent recorded in this file's own prior Sync
  Impact Report: a plan resting on an ungoverned interpretation instead of an explicit
  amendment. This amendment closes the gap by sanctioning Playwright directly in the
  constitution, rather than leaving 006-playwright-visual-ci's plan.md as a self-justified
  deviation.
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (generic "Constitution Check" gate remains compatible, no edit needed)
  - .specify/templates/spec-template.md ✅ (no constitution-specific references, no edit needed)
  - .specify/templates/tasks-template.md ✅ (generic structure remains compatible, no edit needed)
  - .claude/skills/speckit-*/SKILL.md ✅ (agent-agnostic, no CLAUDE-only references found)
Follow-up TODOs:
  - specs/006-playwright-visual-ci/plan.md: update the Constitution Check row for Principle II
    and the Complexity Tracking table to note that Playwright is now explicitly sanctioned
    (currently phrased as a self-justified deviation) — not done by this command, out of its
    scope (see the /speckit-analyze report for the original C1 finding).
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

This principle governs application code (components, hooks, game logic) built on the
project's Vite/React stack. Internal developer tooling (e.g., shell scripts under
`.specify/scripts/`) that has no natural Vitest/RTL target is exempt from that specific stack
requirement, but MUST still define and document its own deterministic, repeatable
verification procedure (e.g., a `quickstart.md` walkthrough run red → green against real
state) before being considered complete — logged via Complexity Tracking per Governance, not
silently assumed. This exemption does not extend to the application itself.

Visual-regression testing (pixel-level screenshot comparison of rendered UI screens) is
explicitly sanctioned via Playwright, since jsdom (Vitest's test environment) does not perform
real rendering and cannot produce pixel output — a capability gap Vitest/RTL cannot close.
Playwright supplements this principle's named stack rather than replacing it: it covers only
visual-regression assertions on already-rendered screens; all other testing (unit, logic,
component behavior) remains on Vitest/RTL. Reference screenshots MUST be committed as files in
the repository, not hosted via a paid visual-testing SaaS (Principle IV).

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
- **Testing**: Vitest + React Testing Library (unit/logic and component tests); Playwright,
  scoped to visual-regression tests only (screenshot comparison of rendered UI against
  reference images committed in the repository — see Principle II).
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
II (only for the non-application-tooling exemption defined in that principle), III, or IV MUST
be justified in the relevant `plan.md`'s Complexity Tracking table or rejected.

**Version**: 1.2.0 | **Ratified**: 2026-07-25 | **Last Amended**: 2026-07-26
