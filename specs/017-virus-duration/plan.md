# Implementation Plan: Kortere, begrensde virusduur

**Branch**: `017-virus-duration` | **Date**: 2026-08-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-virus-duration/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Cap virus duration to a random threshold between 15 and 20 drawn opdracht-/spelkaarten
(inclusive), replacing the current 10-50 range. This is a two-constant change in
`src/features/virus/useVirusEffects.ts` (`MIN_LIFT_THRESHOLD`, `LIFT_THRESHOLD_RANDOM_SPREAD`):
no new UI, no new data shape, no change to the shared "iedereen" duration behavior (feature
015/016) or the forced-end-on-empty-deck behavior — only the range the existing random roll
draws from.

## Technical Context

**Language/Version**: TypeScript, Vite + React (existing project stack)

**Primary Dependencies**: React (hooks), no new dependencies

**Storage**: N/A — in-memory session state only (`useVirusEffects` hook state), no persistence

**Testing**: Vitest + React Testing Library, via `@testing-library/react`'s `renderHook`/`act`
(existing pattern in `src/features/virus/useVirusEffects.test.ts`)

**Target Platform**: Mobile-first responsive web (existing target, unaffected by this feature)

**Project Type**: Single Vite/React web app (existing structure, no new project)

**Performance Goals**: N/A — no performance-sensitive change (single arithmetic constant swap)

**Constraints**: Threshold must be an integer in [15, 20] inclusive, with random spread
preserved (not a fixed value) per FR-001/FR-002

**Scale/Scope**: Single hook (`useVirusEffects.ts`), its existing test file, and the
`liftThreshold` documentation comment — no other files affected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec-Driven Development**: PASS — following the full flow
  (`specify` → `clarify` skipped as spec had no `NEEDS CLARIFICATION` markers, confirmed by the
  requirements checklist → `plan` → `tasks` → `implement`).
- **II. Test-First (TDD)**: PASS — this is application game logic
  (`useVirusEffects.ts`), so the non-application-tooling exemption does not apply. The existing
  lower-bound test (`liftThreshold >= 10`) must be updated to `>= 15`, and a new upper-bound
  test (`liftThreshold <= 20`) must be added and observed failing against the current
  constants before the constants are changed.
- **III. Simplicity & YAGNI**: PASS — no new abstraction; reuses the existing
  `randomLiftThreshold()` function and its two constants, only their values change.
- **IV. Zero-Cost, Client-Side Architecture**: PASS — no new dependency, storage, or service;
  stays entirely client-side.
- **V. Quality Gates (CI + Review)**: PASS — ships via feature branch + PR + CI, same as every
  prior feature.

No violations. Complexity Tracking not needed.

## Project Structure

### Documentation (this feature)

```text
specs/017-virus-duration/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── DESIGN.md            # No UI Impact addendum
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/features/virus/
├── useVirusEffects.ts       # MIN_LIFT_THRESHOLD, LIFT_THRESHOLD_RANDOM_SPREAD constants
├── useVirusEffects.test.ts  # existing lower-bound test to update + new upper-bound test to add
└── virus.types.ts           # ActiveVirusEffect type (unchanged — liftThreshold stays a number)
```

**Structure Decision**: Existing single-project Vite/React app
(`src/features/virus/`). No new files, directories, or contracts — this feature only edits two
constants and their covering tests inside the existing virus feature module.

## Complexity Tracking

*No violations — this section is not applicable.*
