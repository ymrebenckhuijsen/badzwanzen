---

description: "Task list for feature 017-virus-duration"
---

# Tasks: Kortere, begrensde virusduur

**Input**: Design documents from `/specs/017-virus-duration/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: Included — Constitution Principle II (TDD, NON-NEGOTIABLE) applies to this
application-logic change; the failing-test-first task below is mandatory, not optional.

**Organization**: Single user story (P1) — no Setup or Foundational phase needed; this is a
two-constant edit inside one already-existing, already-tested hook.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US1]**: Belongs to User Story 1 (the only story in this feature)

---

## Phase 1: User Story 1 - Een virus duurt hooguit 15-20 kaarten (Priority: P1) 🎯 MVP

**Goal**: Every newly activated virus gets a `liftThreshold` uniformly random in `[15, 20]`
(inclusive), replacing today's `[10, 50]`, with all other virus-duration behavior (shared
"iedereen" roll, forced end on empty deck) unchanged.

**Independent Test**: Run `npm run test -- src/features/virus/useVirusEffects.test.ts` and
confirm every `liftThreshold` assertion holds within `[15, 20]`; manually draw cards in a live
session and count that a virus never lifts before the 15th opdracht-/spelkaart and always by
the 20th (see [quickstart.md](./quickstart.md)).

### Tests for User Story 1 ⚠️

> Write these first, run them, and confirm they FAIL against the current `[10, 50]` constants
> before touching implementation code.

- [X] T001 [US1] Update the existing lower-bound assertion in
  `src/features/virus/useVirusEffects.test.ts` (`'creates one independent active effect per
  resolved target player'` test) from `expect(effect.liftThreshold).toBeGreaterThanOrEqual(10)`
  to `toBeGreaterThanOrEqual(15)`, and add `expect(effect.liftThreshold).toBeLessThanOrEqual(20)`
  alongside it. Run the file and confirm this new upper-bound assertion FAILS against the
  current `[10, 50]` constants (red).

### Implementation for User Story 1

- [X] T002 [US1] In `src/features/virus/useVirusEffects.ts`, change `MIN_LIFT_THRESHOLD` from
  `10` to `15` and `LIFT_THRESHOLD_RANDOM_SPREAD` from `41` to `6` (yields `liftThreshold` in
  `[15, 20]` inclusive — see [research.md](./research.md) for the arithmetic). Update the
  constant's trailing comment to say `// yields liftThreshold in [15, 20]` instead of
  `[10, 50]`.
- [X] T003 [US1] Run `npm run test -- src/features/virus/useVirusEffects.test.ts` and confirm
  all tests pass (green), including T001's updated/new assertions and the untouched
  same-threshold-per-activation and forced-end tests.

**Checkpoint**: User Story 1 is fully functional — virus duration is capped to 15-20 draws,
verified by automated tests.

---

## Phase 2: Polish & Cross-Cutting Concerns

- [X] T004 [P] Run the full test suite (`npm run test`) and linter (per `package.json` script,
  e.g. `npm run lint`) to confirm no regressions elsewhere in the repo.
- [X] T005 Walk through [quickstart.md](./quickstart.md)'s manual validation section in a live
  `npm run dev` session: draw cards until a virus activates, count opdracht-/spelkaarten until
  it lifts, confirm the count is within `[15, 20]`, and repeat a few times to see the count vary
  (SC-002).

---

## Dependencies & Execution Order

- **T001** has no dependencies — can start immediately.
- **T002** depends on T001 being written and observed failing (Red-Green-Refactor).
- **T003** depends on T002.
- **T004, T005** depend on T003 (US1 complete).

### Parallel Opportunities

None meaningful — this feature touches a single file plus its single test file sequentially
(test-first, then implementation). T004 could run in parallel with T005 if desired, but both
are quick enough to just run in sequence.

---

## Implementation Strategy

### MVP First (and only) — User Story 1

1. T001: write/update failing tests.
2. T002: change the two constants.
3. T003: confirm green.
4. T004-T005: polish/regression check + manual live validation.
5. Done — this is the entire feature; no further phases planned.

---

## Notes

- [Story] label: all tasks are [US1] except the cross-cutting polish tasks in Phase 2.
- Verify T001's new upper-bound assertion fails before T002 (TDD discipline, Constitution II).
- Commit after the Red step (T001) and after the Green step (T002-T003) as two logical commits,
  or as the user prefers.
