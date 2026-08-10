# Tasks: Max Active Viruses

**Input**: Design documents from `/specs/011-max-active-viruses/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md (all present; no
`contracts/` — see plan.md). `DESIGN.md`: `Status: No UI Impact`.

**Tests**: Included and REQUIRED — Constitution Principle II (Test-First, NON-NEGOTIABLE) applies
to this application code (hook logic, card-set validation). Every test task below MUST be
written and observed to fail before its paired implementation task.

**Organization**: Tasks are grouped by user story (US1 = P1, US2 = P2) per spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Path Conventions

Single project (per plan.md): `src/features/<feature>/`, tests colocated with source.

---

## Phase 1: Setup

**Purpose**: Project initialization.

None. Every file this feature touches already exists; no new dependencies, folders, or tooling
are needed (see plan.md Technical Context). Proceed straight to Phase 3.

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared by both user stories.

None. US1 (`useDrawPile.ts`, `App.tsx`) and US2 (`validateCardSet.ts`,
`badzwanzen-card-set.ts`) touch disjoint files with no shared setup — see research.md's two
independent decisions. Proceed straight to Phase 3.

**Checkpoint**: Foundation ready (nothing to build) — user story implementation can begin.

---

## Phase 3: User Story 1 - Virus pile-up is capped at 4 (Priority: P1) 🎯 MVP

**Goal**: Never let more than 4 different viruses be active at once; a virus card drawn while at
capacity is skipped (not discarded) and the draw continues to the next eligible card (FR-001
through FR-005).

**Independent Test**: Play a session long enough for 4 different viruses to become active, keep
drawing, and confirm no 5th different virus ever becomes active while those 4 remain — and that
each draw still smoothly produces some card (no dead turn).

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL (or fail to typecheck against the new
> signature) before touching `useDrawPile.ts` or `App.tsx`**

- [X] T001 [P] [US1] In `src/features/cards/useDrawPile.test.ts`, update the existing test
  `'discards a card whose specific targeting needs more players than exist, and immediately
  draws the next one'`: rename it to reflect retention (e.g. `'defers — does not discard — a
  card whose specific targeting needs more players than exist, and immediately draws the next
  eligible one'`) and change its assertion so `remainingCount` is `1` (not `0`) after drawing
  `'resolvable'`, since `'too-many'` is now retained in `remainingCardIds` rather than
  permanently dropped. This is a deliberate behavior change required by FR-004 — see
  research.md Decision 1.
- [X] T002 [P] [US1] In `src/features/cards/useDrawPile.test.ts`, add failing test cases for a
  new `activeVirusCount: number` parameter on `useDrawPile(pool, cardSet, players,
  activeVirusCount)`: (a) drawing a virus card when `activeVirusCount` is below 4 starts it
  normally (returns it, removes it from `remainingCardIds`); (b) with `activeVirusCount` at 4
  and the next pool card a virus card, `draw()` skips it (does not return it, does not remove it
  from `remainingCardIds`) and instead returns/removes the next eligible non-virus card; (c)
  re-rendering the hook with a lower `activeVirusCount` (simulating a virus having ended) then
  calling `draw()` again successfully draws the previously-skipped virus card; (d) a
  `general`-targeting (multi-player) virus card counts as exactly one toward the cap — with 4
  `general`-targeting virus cards already active, a 5th virus card is still skipped regardless
  of player count (FR-002 through FR-005).
- [X] T003 [P] [US1] In `src/App.test.tsx`, add a failing integration test proving the real
  `GameScreen` wiring enforces the cap end-to-end (not just the isolated hook): mock
  `buildSessionCardPool` to return a pool of 5 distinct `general`-targeting virus cards followed
  by one assignment card (all defined inline, mirroring the existing `twoCardPool()`/
  `onePlayerPool()` fixtures); draw through the first 4 virus cards and confirm each becomes
  active (visible via the active-virus list), then draw once more and confirm the 5th virus
  card's effect is NOT active while the assignment card's text is shown instead (SC-001,
  SC-002).

### Implementation for User Story 1

- [X] T004 [US1] Rewrite `draw()` in `src/features/cards/useDrawPile.ts`: add a new
  `activeVirusCount: number` parameter to `useDrawPile(pool, cardSet, players,
  activeVirusCount)`; change the scan from the current "advance a local `ids` pointer and
  discard everything scanned past" approach to an index-based scan over the current
  `remainingCardIds` that, on success, removes only the drawn card's id (via
  `.filter((_, idx) => idx !== i)`) — so every other candidate scanned this call (whether
  skipped for failing `resolveTargets` or for the new cap check) stays in `remainingCardIds`.
  Add the skip condition `card.type === 'virus' && activeVirusCount >= MAX_ACTIVE_VIRUSES` with
  a local `const MAX_ACTIVE_VIRUSES = 4`. Makes T001 and T002 pass.
