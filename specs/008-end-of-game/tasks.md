# Tasks: End of Game Screen

**Input**: Design documents from `/specs/008-end-of-game/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md (all present; no `contracts/` — see plan.md)

**Tests**: Included and REQUIRED — Constitution Principle II (Test-First, NON-NEGOTIABLE) applies
to this application code (React components/wiring). Every test task below MUST be written and
observed to fail before its paired implementation task.

**Organization**: Tasks are grouped by user story (US1 = P1, US2 = P2) per spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Path Conventions

Single project (per plan.md): `src/features/<feature>/`, tests colocated with source.

---

## Phase 1: Setup

**Purpose**: Create the new feature folder. No new dependencies, tooling, or config — plan.md's
Technical Context confirms nothing new is needed beyond what features 001/004 already set up.

- [X] T001 Create `src/features/end-of-game/` directory

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared by both user stories.

None. Both signals this feature depends on already exist and are unmodified: `useDrawPile`'s
`hasEnded` (feature 004, `src/features/cards/useDrawPile.ts`) and `usePlayers`'s
`localStorage`-backed player list (feature 001, `src/features/players/usePlayers.ts`) — see
research.md. Proceed straight to Phase 3.

**Checkpoint**: Foundation ready (nothing to build) — user story implementation can begin.

---

## Phase 3: User Story 1 - See a clear end-of-game screen when the session finishes (Priority: P1) 🎯 MVP

**Goal**: When the group's next "draw" action finds the pool empty, show a screen (instead of a
card) that lists every player from the session — not shown any earlier (FR-001, FR-002, FR-005).

**Independent Test**: Play a session down to its last card (drawn/resolved normally), then draw
once more — the end-of-game screen appears and lists all the session's players.

### Tests for User Story 1

- [X] T002 [P] [US1] Write failing test in `src/features/end-of-game/EndOfGameScreen.test.tsx`:
  given a `players` array, `EndOfGameScreen` renders a "Potje afgelopen!" heading (per
  `DESIGN.md`) and every player's name in a list (FR-002)
- [X] T003 [P] [US1] Write failing test in `src/App.test.tsx`: (a) with a session freshly
  started (several cards remaining), drawing shows a card, not the end-of-game screen (FR-005
  general case — the screen is absent, e.g. `expect(...).not.toBeInTheDocument()`); (b) with
  exactly one card left, drawing it shows that card normally (no end screen yet — FR-001
  scenario 1); (c) drawing again afterward (pool now empty) shows the end-of-game screen instead
  of a card, listing the session's players (FR-001 scenario 2, FR-005 boundary case)

### Implementation for User Story 1

- [X] T004 [US1] Implement `EndOfGameScreen` component in
  `src/features/end-of-game/EndOfGameScreen.tsx` per `data-model.md`'s
  `EndOfGameScreenProps` (`players`, `onPlayAgain`, `onChangePlayers`): "Potje afgelopen!"
  heading + player list (styled per `DESIGN.md`/`design/einde-spel-mobile.png` — reuse the
  avatar-chip row pattern from `src/features/virus/ActiveVirusList.tsx:30-45` for each player);
  action buttons can be static markup for now (wired in Phase 4) — makes T002 pass
- [X] T005 [US1] In `src/App.tsx`, replace the current static `hasEnded` block
  (the "Het spel is afgelopen!" `<div>`) with `<EndOfGameScreen players={players}
  onPlayAgain={() => {}} onChangePlayers={() => {}} />` — placeholder no-op callbacks for now
  (wired for real in T009), passing through the same `players` prop `GameScreen` already
  receives — makes T003 pass

**Checkpoint**: User Story 1 is fully functional and independently testable — the end-of-game
screen appears at the right moment and lists players. `onPlayAgain`/`onChangePlayers` may still be
no-ops or stubs at this point; Phase 4 wires them.

---

## Phase 4: User Story 2 - Start a new game from the end screen (Priority: P2)

**Goal**: From the end-of-game screen, "Speel opnieuw" starts a fresh session with the same
players; "Spelers wijzigen" returns to player setup, pre-filled (FR-003, FR-004).

**Independent Test**: Reach the end-of-game screen; tapping "Speel opnieuw" starts a new session
immediately with the same players and a full pool; separately, tapping "Spelers wijzigen" returns
to the pre-filled player setup screen instead.

### Tests for User Story 2

- [X] T006 [P] [US2] Write failing test in `src/features/end-of-game/EndOfGameScreen.test.tsx`:
  clicking the "Speel opnieuw" button calls `onPlayAgain`; clicking "Spelers wijzigen" calls
  `onChangePlayers` (each independently, via `vi.fn()` per house convention)
- [X] T007 [P] [US2] Write failing test in `src/App.test.tsx`: from the end-of-game screen,
  clicking "Speel opnieuw" starts a new session for the same players with a fresh pool (e.g.
  assert the draw button works again and a full new sequence of cards can be drawn — remaining
  count/draw state has reset, not merely re-showing the old exhausted pool) (FR-003); clicking
  "Spelers wijzigen" instead returns to `PlayerSetupScreen`, pre-filled with the same players
  (FR-004)

### Implementation for User Story 2

- [X] T008 [US2] Wire the "Speel opnieuw" and "Spelers wijzigen" buttons in
  `src/features/end-of-game/EndOfGameScreen.tsx` to call `onPlayAgain`/`onChangePlayers` —
  makes T006 pass
- [X] T009 [US2] In `src/App.tsx`, add a `sessionKey` (`useState<number>(0)`) and pass
  `key={sessionKey}` to `<GameScreen>`; implement `onPlayAgain={() => setSessionKey((k) => k + 1)}`
  and `onChangePlayers={() => setPlayers(null)}`, both passed into `<EndOfGameScreen>` — makes
  T007 pass (per data-model.md's state-transition diagram: incrementing `sessionKey` remounts
  `GameScreen` fresh; `setPlayers(null)` falls back to the existing `PlayerSetupScreen` branch,
  which self-pre-fills from `localStorage`, per research.md — no new prop plumbing needed there)

**Checkpoint**: Both user stories fully functional together — the complete end-of-game flow works
end-to-end.

---

## Phase 5: Polish

**Purpose**: Final cross-cutting validation.

- [X] T010 [P] Run `npm run lint` and fix any findings
- [X] T011 Run `npm run build` (type-check + production build) and fix any errors
- [X] T012 Run through `quickstart.md`'s manual run-throughs (US1 and US2) against `npm run dev`
  to confirm the feature works end-to-end in a real browser, not just under test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Empty — no blocking work
- **User Story 1 (Phase 3)**: Depends on Phase 1 only
- **User Story 2 (Phase 4)**: Depends on Phase 3 (extends the same `EndOfGameScreen` component
  and the same `App.tsx` block T005 introduces) — not independently implementable before US1,
  but independently *testable* once both are done (T007's assertions are separate from T003's)
- **Polish (Phase 5)**: Depends on Phase 3 and Phase 4 both being complete

### Parallel Opportunities

- T002 and T003 (US1 tests, different files) can run in parallel
- T006 and T007 (US2 tests, different files) can run in parallel
- T010 (lint) can run in parallel with T011 (build) in Phase 5

---

## Parallel Example: User Story 1

```bash
# Launch both US1 tests together (different files):
Task: "Write failing EndOfGameScreen render test in src/features/end-of-game/EndOfGameScreen.test.tsx"
Task: "Write failing App draw/end-screen-timing test in src/App.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001)
2. Phase 3: User Story 1 (T002-T005)
3. **STOP and VALIDATE**: the end-of-game screen appears at the right moment and lists players —
   already a real improvement over today's bare "Het spel is afgelopen!" message, even before
   "play again"/"change players" work
4. Continue to Phase 4 for the full feature (both actions), then Phase 5 polish

### Incremental Delivery

1. Setup → Phase 3 (US1) → validate → (optional demo point)
2. Phase 4 (US2) → validate → full feature done
3. Phase 5 polish → lint/build/quickstart clean

---

## Notes

- No `[P]` on T004/T005 or T008/T009: each pair touches the same two files
  (`EndOfGameScreen.tsx`/`App.tsx`) as its sibling implementation task in the other story, so
  they're sequential, not parallel, despite being in different phases.
- Commit after each task or logical group, per Constitution Principle V / project convention.
- `useDrawPile.ts` and `usePlayers.ts`/`PlayerSetupScreen.tsx` are reused unmodified — no tasks
  touch them (confirmed in plan.md/research.md; do not add tasks that "improve" them as part of
  this feature).
