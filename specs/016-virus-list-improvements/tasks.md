# Tasks: Actieve-virussenlijst verbeteren

**Input**: Design documents from `/specs/016-virus-list-improvements/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md (all present; no
`contracts/` — see plan.md). `DESIGN.md`: `Status: Approved`.

**Tests**: Included and REQUIRED — Constitution Principle II (Test-First, NON-NEGOTIABLE) applies
to this application code (component rendering/grouping logic, hook cap logic). Every test task
below MUST be written and observed to fail (or fail to typecheck) before its paired
implementation task.

**Organization**: Tasks are grouped by user story (US1 = P1, US2 = P1, US3 = P2) per spec.md.

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

**Purpose**: Blocking prerequisites shared by multiple user stories.

None as a separate phase — US1 and US3 both touch `ActiveVirusList.tsx`/`ActiveVirusList.test.tsx`
and US3 explicitly builds on US1's row grouping (spec.md: User Story 3 "Ondersteunt de andere
twee user stories"), so that dependency is expressed as US3 coming after US1 below rather than as
a separate foundational phase. US2 (`useDrawPile.ts`) touches disjoint files and has no
dependency on either. Proceed straight to Phase 3.

**Checkpoint**: Foundation ready (nothing to build) — user story implementation can begin.

---

## Phase 3: User Story 1 - Eén gedeelde "iedereen"-rij voor een groepsvirus (Priority: P1) 🎯 MVP

**Goal**: A virus that targets every player renders as exactly one shared "Iedereen" row in the
active-virus list, instead of one duplicate row per player; specifically-targeted virus rows keep
today's per-player behavior unchanged (FR-001, FR-002).

**Independent Test**: Draw a card set until a general-targeting ("iedereen") virus is active,
open the active-virus list, and confirm exactly one "Iedereen" row appears — not one row per
player.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL (or fail to typecheck against the new
> `cardSet` prop) before touching `ActiveVirusList.tsx` or `App.tsx`**

- [X] T001 [US1] In `src/features/virus/ActiveVirusList.test.tsx`, add a `makeCard(id, overrides)`
  helper and a `cardSet: CardSet` fixture (at minimum one `{ kind: 'specific', count: 1 }` card
  with id `'virus-1'`, matching the existing `makeEffect` default `cardId`), then update all 3
  existing `render(<ActiveVirusList effects={effects} players={players} />)` calls to also pass
  `cardSet={cardSet}`. This alone fails to compile until T005 adds the prop (expected red).
- [X] T002 [US1] In the same file, add a new failing test: given one active effect whose card has
  `targeting: { kind: 'general' }` (add e.g. `makeCard('virus-general', { targeting: { kind:
  'general' } })` to the fixture and effects for 3 different `targetPlayerId`s all sharing
  `cardId: 'virus-general'`), the list renders exactly one row with the text "Iedereen" — not one
  row per targeted player (FR-001, SC-001).
- [X] T003 [US1] In the same file, add a new failing test: with both a `general`-targeting virus
  active (→ one "Iedereen" row) and a `specific`-targeting virus active for a different player at
  the same time, the list renders both — the "Iedereen" row AND that player's individual row —
  neither merged nor duplicated (FR-002, Acceptance Scenario 3).
- [X] T004 [US1] In `src/App.test.tsx`'s `'App virus concurrency cap (US1, feature 011)'`
  describe block, update the existing test's assertions for the new grouping: since all 5
  fixture virus cards there use `targeting: { kind: 'general' }`, after drawing the first 4,
  replace `expect(screen.getAllByText('×4').length).toBeGreaterThan(0)` with
  `expect(screen.getAllByText('Iedereen').length).toBe(4)` (four separate shared rows, one per
  active general virus, since each is a distinct `cardId`); after the 5th (skipped) draw, assert
  the "Iedereen" row count stays `4` (not `5`) and the assignment card's text is shown. Leave the
  cap number (`4`) itself untouched here — that is US2's concern (T008 below).

### Implementation for User Story 1

- [X] T005 [US1] In `src/features/virus/ActiveVirusList.tsx`: import `CardSet` from
  `'../cards/card.types'` and add `cardSet: CardSet` to `ActiveVirusListProps`. Rewrite the
  grouping so active effects are first split by their originating `Card.targeting.kind` (look up
  via `cardSet.cards.find(c => c.id === effect.cardId)`): `general`-kind effects group by
  `cardId` into one row each (per data-model.md's `ActiveVirusRow` `kind: 'group'` — label
  "Iedereen", group icon per DESIGN.md's approved mockup), `specific`-kind effects keep today's
  per-`targetPlayerId` grouping (`kind: 'player'`) unchanged, including the existing ×N badge.
  Render both row lists together. Makes T001, T002, T003 pass.
- [X] T006 [US1] In `src/App.tsx`'s `GameScreen`, pass `cardSet={cardSet}` to both
  `<ActiveVirusList>` call sites (the one inside the `currentLift` branch and the one in the
  normal card-drawing branch) — `cardSet` is already in scope. Fixes the remaining TS build
  errors from T005's new required prop, and makes T004 pass end-to-end.

**Checkpoint**: At this point, User Story 1 is fully functional and independently testable — a
group-wide virus shows as one "Iedereen" row, specific-player virus rows are unaffected.

---

## Phase 4: User Story 2 - Maximaal 3 virussen tegelijk actief (Priority: P1)

**Goal**: Lower the concurrent-active-virus cap from 4 to 3; a virus card drawn while at capacity
is still deferred (not discarded), unchanged plumbing from feature 011 (FR-003).

**Independent Test**: Draw cards until 3 different viruses are active, keep drawing, and confirm
no 4th different virus becomes active until one of the 3 lifts.

### Tests for User Story 2

- [X] T007 [P] [US2] In `src/features/cards/useDrawPile.test.ts`'s `'useDrawPile — 4-virus
  concurrency cap (FR-002 through FR-004)'` describe block: rename it to reflect 3, change the
  local `const MAX_ACTIVE_VIRUSES = 4` to `3`, and update in-block comments referencing "4
  different viruses" to "3". This turns the block's three existing cap tests red against the
  still-4 production constant (expected).
