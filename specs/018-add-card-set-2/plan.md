# Implementation Plan: Tweede batch nieuwe vragen toevoegen aan de Badzwanzen-set

**Branch**: `018-add-card-set-2` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-add-card-set-2/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

A pure content addition to the existing Badzwanzen card game: convert the user-supplied raw text
(`raw-input.md` — three separately-numbered, overlapping lists, ~501 raw lines total) into new
`Card` entries appended to the existing Badzwanzen card set (`badzwanzen-card-set.ts`), each with
a unique, content-specific `liftText` for the new virus cards, following the same conversion
pattern as features 010/014/015. Unlike those precedents, this batch is explicitly
**deduplicated**: a raw line that is inhoudelijk a duplicate of an existing card, or of another
line already converted from this same batch, is not added again (FR-006).

## Technical Context

**Language/Version**: TypeScript ~6.0 (React 19), targeting evergreen browsers via Vite

**Primary Dependencies**: React 19, Vite 8, TailwindCSS 4 (no new dependencies needed)

**Storage**: N/A — card set is a static in-repo TypeScript data file (`badzwanzen-card-set.ts`);
no persistence changes

**Testing**: Vitest (unit tests) — already in use for `badzwanzen-card-set.test.ts` /
`validateCardSet.test.ts`

**Target Platform**: Mobile-first responsive web (static site), no platform-specific work

**Project Type**: Single-page web application (Vite + React), existing `src/features/*` structure

**Performance Goals**: No new performance requirements — same in-memory, client-side game loop

**Constraints**: Must not introduce a new card set or new UI screens (per spec Assumptions);
extended card set must still pass `validateCardSet` (≥80 cards, ≥4 virus cards, correct
`{player}` token counts, unique virus `liftText`); new card ids must not collide with existing
ones (current max at plan time: `bz-opdracht-383`, `bz-spel-143`, `bz-virus-102`, 628 cards total
— confirm the actual max at implementation time in case other work landed first); no raw line may
produce a card that duplicates an existing card or another card from this same batch (FR-006, new
vs. prior batches)

**Scale/Scope**: Touches 1 data file (`badzwanzen-card-set.ts`), converting ~501 raw lines
(3 overlapping numbered lists in `raw-input.md`) down to some smaller number of deduplicated new
`Card` entries — the exact final count depends on how much overlap the dedup pass finds

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec-Driven Development**: PASS — this plan follows an approved `spec.md` under
  `specs/018-add-card-set-2/`; no clarification markers remain.
- **II. Test-First (TDD)**: PASS (planned) — `tasks.md` (next command) must sequence a failing
  test before the content lands: `badzwanzen-card-set.test.ts` gets new assertions (card-count
  floor, spot-checks of specific converted lines, non-generic/content-specific `liftText`
  checks per the feature-015 precedent, and — new for this feature — a duplicate-detection
  assertion) written and observed failing before the cards are appended.
  This gate is re-checked, not pre-satisfied, by this plan; `/speckit-tasks` enforces the actual
  ordering.
- **III. Simplicity & YAGNI**: PASS — no new abstraction; new content reuses the existing
  `Card`/`CardSet` shape and the existing `validateCardSet` checks. Deduplication (FR-006) is a
  one-time authoring/review step for this batch, not new production logic or a new automated
  dedup mechanism.
- **IV. Zero-Cost, Client-Side Architecture**: PASS — no server, no new dependency, no paid
  service; everything stays static-site/client-side.
- **V. Quality Gates (CI + Review)**: PASS (process, not this plan) — feature already has a
  branch (`018-add-card-set-2`); PR/CI/review happens at merge time as usual.

No violations — Complexity Tracking table below is not needed.

**Post-Phase 1 re-check**: Phase 0 (research.md) and Phase 1 (data-model.md, contracts/,
quickstart.md) introduced no new dependency, no server/backend, no new abstraction, and no new
UI. All five gates above still PASS unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/018-add-card-set-2/
├── plan.md                     # This file (/speckit-plan command output)
├── research.md                 # Phase 0 output (/speckit-plan command)
├── data-model.md               # Phase 1 output (/speckit-plan command)
├── quickstart.md               # Phase 1 output (/speckit-plan command)
├── contracts/                  # Phase 1 output (/speckit-plan command)
│   └── new-cards-format.md
├── raw-input.md                # Already present — raw source text for User Stories 1-3
├── DESIGN.md                   # Already present — Status: No UI Impact
├── checklists/
│   └── requirements.md         # Already present
└── tasks.md                    # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This feature stays entirely within the existing single-project Vite/React layout — no new
top-level directories.

```text
src/
└── features/
    └── cards/
        └── data/
            ├── badzwanzen-card-set.ts       # FR-001/002/005/006/007/008: append new,
            │                                #   deduplicated converted cards
            └── badzwanzen-card-set.test.ts  # Extend: new content passes validateCardSet,
                                              #   spot-checks, and a no-duplicates assertion
```

**Structure Decision**: Single-project structure (existing `src/features/*` module layout).
No backend, no new modules — this feature is purely additive data-file content within the
current codebase, touching a single data file and its test.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Not applicable — no Constitution Check violations were identified.
