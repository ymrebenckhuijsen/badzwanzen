---

description: "Task list for feature implementation"
---

# Tasks: Kleinere sessie-kaartpoel (50-55 kaarten)

**Input**: Design documents from `/specs/012-session-pool-size-50/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included — Constitution Principle II (TDD, NON-NEGOTIABLE) requires a failing test
before implementation for any behavior change; this feature has exactly one existing test file
whose boundary assertions must move first.

**Organization**: This feature has a single user story (spec.md User Story 1, P1). No Setup or
Foundational phase is needed — it's a two-constant edit to an existing, already-scaffolded
project (features 001/004), not new infrastructure.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)

## Path Conventions

Single project (Vite/React), paths relative to repository root, per plan.md's Project Structure.

---

## Phase 1: User Story 1 - Een kortere, voorspelbaardere spelsessie (Priority: P1) 🎯 MVP

**Goal**: Every new session's draw pool is sized randomly between 50 and 55 cards (inclusive),
instead of the current 60-80, while still always guaranteeing at least 4 virus cards.

**Independent Test**: Run `buildSessionCardPool` repeatedly against a valid card set and verify
every resulting `poolCardIds.length` is `>= 50 && <= 55`, with `>= 4` virus ids present each
time (per spec.md Acceptance Scenarios 1-2 and quickstart.md's automated check).

### Tests for User Story 1 ⚠️

> **NOTE**: Write this test change FIRST and observe it FAIL before touching the implementation
> (Constitution Principle II).

- [X] T001 [US1] In `src/features/cards/buildSessionCardPool.test.ts`, update the first test
      (`'produces a pool sized between 60 and 80 cards, inclusive'`) to assert
      `pool.poolCardIds.length` is `>= 50` and `<= 55`, and rename its description to
      `'produces a pool sized between 50 and 55 cards, inclusive'`. Run
      `npm test -- buildSessionCardPool` and confirm this test now FAILS (the unchanged
      implementation still produces 60-80, outside the new assertion window) while the other
      five tests in the file continue to pass unmodified.

### Implementation for User Story 1

- [X] T002 [US1] In `src/features/cards/buildSessionCardPool.ts`, change `MIN_POOL_SIZE` from
      `60` to `50` and `MAX_POOL_SIZE` from `80` to `55` (depends on T001 being observed red).
- [X] T003 [US1] Run `npm test -- buildSessionCardPool` and confirm all six tests in
      `src/features/cards/buildSessionCardPool.test.ts` now pass, including the updated
      boundary test from T001 (depends on T002).

**Checkpoint**: User Story 1 is fully functional and independently testable — every session
draw pool is now sized 50-55 with the virus guarantee intact.

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: Confirm no regressions elsewhere and validate the change end-to-end per
quickstart.md.

- [X] T004 [P] Run the full test suite (`npm test`) and linter (`npm run lint`) from the
      repository root and confirm both are clean (no regressions in
      `src/features/cards/validateCardSet.test.ts`, `useDrawPile`, or other consumers of
      `buildSessionCardPool`).
- [X] T005 Follow `specs/012-session-pool-size-50/quickstart.md`'s manual/browser check: start
      `npm run dev`, set up a session, play through to the end-of-game screen, and confirm the
      session ends after drawing between 50 and 55 cards.

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 1)**: No Setup/Foundational phase precedes it — can start immediately.
- **Polish (Phase 2)**: Depends on Phase 1 (T003) being complete.

### Within User Story 1

- T001 (failing test) → T002 (constants edited) → T003 (test passes). Strictly sequential —
  all three touch the same two files and must be observed red before green per Constitution
  Principle II.

### Parallel Opportunities

- None within Phase 1 — T001, T002, T003 form a single Red→Green→Verify sequence on the same
  two files.
- T004 in Phase 2 is marked `[P]` (independent of T005, no shared file) but both still require
  T003 complete first.

---

## Implementation Strategy

### MVP First (and only) — User Story 1

1. Complete Phase 1 (T001-T003): the entire feature.
2. **STOP and VALIDATE**: run Phase 2 (T004-T005) to confirm no regressions and to manually
   observe the new range end-to-end.
3. Open a pull request per Constitution Principle V.

There is no incremental multi-story delivery here — the feature is a single, small, complete
change.

---

## Notes

- [P] tasks = different files, no dependencies
- Verify T001 fails before starting T002 (Red-Green-Refactor, Constitution Principle II)
- Commit after T003 (feature complete) and optionally again after Phase 2 validation
- Avoid: touching `validateCardSet.ts`'s `MIN_CARDS`, `MIN_VIRUS_IN_POOL`, or any file outside
  `buildSessionCardPool.ts`/`buildSessionCardPool.test.ts` — out of scope per spec.md
  Assumptions and research.md
