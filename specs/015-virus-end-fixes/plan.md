# Implementation Plan: Virus-eindegedrag repareren + nieuwe kaarten

**Branch**: `015-virus-end-fixes` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-virus-end-fixes/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Two bugfixes plus a content addition to the existing Badzwanzen card game:

1. When a viruskaart targets "iedereen" (general targeting), every affected player currently
   gets an independently randomized end-of-virus moment (`liftThreshold` is rolled per player).
   The fix rolls one shared `liftThreshold` per virus *activation* instead of per affected
   player, so all players hit by the same "iedereen" virus lift together on the same draw turn.
2. Confirm and lock in (via an explicit regression test) that virus-lift events never shrink the
   session draw pile — `useDrawPile`'s `remainingCardIds` already only changes on an actual
   `draw()` call, so this is a protective test addition, not a behavior change.
3. Convert the user-supplied raw text (`new-questions-raw.txt`) into new `Card` entries appended
   to the existing Badzwanzen card set (`badzwanzen-card-set.ts`), each with a unique,
   content-specific `liftText` for the new virus cards, following the existing conversion
   pattern from features 010/014.

## Technical Context

**Language/Version**: TypeScript ~6.0 (React 19), targeting evergreen browsers via Vite

**Primary Dependencies**: React 19, Vite 8, TailwindCSS 4 (no new dependencies needed)

**Storage**: N/A — card set is a static in-repo TypeScript data file (`badzwanzen-card-set.ts`);
no persistence changes

**Testing**: Vitest (unit/hook tests) + React Testing Library (already in use for
`useVirusEffects.test.ts`, `useDrawPile.test.ts`, `badzwanzen-card-set.test.ts`)

**Target Platform**: Mobile-first responsive web (static site), no platform-specific work

**Project Type**: Single-page web application (Vite + React), existing `src/features/*` structure

**Performance Goals**: No new performance requirements — same in-memory, client-side game loop

**Constraints**: Must not change `useDrawPile`'s public behavior/signature; must not introduce a
new card set or new UI screens (per spec Assumptions); extended card set must still pass
`validateCardSet` (≥80 cards, ≥4 virus cards, correct `{player}` token counts, unique virus
`liftText`)

**Scale/Scope**: Touches 2 existing hooks (`useVirusEffects.ts`, regression coverage for
`useDrawPile.ts`) and 1 data file (`badzwanzen-card-set.ts`), adding ~150 new card entries
converted from `new-questions-raw.txt`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec-Driven Development**: PASS — this plan follows an approved `spec.md` under
  `specs/015-virus-end-fixes/`; no clarification markers remain.
- **II. Test-First (TDD)**: PASS (planned) — `tasks.md` (next command) must sequence a failing
  test before each behavior change: a new/updated `useVirusEffects.test.ts` case proving shared
  simultaneous lift for "general" targeting before the `useVirusEffects.ts` change, a new
  `useDrawPile.test.ts` regression case for FR-003, and `badzwanzen-card-set.test.ts` /
  `validateCardSet.test.ts` coverage for the new cards.
  This gate is re-checked, not pre-satisfied, by this plan; `/speckit-tasks` enforces the actual
  ordering.
- **III. Simplicity & YAGNI**: PASS — the fix is a one-line change in scope (roll the random
  threshold once per activation, not per target), no new abstraction layer; new content reuses
  the existing `Card`/`CardSet` shape.
- **IV. Zero-Cost, Client-Side Architecture**: PASS — no server, no new dependency, no paid
  service; everything stays static-site/client-side.
- **V. Quality Gates (CI + Review)**: PASS (process, not this plan) — feature already has a
  branch (`015-virus-end-fixes`); PR/CI/review happens at merge time as usual.

No violations — Complexity Tracking table below is not needed.

**Post-Phase 1 re-check**: Phase 0 (research.md) and Phase 1 (data-model.md, contracts/,
quickstart.md) introduced no new dependency, no server/backend, no new abstraction, and no new
UI. All five gates above still PASS unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/015-virus-end-fixes/
├── plan.md                     # This file (/speckit-plan command output)
├── research.md                 # Phase 0 output (/speckit-plan command)
├── data-model.md                # Phase 1 output (/speckit-plan command)
├── quickstart.md                # Phase 1 output (/speckit-plan command)
├── contracts/                   # Phase 1 output (/speckit-plan command)
│   └── new-cards-format.md
├── new-questions-raw.txt        # Already present — raw source text for User Story 3
├── DESIGN.md                    # Already present — Status: No UI Impact
└── tasks.md                     # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This feature stays entirely within the existing single-project Vite/React layout — no new
top-level directories.

```text
src/
├── features/
│   ├── virus/
│   │   ├── useVirusEffects.ts       # FR-001: roll one shared liftThreshold per activation
│   │   │                            #   instead of per targeted player
│   │   ├── useVirusEffects.test.ts  # New/updated test: "general" targeting lifts together
│   │   ├── virus.types.ts           # Unchanged (ActiveVirusEffect shape stays the same)
│   │   ├── ActiveVirusList.tsx      # Unchanged
│   │   └── VirusLiftCard.tsx        # Unchanged
│   └── cards/
│       ├── useDrawPile.ts           # Unchanged (FR-003 already holds) — regression test only
│       ├── useDrawPile.test.ts      # New regression case: virus lift doesn't shrink the pool
│       └── data/
│           ├── badzwanzen-card-set.ts       # FR-004/005/006: append new converted cards
│           └── badzwanzen-card-set.test.ts  # Extend: new content passes validateCardSet
└── (no other files touched)
```

**Structure Decision**: Single-project structure (existing `src/features/*` module layout).
No backend, no new modules — this feature is two targeted hook fixes plus additive data-file
content within the current codebase.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Not applicable — no Constitution Check violations were identified.
