---

description: "Task list template for feature implementation"
---

# Tasks: Virus-eindegedrag repareren + nieuwe kaarten

**Input**: Design documents from `/specs/015-virus-end-fixes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/new-cards-format.md, quickstart.md

**Tests**: Required — Constitution Principle II (TDD, NON-NEGOTIABLE) mandates a failing test
before implementation code for application behavior. Test tasks below are not optional.

**Organization**: Tasks are grouped by user story (spec.md priorities: US1 P1, US2 P1, US3 P2,
US4 P2) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Paths are exact, relative to repository root

## Path Conventions

Single project (existing Vite/React layout) — `src/features/*`, no new top-level directories.

---

## Phase 1: Setup

**Purpose**: Confirm a clean starting point before making any change.

- [X] T001 Run `npm test` and `npm run lint` from the repository root and confirm both are green
      on the current `015-virus-end-fixes` branch before starting — establishes the baseline
      that all following tasks must not regress.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

None required. User Story 1/2 (`src/features/virus/useVirusEffects.ts`,
`src/features/cards/useDrawPile.ts`) and User Story 3/4 (`src/features/cards/data/badzwanzen-card-set.ts`)
touch entirely disjoint files with no shared setup — every story can start immediately after
Phase 1.

**Checkpoint**: Phase 1 complete — all four user stories can now proceed, in any order or in
parallel.

---

## Phase 3: User Story 1 - Een "iedereen"-virus eindigt voor iedereen tegelijk (Priority: P1) 🎯 MVP

**Goal**: When a viruskaart targets "iedereen" (general targeting), every affected player's
virus effect ends on the same draw turn, instead of each player getting an independently
randomized end moment.

**Independent Test**: Draw a viruskaart with "iedereen" targeting, keep drawing
assignment/game cards, and verify all affected players leave the active-virus list on the same
draw (see quickstart.md steps 3–4).

### Tests for User Story 1 ⚠️

> Write this test FIRST, ensure it FAILS before the implementation task below.

- [X] T002 [P] [US1] In `src/features/virus/useVirusEffects.test.ts`, add a test case asserting
      that a `startEffects('virus-1', ['p-alice', 'p-bob', 'p-carol'], 0)` call produces effects
      that all share the exact same `liftThreshold` value, and that repeated
      `advanceOnAssignmentGameDraw()` calls transition all three effects from `'active'` to
      `'lifted'` on the same call (i.e. the returned `lifted` array from that one call contains
      all three, never a subset). Also assert existing single/small-target behavior is
      unaffected: a `specific`-targeting activation with one target still lifts correctly (reuse
      or lightly adapt the existing "lifts an effect with liftReason 'threshold'" case as the
      regression check for spec.md User Story 1 Acceptance Scenario 2).

### Implementation for User Story 1

- [X] T003 [US1] In `src/features/virus/useVirusEffects.ts`, change `startEffects` so
      `randomLiftThreshold()` is called exactly once per call (once per virus-card activation)
      and that single value is applied to every `ActiveVirusEffect` created for the
      `targetPlayerIds` in that call, instead of calling `randomLiftThreshold()` inside the
      per-player `.map()` (research.md Decision 1). Run `npm test` and confirm T002 now passes.
      (Depends on: T002)

**Checkpoint**: User Story 1 is fully functional and independently testable — an "iedereen"
virus now lifts simultaneously for every affected player.

---

## Phase 4: User Story 2 - Een virus-einde telt niet mee als een getrokken kaart (Priority: P1) 🎯 MVP

**Goal**: Confirm and protect that a virus-lift event never shrinks the session draw pile — only
an actual `draw()` call does.

**Independent Test**: Play a full session to the end; the number of cards actually shown
(assignments + games + viruses) matches the session pool size regardless of how many virus-lift
screens were acknowledged along the way (see quickstart.md step 6).

### Tests for User Story 2 ⚠️

- [X] T004 [P] [US2] In `src/features/cards/useDrawPile.test.ts`, add a regression test that
      renders `useDrawPile` with a small pool, then rerenders the hook with a different
      `activeVirusCount` prop (simulating what happens in `App.tsx` when a virus lifts and the
      derived active-virus count changes) **without calling `draw()`**, and asserts
      `remainingCount` is unchanged. Per research.md Decision 2, this is expected to pass
      immediately with no production code change — it is a characterization/regression test
      that locks in FR-003, guarding against a future regression now that User Story 1 touches
      the same lift-timing code path. Run `npm test` and confirm it passes.

### Implementation for User Story 2

No production code change is required — `useDrawPile.ts`'s `remainingCardIds` already only
mutates inside `draw()` (confirmed in research.md Decision 2). T004 documents and protects this
invariant.

**Checkpoint**: User Story 2 is independently testable and passing — virus-lift events are
proven not to affect the draw pile's remaining-card count.

---

## Phase 5: User Story 3 - Nieuwe vragen, opdrachten, spellen en virussen toevoegen (Priority: P2)

**Goal**: Add all content from `new-questions-raw.txt` as new cards in the existing Badzwanzen
card set, following the authoring contract in `contracts/new-cards-format.md`.

**Independent Test**: Choose the Badzwanzen set, play a session, and verify newly added cards
can be drawn (see quickstart.md step 7).

### Tests for User Story 3 ⚠️

> Write this test FIRST, ensure it FAILS before the implementation task below.

- [X] T005 [US3] In `src/features/cards/data/badzwanzen-card-set.test.ts`, add a test asserting
      `badzwanzenCardSet.cards.length` is at least the pre-feature count (481) plus the number of
      distinct entries in `new-questions-raw.txt` (~150; confirm exact count by counting
      non-empty paragraphs in the file when writing the test), and spot-check that a handful of
      specific converted lines are present (e.g. an `instructionText` recognizably derived from
      "noem binnen 5 seconden de 5 belangrijkste dingen die je naar een onbewoond eiland mee zou
      nemen" and from "geef 3 strafpunten aan degene die jij denkt dat vals speelt"). This test
      must fail against the current (pre-conversion) card set.

### Implementation for User Story 3

- [X] T006 [US3] Convert every paragraph in `specs/015-virus-end-fixes/new-questions-raw.txt`
      into a `Card` object per `specs/015-virus-end-fixes/contracts/new-cards-format.md`, and
      append them to the `badzwanzenCards` array in
      `src/features/cards/data/badzwanzen-card-set.ts`, continuing the existing id counters
      (`bz-opdracht-317+`, `bz-spel-095+`, `bz-virus-072+` — verify the actual current max ids at
      implementation time). Every virus card gets a bespoke, content-specific `liftText` with
      exactly one `{player}` token (contracts/new-cards-format.md; this satisfies User Story 4's
      requirement for these new cards, verified in Phase 6). Run `npm test` and confirm T005 now
      passes, and confirm the existing `badzwanzen-card-set.test.ts` "passes validateCardSet with
      zero errors" test still passes (proves FR-005). (Depends on: T005)

**Checkpoint**: User Story 3 is independently testable — the Badzwanzen set now contains the new
content and still validates.

---

## Phase 6: User Story 4 - Elke viruskaart heeft een eigen, goed eindbericht (Priority: P2)

**Goal**: Every viruskaart in the extended set — existing and newly added — has a unique,
content-specific end message.

**Independent Test**: Run `validateCardSet` over the extended set and confirm no errors about
shared `liftText` (already covered generically by the existing "passes validateCardSet with zero
errors" test); additionally spot-check that new virus cards' end messages are specific, not
generic.

### Tests for User Story 4 ⚠️

- [X] T007 [US4] In `src/features/cards/data/badzwanzen-card-set.test.ts`, add a content-quality
      test that picks a sample of the newly added virus cards (from T006) and asserts each one's
      `liftText` is NOT a generic phrase (e.g. does not equal or trivially reduce to "het virus
      is voorbij") and shares a recognizable keyword/theme with its own `instructionText` — a
      concrete proof of spec.md User Story 4 Acceptance Scenario 2, beyond the existing
      uniqueness-only check. Run `npm test`; if this fails against T006's output, note the
      specific cards that need better `liftText` copy.

### Implementation for User Story 4

- [X] T008 [US4] If T007 flags any new virus card's `liftText` as generic or unrelated to its
      effect, rewrite that card's `liftText` in
      `src/features/cards/data/badzwanzen-card-set.ts` to be bespoke and content-specific per
      `contracts/new-cards-format.md`, keeping it unique across the set. Re-run `npm test` until
      T007 passes. (Depends on: T007; skip if T007 already passes with no flagged cards.)

**Checkpoint**: All four user stories are independently functional. Every viruskaart in the
extended Badzwanzen set has a unique, specific end message.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories together.

- [X] T009 [P] Run `npm test` and `npm run lint` from the repository root and confirm both are
      green with all Phase 3–6 changes applied together.
- [X] T010 Walk through `specs/015-virus-end-fixes/quickstart.md`'s manual validation steps 1–7
      in a local `npm run dev` session — confirm simultaneous "iedereen"-virus lift, correct
      draw-pile counting through a full session, and a sample of new cards appearing with
      correctly substituted `{player}` names.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Empty — no blocking prerequisites exist for this feature.
- **User Stories (Phase 3–6)**: All can start immediately after Phase 1; they touch disjoint
  files (US1/US2 in `virus`/`cards` hooks, US3/US4 in `badzwanzen-card-set.ts`) and have no
  cross-story dependencies except the intra-file ordering noted below.
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Independent — no dependency on other stories.
- **US2 (P1)**: Independent — no dependency on other stories (and, per research.md, requires no
  code change of its own).
- **US3 (P2)**: Independent of US1/US2. T006 (implementation) depends on T005 (its own test)
  within the story.
- **US4 (P2)**: Builds on the content T006 (US3) produces — T007/T008 read the cards T006 adds,
  so US4's tasks should run after T006, even though US3 and US4 are separately, independently
  testable stories per spec.md.

### Within Each User Story

- Tests (T002, T004, T005, T007) MUST be written and observed to fail (or, for T004, observed to
  already pass as a documented characterization test — see research.md Decision 2) before their
  paired implementation task.
- Story complete before moving to the next priority, if working sequentially.

### Parallel Opportunities

- T002 (US1 test), T004 (US2 test), and T005 (US3 test) touch three different files and have no
  dependencies on each other — can be written in parallel.
- T001 and T009 are both full-suite runs and are marked [P] relative to any task they don't
  block/depend on.
- US1 and US2 can be fully implemented in parallel by different people; US3 must land (T006)
  before US4's tasks (T007/T008) make sense to run.

---

## Parallel Example: Phase 3 + Phase 4 together

```bash
# Two independent P1 bugfixes — different files, can be built in parallel:
Task: "Add shared-liftThreshold test in src/features/virus/useVirusEffects.test.ts (T002)"
Task: "Add remainingCount regression test in src/features/cards/useDrawPile.test.ts (T004)"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 — both P1)

1. Complete Phase 1: Setup.
2. Phase 2 is empty — proceed directly to user stories.
3. Complete Phase 3 (US1) and Phase 4 (US2) — these are the two bugfixes and together form the
   MVP: simultaneous "iedereen"-virus end, with the pool-counting invariant explicitly protected.
4. **STOP and VALIDATE**: run `npm test` and the relevant quickstart.md manual steps for US1/US2.
5. This MVP is mergeable/demoable on its own even before the content addition lands.

### Incremental Delivery

1. Setup → Phase 3 (US1) → validate → optionally ship.
2. Phase 4 (US2) → validate → optionally ship (completes the P1 MVP).
3. Phase 5 (US3) → validate → optionally ship (new content playable).
4. Phase 6 (US4) → validate → ship (every virus card, old and new, has a proper end message).
5. Phase 7: final combined validation.

### Parallel Team Strategy

With two contributors (matching this project's usual setup):

1. Both complete Phase 1 together.
2. Developer A: Phase 3 (US1) then Phase 4 (US2) — the bugfix pair.
3. Developer B: Phase 5 (US3) then Phase 6 (US4) — the content-conversion pair.
4. Both converge on Phase 7.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- Verify each test fails (T002, T005, T007) or is confirmed as an intentional
  already-passing characterization test (T004) before writing/accepting the paired
  implementation.
- Commit after each task or logical group, per this project's usual small-commit convention.
- Stop at any checkpoint to validate a story independently.