- [X] T005 [US1] In `src/App.tsx`'s `GameScreen`, reorder so `useVirusEffects()` runs before
  `useDrawPile(...)`, compute `const activeVirusCount = new Set(effects.filter(e => e.status ===
  'active').map(e => e.cardId)).size` (distinct-by-`cardId`, per data-model.md's "Active virus
  count"), and pass it as the 4th argument: `useDrawPile(pool, cardSet, players,
  activeVirusCount)`. Makes T003 pass.

**Checkpoint**: At this point, User Story 1 is fully functional and independently testable — the
4-virus cap holds end-to-end and skipped virus cards stay drawable later.

---

## Phase 4: User Story 2 - Every virus has its own end message (Priority: P2)

**Goal**: Every virus card's `liftText` is unique across the card set, so when a virus ends the
message shown always identifies which one it was (FR-006 through FR-009).

**Independent Test**: With two or more different viruses active at once, end one and confirm its
end message reads differently from what any of the other active viruses' end messages would say.

### Tests for User Story 2

- [X] T006 [P] [US2] In `src/features/cards/validateCardSet.test.ts`: first, fix
  `makeValidCardSet()`'s fixture — its 4 `virus-i` cards currently all share the identical
  `liftText: '{player} is genezen'`, which will become invalid once the new rule lands; give
  each a unique `liftText` (still exactly one `{player}` token each) so the existing `'returns
  no errors for a fully valid card set'` test stays green. Then add a new failing test case:
  two virus cards sharing identical `liftText` produces a `ValidationError` referencing them.

### Implementation for User Story 2

- [X] T007 [US2] In `src/features/cards/validateCardSet.ts`, add a whole-set rule alongside the
  existing per-card checks: group cards where `type === 'virus'` by `liftText`; for any group
  with more than one card, push a `ValidationError` (per data-model.md's Validation rule
  addition). Makes T006's new case pass. Note: this will immediately turn
  `src/features/cards/data/badzwanzen-card-set.test.ts`'s `'passes validateCardSet with zero
  errors'` test red, since all 59 real virus cards currently share one generic `liftText` — that
  failure is the expected red signal driving T008.
- [X] T008 [US2] In `src/features/cards/data/badzwanzen-card-set.ts`, replace the shared
  `liftText: 'Het virus bij {player} is opgeheven.'` on all 59 virus cards (`bz-virus-001`
  through the last `bz-virus-0NN`) with unique, effect-specific Dutch text that names or
  describes what that specific card's `instructionText` no longer applies (one `{player}` token
  each, matching the existing token-count rule). Makes
  `badzwanzen-card-set.test.ts`'s `'passes validateCardSet with zero errors'` test green again.
  No changes expected in `seed-card-set.ts` — its 8 virus cards already have unique `liftText`
  (research.md Decision 2); running `seed-card-set.test.ts` should still pass unmodified as a
  regression check.

**Checkpoint**: All user stories are now independently functional — the cap holds and every
virus's end message is unique.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T009 [P] Run `npm run lint` — confirm no new lint errors
- [X] T010 Run `npm test` — confirm the full suite (existing 74+ tests plus this feature's new
  cases) passes with no regressions
- [X] T011 Run quickstart.md's manual playtest scenario against `npm run dev` — confirm the cap
  and unique end messages hold in real gameplay, not just under test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — skipped
- **Foundational (Phase 2)**: None — skipped
- **User Stories (Phase 3-4)**: No cross-story dependency; US1 and US2 touch disjoint files and
  can proceed in either order or in parallel
- **Polish (Phase 5)**: Depends on both user stories being complete

### Within Each User Story

- US1: T001, T002, T003 (tests, parallelizable) → T004 (makes T001+T002 pass) → T005 (makes T003
  pass, depends on T004's new `useDrawPile` signature)
- US2: T006 (test) → T007 (makes T006 pass, also turns `badzwanzen-card-set.test.ts` red) → T008
  (makes `badzwanzen-card-set.test.ts` green again)

### Parallel Opportunities

- T001, T002, T003 (US1 tests) can be written in parallel — different files
  (`useDrawPile.test.ts` ×2 tasks in the same file are sequential with each other by file-lock
  convention, but `App.test.tsx` is a separate file and can proceed in parallel)
- US1 (T001-T005) and US2 (T006-T008) can be implemented in parallel by different people — no
  shared files
- T009 (lint) can run in parallel with T010 (test) in Phase 5

---

## Parallel Example: User Story 1

```bash
# Launch the two useDrawPile.test.ts edits together conceptually, then App.test.tsx separately:
Task: "Update discard→defer test in src/features/cards/useDrawPile.test.ts"
Task: "Add activeVirusCount cap test cases in src/features/cards/useDrawPile.test.ts"
Task: "Add cap-enforcement integration test in src/App.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3 (User Story 1 — the cap itself)
2. **STOP and VALIDATE**: run `npm test`, then quickstart.md's manual scenario steps 1-3
3. This alone delivers the core mechanic the developer asked for first

### Incremental Delivery

1. User Story 1 (cap) → validate independently → this is already a coherent, shippable
   improvement on its own
2. User Story 2 (unique end messages) → validate independently → completes the full feature
   request
3. Phase 5 polish → final full-suite + manual confirmation before opening the PR

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail before implementing (T001-T003 red before T004-T005; T006 red before
  T007-T008; T007 also intentionally reddens `badzwanzen-card-set.test.ts` until T008 lands)
- Commit after each task or logical group
- No `contracts/` directory — this feature has no external interface (see plan.md)