- [X] T008 [P] [US2] In `src/App.test.tsx`'s `'App virus concurrency cap...'` describe block
  (already touched by T004): trim the fixture from 5 virus cards + 1 assignment card down to 4
  virus cards + 1 assignment card; reduce the draw loop from 4 to 3 iterations; rename "5th virus
  card is skipped" → "4th virus card is skipped"; update T004's "Iedereen" row-count assertion
  from `4` to `3` after the draw loop, and the overflow check from "no 5th row" to "no 4th row"
  after the extra draw. Turns the test red against the still-4 production constant.

### Implementation for User Story 2

- [X] T009 [US2] In `src/features/cards/useDrawPile.ts`, change `const MAX_ACTIVE_VIRUSES = 4` to
  `const MAX_ACTIVE_VIRUSES = 3`. Makes T007 and T008 pass.

**Checkpoint**: User Stories 1 AND 2 both work independently — grouping holds and the cap is 3.

---

## Phase 5: User Story 3 - De tekst van een actief virus opnieuw kunnen bekijken (Priority: P2)

**Goal**: Tapping any row in the active-virus list (an individual player row or the shared
"Iedereen" row) reveals the original `instructionText` of the underlying virus card(s) — not the
later `liftText` end-message (FR-004, FR-005). Builds on US1's row grouping.

**Independent Test**: Tap a virus row in the active-virus list and confirm the original virus
instruction text appears; tap again to confirm it collapses.

### Tests for User Story 3

- [X] T010 [US3] In `src/features/virus/ActiveVirusList.test.tsx`, add failing tests: (a) no
  instruction text is visible before any row is tapped; (b) tapping a `specific`-targeting
  player's row reveals that card's `instructionText` (distinct from `liftText`, which this
  component is never given — confirm the fixture's `instructionText` and `liftText` differ so the
  test would fail if the wrong field were shown); (c) tapping the "Iedereen" row reveals the
  general virus's `instructionText`; (d) a player row representing 2 simultaneous
  `specific`-targeting effects (reuse the existing ×2 fixture pattern) reveals **both** virus
  cards' `instructionText`s when tapped, not just one (FR-005); (e) tapping an already-expanded
  row again collapses it (its instruction text is no longer in the document).

### Implementation for User Story 3

