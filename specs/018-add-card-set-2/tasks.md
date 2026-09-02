---

description: "Task list template for feature implementation"
---

# Tasks: Tweede batch nieuwe vragen toevoegen aan de Badzwanzen-set

**Input**: Design documents from `/specs/018-add-card-set-2/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/new-cards-format.md, quickstart.md

**Tests**: Required — Constitution Principle II (TDD, NON-NEGOTIABLE) mandates a failing test
before implementation code for application behavior. Test tasks below are not optional.

**Organization**: Tasks are grouped by user story (spec.md priorities: US1 P1, US2 P1, US3 P2)
to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths are exact, relative to repository root

## Path Conventions

Single project (existing Vite/React layout) — `src/features/*`, no new top-level directories.

---

## Phase 1: Setup

**Purpose**: Confirm a clean starting point before making any change.

- [X] T001 Run `npm test` and `npm run lint` from the repository root and confirm both are green
      on the current `018-add-card-set-2` branch before starting — establishes the baseline that
      all following tasks must not regress. Also record the current max card ids in
      `src/features/cards/data/badzwanzen-card-set.ts` (`bz-opdracht-383`, `bz-spel-143`,
      `bz-virus-102` at plan time — confirm they're still current) and the current total card
      count (628 at plan time), since later tasks build on these numbers.
      **Confirmed**: 213/213 tests pass, lint clean, ids/count still current (628 cards,
      max ids bz-opdracht-383/bz-spel-143/bz-virus-102).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

None required. This feature touches a single data file
(`src/features/cards/data/badzwanzen-card-set.ts`) and its test — every story below builds on
the same conversion work, so Phase 2 is empty; proceed directly to Phase 3.

**Checkpoint**: Phase 1 complete — User Story 1 can start immediately.

---

## Phase 3: User Story 1 - Meer variatie in de bestaande Badzwanzen-set (Priority: P1) 🎯 MVP

**Goal**: Convert the raw input (`raw-input.md` — three overlapping numbered lists, ~501 raw
lines) into new `Card` entries appended to the existing Badzwanzen card set, so sessions draw
more variety without a new set appearing in the catalog.

**Independent Test**: Choose the Badzwanzen set on the existing card-set selection screen, play
a session, and verify both old and newly added cards can be drawn, with no new set in the
catalog (see quickstart.md steps 1–3, 5).

### Tests for User Story 1 ⚠️

> Write this test FIRST, ensure it FAILS before the implementation task below.

- [X] T002 [US1] In `src/features/cards/data/badzwanzen-card-set.test.ts`, add a test asserting
      `badzwanzenCardSet.cards.length` is at least the pre-feature count (628) plus a
      conservative floor of new, deduplicated entries (150 — the raw batch has ~501 lines across
      three heavily-overlapping lists per research.md Decision 3, so 150 is a deliberately safe
      floor; raise it once the real post-dedup count is known during implementation, per
      contracts/new-cards-format.md's acceptance check). Also spot-check that a small handful of
      specific converted lines are present — including the very first raw line ("Virus iedereen
      praat vanaf nu met een harde G...", per research.md Decision 2) and at least one line from
      each of the three numbered lists in `raw-input.md`. This test must fail against the current
      (pre-conversion) card set. Run `npm test` and confirm it fails.

### Implementation for User Story 1

- [X] T003 [US1] Convert `raw-input.md` into `Card` objects per
      `specs/018-add-card-set-2/contracts/new-cards-format.md`, applying the deduplication filter
      from research.md Decision 3 (skip a line if it's a substance-duplicate of another line in
      this batch or of an existing card — including the closing meta-instruction line itself,
      which is not a card), and append them to the `badzwanzenCards` array in
      `src/features/cards/data/badzwanzen-card-set.ts`, continuing the existing id counters
      (`bz-opdracht-384+`, `bz-spel-144+`, `bz-virus-103+` — verify the actual current max ids
      from T001 first). Every virus card gets a bespoke, content-specific `liftText` with the
      correct `{player}` token count for its targeting (contracts/new-cards-format.md — this
      satisfies User Story 2's requirement for these new cards, verified in Phase 4). Run
      `npm test` and confirm T002 now passes, and confirm the existing `badzwanzen-card-set.test.ts`
      "passes validateCardSet with zero errors" test still passes (proves FR-002/FR-005/FR-008).
      (Depends on: T002)

**Checkpoint**: User Story 1 is fully functional and independently testable — the Badzwanzen set
now contains the new, deduplicated content and still validates.

---

## Phase 4: User Story 2 - Elke viruskaart heeft een eigen, passend eindbericht (Priority: P1)

**Goal**: Every viruskaart in the extended set — existing and newly added — has a unique,
content-specific end message.

**Independent Test**: Run `validateCardSet` over the extended set and confirm no errors about
shared `liftText` (already covered generically by the existing "passes validateCardSet with zero
errors" test); additionally spot-check that new virus cards' end messages are specific, not
generic (see quickstart.md step 4).

### Tests for User Story 2 ⚠️

- [X] T004 [US2] In `src/features/cards/data/badzwanzen-card-set.test.ts`, add a content-quality
      test — mirroring the existing feature-015 pattern already in this file — that selects the
      newly added virus cards (ids added in T003, i.e. `bz-virus-103` and above) and asserts each
      one's `liftText` is NOT a generic phrase (e.g. does not equal or trivially reduce to "het
      virus is voorbij") and shares a recognizable keyword/theme with its own `instructionText` —
      a concrete proof of spec.md User Story 2 Acceptance Scenario 2, beyond the existing
      uniqueness-only check. Run `npm test`; if this fails against T003's output, note the
      specific cards that need better `liftText` copy.

### Implementation for User Story 2

- [X] T005 [US2] If T004 flags any new virus card's `liftText` as generic or unrelated to its
      effect, rewrite that card's `liftText` in
      `src/features/cards/data/badzwanzen-card-set.ts` to be bespoke and content-specific per
      `contracts/new-cards-format.md`, keeping it unique across the set. Re-run `npm test` until
      T004 passes. (Depends on: T004; skip if T004 already passes with no flagged cards.)

**Checkpoint**: Both P1 stories are independently functional. Every viruskaart in the extended
Badzwanzen set has a unique, specific end message — this completes the MVP.

---

## Phase 5: User Story 3 - Geen dubbele vragen in de set (Priority: P2)

**Goal**: Confirm that no two cards in the extended set — across the three overlapping source
lists, and against pre-existing content — ask the same question in substance.

**Independent Test**: Walk the full list of `instructionText`s in the extended set and confirm
no inhoudelijke duplicates remain (see quickstart.md step 6 for the manual, meaning-based
spot-check; T006 below is the cheap automated floor check).

### Tests for User Story 3 ⚠️

- [X] T006 [US3] In `src/features/cards/data/badzwanzen-card-set.test.ts`, add a test asserting
      no two cards in `badzwanzenCardSet.cards` have byte-identical `instructionText` (a cheap
      automated floor check on top of the substantive, meaning-based dedup judgment already
      applied during T003's conversion — per research.md Decision 3, the real dedup work is a
      manual authoring step, not new runtime logic). Run `npm test` immediately after T003 lands:
      this is expected to already pass (a characterization/regression test proving FR-006's floor
      holds), mirroring how feature 015's draw-pile regression test (T004 there) protected an
      already-true invariant rather than driving new code.

### Implementation for User Story 3

No additional implementation is required for the automated floor check — T003's conversion
already applied the dedup filter (research.md Decision 3). If T006 unexpectedly fails (a
byte-identical duplicate slipped through), remove the duplicate `Card` entry from
`src/features/cards/data/badzwanzen-card-set.ts` and re-run `npm test` until T006 passes.

**Checkpoint**: All three user stories are independently functional. The extended Badzwanzen set
has no byte-identical duplicate instructions, and — per the manual quickstart spot-check — no
obvious meaning-level duplicates either.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories together.

- [X] T007 [P] Run `npm test` and `npm run lint` from the repository root and confirm both are
      green with all Phase 3–5 changes applied together.
- [X] T008 Walk through `specs/018-add-card-set-2/quickstart.md`'s manual validation steps 1–6 in
      a local `npm run dev` session — confirm new cards appear with correctly substituted
      `{player}` names, a newly added virus's end message reads as specific to its effect, the
      card-set selection screen still shows the same set list, and no obvious duplicate questions
      surface across a couple of sessions.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Empty — no blocking prerequisites exist for this feature.
- **User Story 1 (Phase 3)**: Starts immediately after Phase 1. This is the core conversion work
  every other story builds on.
- **User Story 2 (Phase 4)**: Depends on Phase 3 (T003) — its tests/fixes operate on the virus
  cards T003 adds, even though US1 and US2 are separately, independently testable stories per
  spec.md.
- **User Story 3 (Phase 5)**: Depends on Phase 3 (T003) for the same reason — its floor check
  runs over the cards T003 adds.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Independent — no dependency on other stories. This is the MVP-defining story.
- **US2 (P1)**: Builds on the content T003 (US1) produces — T004/T005 read the virus cards T003
  adds.
- **US3 (P2)**: Builds on the content T003 (US1) produces — T006 reads the full card list T003
  produces. Independent of US2 (both build on US1, not on each other).

### Within Each User Story

- Tests (T002, T004, T006) MUST be written and observed to fail (T002, T004) — or, for T006,
  observed to already pass as a documented characterization test, per research.md Decision 3 —
  before/alongside their paired implementation task.
- Story complete before moving to the next priority, if working sequentially.

### Parallel Opportunities

- T004 (US2 test) and T006 (US3 test) both only read the cards T003 already added and touch the
  same test file (`badzwanzen-card-set.test.ts`) — write them as separate `describe` blocks; they
  can be authored in parallel but should be added to the file sequentially to avoid merge
  conflicts in the same file.
- T001 and T007 are both full-suite runs; T007 is marked [P] relative to any task it doesn't
  block/depend on.

---

## Parallel Example: Phase 4 + Phase 5 together

```bash
# Both stories only read T003's output and touch the same test file — plan the two
# describe blocks together, then run once:
Task: "Add liftText-specificity test for new virus cards in badzwanzen-card-set.test.ts (T004)"
Task: "Add no-byte-identical-instructionText test in badzwanzen-card-set.test.ts (T006)"
```

---

## Implementation Strategy

### MVP First (User Story 1 — P1)

1. Complete Phase 1: Setup.
2. Phase 2 is empty — proceed directly to User Story 1.
3. Complete Phase 3 (US1) — the full raw-input conversion, deduplicated, appended to the
   Badzwanzen set. This alone is the MVP: more variety, immediately playable.
4. **STOP and VALIDATE**: run `npm test` and quickstart.md steps 1–3, 5.
5. This MVP is mergeable/demoable on its own even before the liftText-quality pass (US2) and the
   dedup floor check (US3) land.

### Incremental Delivery

1. Setup → Phase 3 (US1) → validate → optionally ship.
2. Phase 4 (US2) → validate → optionally ship (completes both P1 stories).
3. Phase 5 (US3) → validate → ship (dedup floor confirmed).
4. Phase 6: final combined validation.

### Parallel Team Strategy

With two contributors (matching this project's usual setup):

1. Both complete Phase 1 together.
2. One contributor drives Phase 3 (US1) — the bulk conversion work — since Phase 4 and 5 both
   depend on its output.
3. Once Phase 3 lands, split: Developer A takes Phase 4 (US2, liftText quality), Developer B
   takes Phase 5 (US3, dedup floor check) — different `describe` blocks in the same test file,
   coordinate to avoid overlapping edits.
4. Both converge on Phase 6.

---

## Notes

- [P] tasks = different files, or same file but easily separable — coordinate to avoid conflicts.
- [Story] label maps task to specific user story for traceability.
- Verify each test fails (T002, T004) or is confirmed as an intentional already-passing
  characterization test (T006) before writing/accepting the paired implementation.
- Commit after each task or logical group, per this project's usual small-commit convention.
- Stop at any checkpoint to validate a story independently.
