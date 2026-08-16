# Implementation Plan: Actieve-virussenlijst verbeteren

**Branch**: `016-virus-list-improvements` | **Date**: 2026-08-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-virus-list-improvements/spec.md`

## Summary

Group the active-virus list's rows so a general-targeted ("iedereen") virus shows as one shared
row instead of one duplicate row per player, lower the concurrent-active-virus cap from 4 to 3,
and make every row (individual or shared) tappable to reveal the underlying virus card(s)'
`instructionText`. All three changes are contained to `ActiveVirusList.tsx` (rendering +
grouping + tap state) and a one-line constant change in `useDrawPile.ts`; no new screens, no new
dependencies, no backend/storage changes. Design approved — see
[DESIGN.md](./DESIGN.md).

## Technical Context

**Language/Version**: TypeScript, React 19 (Vite project, existing stack)

**Primary Dependencies**: React, TailwindCSS v4 (existing design tokens from `/DESIGN.md`) — no
new dependencies

**Storage**: N/A — `effects` state is in-memory (`useVirusEffects`), no persistence change

**Testing**: Vitest + React Testing Library (existing `ActiveVirusList.test.tsx`,
`useDrawPile.test.ts`)

**Target Platform**: mobile-first responsive web (existing)

**Project Type**: Single Vite/React web app (existing structure, no new project)

**Performance Goals**: N/A — small, client-side list render; no measurable perf requirement

**Constraints**: Must reuse existing design tokens/components (no new visual language per
DESIGN.md addendum); tap-to-reveal must be plain component state, no new modal/navigation system
(per spec.md Assumptions)

**Scale/Scope**: One component (`ActiveVirusList.tsx`) gains a grouping step + expand/collapse
state; one constant (`MAX_ACTIVE_VIRUSES`) changes from 4 to 3; `App.tsx` passes `cardSet` (or an
instruction-text lookup) into `ActiveVirusList` as a new prop

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec-Driven Development**: PASS — `spec.md` approved, this `plan.md` follows it, no code
  written yet.
- **II. Test-First (TDD)**: PASS (gate for later phases) — `tasks.md` must sequence failing
  tests before implementation for: (a) grouping logic (iedereen row vs per-player rows), (b) the
  lowered `MAX_ACTIVE_VIRUSES` cap, (c) tap-to-reveal state showing `instructionText`. Existing
  `ActiveVirusList.test.tsx` and `useDrawPile.test.ts` are the natural extension points.
- **III. Simplicity & YAGNI**: PASS — no new abstraction layer; grouping is a plain `Map`/array
  transform mirroring the existing per-player grouping already in the component, following the
  same pattern already established for the end-of-virus screen (`App.tsx`'s `isGroupLift` /
  `targetPlayerId: string | null`, feature 015). Tap-to-reveal is local `useState`, not a new
  interaction system.
- **IV. Zero-Cost, Client-Side Architecture**: PASS — no backend/storage/service involved.
- **V. Quality Gates**: PASS (gate for later phases) — feature branch + PR + CI apply as usual.

No violations; Complexity Tracking not needed.

## Project Structure

### Documentation (this feature)

```text
specs/016-virus-list-improvements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── DESIGN.md              # Design addendum (Approved)
├── design/                # Screenshot + HTML mockup
└── tasks.md              # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── virus/
│   │   ├── ActiveVirusList.tsx        # MODIFIED: grouping + tap-to-reveal
│   │   ├── ActiveVirusList.test.tsx   # MODIFIED: new test cases
│   │   ├── virus.types.ts             # unchanged (ActiveVirusEffect already has cardId)
│   │   └── useVirusEffects.ts         # unchanged
│   └── cards/
│       ├── useDrawPile.ts             # MODIFIED: MAX_ACTIVE_VIRUSES 4 → 3
│       ├── useDrawPile.test.ts        # MODIFIED: cap assertion updated to 3
│       └── card.types.ts              # unchanged (Card.targeting.kind, instructionText exist)
└── App.tsx                            # MODIFIED: passes cardSet (or lookup) into ActiveVirusList
```

**Structure Decision**: Existing single-project Vite/React layout (`src/features/*`), no new
directories. All changes are localized to the `virus` and `cards` features plus the `App.tsx`
wiring between them, consistent with how features 011 and 015 touched this same area.

## Complexity Tracking

*No violations — table not needed.*