- [X] T011 [US3] In `src/features/virus/ActiveVirusList.tsx`: add local `useState<Set<string>>`
  for expanded row keys (`` `group:${cardId}` `` for shared rows, `` `player:${player.id}` `` for
  player rows per data-model.md). Make each row tappable (`onClick` toggling its key in the set,
  `aria-expanded` reflecting state, chevron indicator per the approved DESIGN.md mockup). When a
  row's key is in the expanded set, render each of that row's underlying `cardId`(s)'
  `instructionText` (via `cardSet.cards.find`) in a body-text block beneath the row. Makes T010
  pass.

**Checkpoint**: All user stories are now independently functional — grouping, the 3-virus cap,
and tap-to-reveal all work together.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T012 [P] Run `npm run lint` — confirm no new lint errors
- [X] T013 Run `npm test` — confirm the full suite (existing tests plus this feature's new cases)
  passes with no regressions
- [X] T014 Run quickstart.md's manual scenarios against `npm run dev` — confirm grouping, the
  3-virus cap, and tap-to-reveal all hold in real gameplay, not just under test. Manual testing
  surfaced a real bug beyond the original task scope: tapping a specific-player row revealed the
  raw `{player}` token instead of the substituted player name (e.g. "{player} moet vanaf nu staan
  bij het praten." instead of "Yara moet..."). Fixed in `ActiveVirusList.tsx` by reconstructing
  each cardId's full ordered set of currently-active target names and running them through the
  existing `renderCardText` helper (same one `DrawnCardView` uses at draw time), covered by two
  new regression tests (single-token and multi-token/count:2 cases). Re-verified live in the
  browser after the fix — confirmed correct.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — skipped
- **Foundational (Phase 2)**: None — skipped
- **User Story 1 (Phase 3)**: No dependency on other stories — can start immediately after
  Foundational
- **User Story 2 (Phase 4)**: No dependency on US1 or US3 — touches disjoint files
  (`useDrawPile.ts`/`.test.ts`, plus the shared `App.test.tsx` block already edited by US1's T004)
  and can proceed in parallel with US1/US3 by a different contributor, though T008 sequences
  after T004 since both edit the same describe block
- **User Story 3 (Phase 5)**: Depends on US1 (Phase 3) — reuses and extends the row
  grouping/keys T005 introduces; must come after US1's implementation tasks
- **Polish (Phase 6)**: Depends on all three user stories being complete

### Within Each User Story

- US1: T001, T002, T003 (same-file test edits, sequential with each other), T004 (different file,
  can be written alongside) → T005 (makes T001-T003 pass) → T006 (makes T004 pass, depends on
  T005's new prop)
- US2: T007, T008 (different files, parallelizable) → T009 (makes both pass)
- US3: T010 (test) → T011 (makes T010 pass, depends on US1's T005 row structure existing)

### Parallel Opportunities

- T007 (`useDrawPile.test.ts`) and T008 (`App.test.tsx`) can be written in parallel — different
  files
- US2 (T007-T009) can be implemented in parallel with US1 (T001-T006) by a different contributor
  — no shared files other than the sequencing note on T008 above
- T012 (lint) can run in parallel with T013 (test) in Phase 6

---

## Parallel Example: User Story 2

```bash
# Launch both US2 test edits together — different files:
Task: "Lower MAX_ACTIVE_VIRUSES to 3 in src/features/cards/useDrawPile.test.ts"
Task: "Trim App.test.tsx cap fixture from 5 to 4 virus cards, draws from 4 to 3"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3 (User Story 1 — the shared "Iedereen" row)
2. **STOP and VALIDATE**: run `npm test`, then quickstart.md's Scenario 1 steps
3. This alone delivers the core "gedeelde iedereen-rij" request

### Incremental Delivery

1. User Story 1 (grouping) → validate independently → coherent, shippable improvement on its own
2. User Story 2 (cap 4→3) → validate independently → can land before or after US1 (no shared
   dependency except the App.test.tsx block sequencing noted above)
3. User Story 3 (tap-to-reveal) → validate independently → completes the full feature request
4. Phase 6 polish → final full-suite + manual confirmation before opening the PR

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail (or fail to typecheck) before implementing: T001-T004 red before T005-T006;
  T007-T008 red before T009; T010 red before T011
- Commit after each task or logical group
- No `contracts/` directory — this feature has no external interface (see plan.md)
