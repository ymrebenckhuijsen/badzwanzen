# Implementation Plan: Max Active Viruses

**Branch**: `011-max-active-viruses` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-max-active-viruses/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Cap the number of *different* concurrently-active viruses at 4, and give every virus card its
own unique end-of-virus message so players can tell which virus ended even when several are
active at once. Both requirements extend existing feature-004 mechanics (`useVirusEffects`,
`useDrawPile`, virus card content) rather than introducing new screens or components (design
step confirmed `No UI Impact`). The cap is enforced by extending the draw pile's existing
skip-and-continue scan (already used to skip cards whose targeting can't resolve) with one more
skip condition; a skipped virus card stays in the pool rather than being discarded. Unique end
messages are enforced as a new `validateCardSet` rule and satisfied by hand-authoring distinct
`liftText` content for the 59 virus cards in `badzwanzen-card-set.ts` (the 8 virus cards in
`seed-card-set.ts` already have unique `liftText` and need no changes).

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: React 19, Vite 8, TailwindCSS v4 (no new dependencies introduced)

**Storage**: N/A — in-memory session state only, no persistence involved in this feature

**Testing**: Vitest + React Testing Library (existing project stack)

**Target Platform**: Mobile-first responsive web (single shared phone/laptop screen)

**Project Type**: Single-page web app (frontend only, no backend)

**Performance Goals**: N/A — draw-pile scanning stays O(pool size) (60–80 cards), same order of
work the existing scan already does; no measurable performance impact

**Constraints**: Must remain zero-cost/client-side per Constitution IV; no new runtime
dependencies

**Scale/Scope**: Small, contained change: one hook (`useDrawPile`) gets a new skip condition and
one new parameter; `GameScreen` wires a derived active-virus count into it; `validateCardSet`
gets one new rule; `badzwanzen-card-set.ts` gets 59 `liftText` content edits. No new
components, hooks, routes, or screens.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec-Driven Development**: PASS — this plan follows an approved `spec.md` with its one
  clarification already resolved; `/speckit-tasks` will follow this plan.
- **II. Test-First (TDD)**: PASS (planned) — Phase 2 tasks (via `/speckit-tasks`) MUST add
  failing tests first for: (a) `useDrawPile` skipping a virus draw at the 4-virus cap and
  retaining the skipped card for a later draw, (b) `validateCardSet` flagging duplicate
  `liftText` values across virus cards. No exemption needed; both targets have a natural
  Vitest home (existing `useDrawPile.test.ts` and `validateCardSet.test.ts`).
- **III. Simplicity & YAGNI**: PASS — reuses the existing scan-and-skip pattern in
  `useDrawPile.draw()` rather than introducing a new mechanism (e.g. a separate deferred-card
  queue or a virus-priority system); no speculative configuration (the cap of 4 is a literal
  constant, not a configurable option, since nothing in the spec asks for that).
- **IV. Zero-Cost, Client-Side Architecture**: PASS — no server, no new dependency, no paid
  service; purely client-side logic and content changes.
- **V. Quality Gates (CI + Review)**: PASS (planned) — ships on `011-max-active-viruses`, PR
  into `main`, CI (test + lint) must be green before merge.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/011-max-active-viruses/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── DESIGN.md            # Design addendum — Status: No UI Impact
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: this feature has no external interface (no API, no CLI, no library
surface) — it's an internal change to the existing card-draw and virus-effect logic, consistent
with how prior internal-logic features (e.g. `004-assignments-and-viruses`,
`008-end-of-game`) were planned.

### Source Code (repository root)

```text
src/
├── features/
│   ├── cards/
│   │   ├── useDrawPile.ts              # MODIFIED: add virus-cap skip condition + new param
│   │   ├── useDrawPile.test.ts         # MODIFIED: new cap-skip test cases
│   │   ├── validateCardSet.ts          # MODIFIED: add duplicate-liftText rule
│   │   ├── validateCardSet.test.ts     # MODIFIED: new duplicate-liftText test cases
│   │   └── data/
│   │       └── badzwanzen-card-set.ts  # MODIFIED: unique liftText per virus card (59 edits)
│   └── virus/
│       └── useVirusEffects.ts          # UNCHANGED: already exposes per-effect status/cardId,
│                                        # which is all GameScreen needs to derive the active
│                                        # virus count
└── App.tsx                             # MODIFIED: derive active virus count from `effects`
                                         # and pass it into useDrawPile
```

**Structure Decision**: Single existing frontend project (`src/`), no new directories. This
feature only touches the `cards` feature (draw-pile scanning + card-set validation/content) and
`App.tsx`'s wiring between `useVirusEffects` and `useDrawPile`; the `virus` feature's hook and
components are consumed as-is, unchanged.

## Complexity Tracking

*No violations — table intentionally omitted.*
