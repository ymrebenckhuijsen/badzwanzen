# Tasks: Spelers tijdens het lopende spel toevoegen en verwijderen

**Input**: Design documents from `/specs/007-add-remove-players-live/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Included and REQUIRED — Constitution Principle II (Test-First, NON-NEGOTIABLE) applies
to this application code (React components/hooks/wiring). Every test task below MUST be written
and observed to fail before its paired implementation task.

**Organization**: Tasks are grouped by user story (US1 = P1, US2 = P2, US3 = P3) per spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Path Conventions

Single project (per plan.md): `src/features/players/`, `src/App.tsx`; tests colocated with
source.

---

## Phase 1: Setup

**Purpose**: Project initialization.

None — this feature extends the existing `src/features/players/` folder and toolchain; no new
dependencies, tooling, or config (plan.md's Technical Context confirms nothing new is needed).
Proceed straight to Phase 2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `status` field and the active-players filter both US1 and US2 build on.

- [X] T001 [P] Add optional `status?: 'active' | 'removed'` field to the `Player` interface in
  `src/features/players/types.ts` (data-model.md) — no behavior change, purely additive; all
  existing tests must still pass unmodified since the field defaults to absent/active
- [X] T002 [P] Write failing test in `src/features/players/activePlayers.test.ts`:
  `getActivePlayers(players)` excludes players with `status: 'removed'` and includes players
  with `status: 'active'` or no `status` field at all
- [X] T003 Implement `getActivePlayers` in `src/features/players/activePlayers.ts` per
  data-model.md's "Derived: active players" — makes T002 pass (depends on T001)

**Checkpoint**: Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 - Een speler toevoegen tijdens het spel (Priority: P1) 🎯 MVP

**Goal**: A "Spelers" entry point reachable from `GameScreen` at any time opens a
player-management view where a new player can be added via the same "+" flow used pre-game,
appearing in the active list without resetting the running session (FR-001, FR-002, FR-003,
FR-004).

**Independent Test**: Start a session with 2+ players, tap the new "Spelers" entry point during
the game, add a new name via "+", confirm — the new player appears in the active list and the
game's existing progress (drawn card, remaining pool) is untouched.

### Tests for User Story 1

- [X] T004 [P] [US1] Write failing test in
  `src/features/players/LivePlayerManagementScreen.test.tsx` (new file): given a `players` prop
  and an `onAdd` callback, renders a "Spelers" heading and a "SPELERS (n/20)" count derived via
  `getActivePlayers`, plus `<AddPlayerControl>`; submitting a valid new name via the "+" flow
  calls `onAdd` and (given an `{ ok: true }` result) the new player appears in the rendered list
  (FR-001)
- [X] T005 [P] [US1] Write failing test in the same file: submitting a name that duplicates an
  existing active player, or a 21st player when 20 are already active, surfaces the same Dutch
  error copy used pre-game ("Deze naam bestaat al." / "Maximum van 20 spelers bereikt.") without
  adding the player (US1 AC2/AC3, FR-002)
- [X] T006 [P] [US1] Write failing test in `src/App.test.tsx`: from an in-progress `GameScreen`
  (a session with a card already drawn), tap the "Spelers" header button, add a new player via
  "+", then close the view — assert the game's existing progress (the already-drawn card /
  remaining pool state) is unchanged (US1 AC1: "zonder dat het spel of de voortgang... gereset
  wordt")

### Implementation for User Story 1

- [X] T007 [US1] Implement `LivePlayerManagementScreen` in
  `src/features/players/LivePlayerManagementScreen.tsx` per data-model.md/contract: "Spelers"
  heading, "SPELERS (n/20)" count via `getActivePlayers`, `<AddPlayerControl onAdd={onAdd} />`,
  and the active player list rendered read-only for now (per-row delete affordance is added in
  Phase 4/US2 — do not build it here) — makes T004/T005 pass (depends on T003)
- [X] T008 [US1] In `src/App.tsx`: add a `view: 'card' | 'players'` state and a header button to
  `GameScreen` that sets it to `'players'` (visible/reachable at any time per FR-011); when
  `view === 'players'`, render `<LivePlayerManagementScreen>` instead of the card UI; lift an
  `addPlayer` path from the top-level `App` component down into `GameScreen` (`App` needs its
  own `usePlayers()`-backed add capability rather than the bare `useState<Player[] | null>` it
  has today) and wire it to `LivePlayerManagementScreen`'s `onAdd` — makes T006 pass (depends on
  T007)
- [X] T009 [US1] In `GameScreen` (`src/App.tsx`), compute `activePlayers =
  getActivePlayers(players)` and pass it — not the raw `players` prop — into `useDrawPile`,
  `<DrawnCardView>`, `<ActiveVirusList>`, `<VirusLiftCard>`, and `<LivePlayerManagementScreen>`,
  so a newly added player is eligible for the very next draw (US1 AC4); `<EndOfGameScreen>`
  keeps receiving the full `players` array unchanged (data-model.md's "Relationship to feature
  004's draw/target model") (depends on T008)

**Checkpoint**: User Story 1 is fully functional and independently testable — adding a late
player during a live game works end-to-end. No remove UI exists yet (Phase 4 adds it).

---

## Phase 4: User Story 2 - Een speler verwijderen tijdens het spel (Priority: P2)

**Goal**: Remove a player from the live session via an explicit confirm-before-delete step; a
removed player is immediately excluded from future draws, retained (not deleted) with a
`'removed'` status for history, and removal is blocked once only 2 active players remain
(FR-005 through FR-010, FR-013).

**Independent Test**: Start a session with 3+ players, remove one during the game via the
confirm step, verify that player is never selected as a target on any subsequent draw while the
others continue playing, and that removing down to 2 players disables further removal.

### Tests for User Story 2

- [X] T010 [P] [US2] Write failing test in `src/features/players/usePlayers.test.ts`:
  `retirePlayer(id)` sets that player's `status` to `'removed'` without removing them from the
  array, calls `setPlayers()` (persist), and returns `{ ok: false, reason: 'min-players' }` with
  **no** state change when only 2 active players currently exist (contracts/live-player-
  management-contract.md)
- [X] T011 [P] [US2] Write failing test in the same file: `addPlayer` accepts a name matching an
  already-`removed` player (FR-013), and the max-20 check counts only active
  (`status !== 'removed'`) players
- [X] T012 [P] [US2] Write failing test in `src/features/players/LivePlayerList.test.tsx` (new
  file): tapping a row's delete icon shows an inline "Verwijder {name}? Ja／Nee" confirmation
  instead of removing immediately (FR-008); "Nee" cancels with no call to `onRetire`; "Ja" calls
  `onRetire(id)`; when `minPlayersReached` is `true`, every row's delete icon is `disabled` and
  does not open the confirmation state on tap (FR-009)
- [X] T013 [P] [US2] Write failing test in `LivePlayerManagementScreen.test.tsx`: composes
  `<LivePlayerList>` passing `minPlayersReached = activePlayers.length <= 2`; a successful
  `onRetire` result removes that player from the visibly rendered list (US2 AC1) without
  affecting other rows or `onAdd`
- [X] T014 [US2] Write failing test in `src/App.test.tsx`: from an in-progress game with 3+
  players, remove one via the "Spelers Beheer" confirm flow — assert that player is never
  chosen as a target across several subsequent draws, while the remaining players continue to
  be drawable (US2 AC3, SC-003)

### Implementation for User Story 2

- [X] T015 [US2] Add `RemoveLivePlayerResult` type and `retirePlayer(id)` to
  `src/features/players/usePlayers.ts` per the contract — makes T010 pass (depends on T001)
- [X] T016 [US2] Update `usePlayers.addPlayer`'s duplicate-name and max-20 checks to use
  `getActivePlayers(current)` instead of the raw array — makes T011 pass (depends on T003, T015)
- [X] T017 [US2] Implement `LivePlayerList` in `src/features/players/LivePlayerList.tsx` per the
  contract: `confirmingId` local state, inline "Verwijder {name}? Ja／Nee" row, `disabled`
  delete icons when `minPlayersReached` — makes T012 pass
- [X] T018 [US2] In `LivePlayerManagementScreen.tsx`, replace the read-only list from T007 with
  `<LivePlayerList players={activePlayers} onRetire={onRetire}
  minPlayersReached={activePlayers.length <= 2} />` — makes T013 pass (depends on T007, T017)
- [X] T019 [US2] In `src/App.tsx`, extend the lifted players-mutation path (from T008) with
  `retirePlayer`, wire it to `LivePlayerManagementScreen`'s `onRetire` prop, and confirm
  `GameScreen`'s `activePlayers` (T009) already excludes newly `'removed'` players on the next
  render — makes T014 pass (depends on T009, T015, T018)

**Checkpoint**: User Stories 1 AND 2 both work independently and together — the full add/remove
flow is functional.

---

## Phase 5: User Story 3 - De actieve spelerslijst blijven zien tijdens het spel (Priority: P3)

**Goal**: The visible active player list and count reflect every add/remove immediately, with no
page reload (FR-011).

**Independent Test**: With the player-management view open, add and remove players a few times
in a row (staying at/above the 2-player floor) — the list and count update after each action
without a reload.

### Tests for User Story 3

- [X] T020 [P] [US3] Write failing test in `LivePlayerManagementScreen.test.tsx`: a successful
  add followed immediately by a successful remove (same mounted instance, no unmount/remount)
  updates the rendered list and the "SPELERS (n/20)" count after each action in turn (US3 AC1)
  — passed immediately (green, not red), confirming FR-011 was already satisfied structurally
  by Phases 3/4; no implementation change was needed, per this phase's note

### Implementation for User Story 3

None expected — FR-011 is satisfied structurally by React's normal re-render behavior once
Phases 3 and 4 are complete (both `onAdd`/`onRetire` already flow through ordinary React state).
If T020 fails, the fix belongs in whichever US1/US2 component is stale-rendering (most likely a
missed prop/state wiring in T008/T009/T019) — do not add new components for this phase.

**Checkpoint**: All user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T021 [P] Run `npm run lint` and fix any findings
- [X] T022 Run `npm run build` (type-check + production build) and fix any errors
- [X] T023 Run through `quickstart.md`'s manual run-throughs (US1, US2, US3) against `npm run
  dev` to confirm the feature works end-to-end in a real browser, not just under test —
  verified live via browser automation: added "Nieuwkomer" mid-game (list/count updated
  immediately, drawn card progress untouched), removed "Yara" via the inline Ja/Nee confirm,
  removed a second player down to the 2-player floor (delete icons became disabled, "Minimaal 2
  nodig" shown), closed the view with the original drawn card still on screen

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — no tasks
- **Foundational (Phase 2)**: No dependencies — BLOCKS all user stories (T001 blocks T015 via
  the `status` field; T003 blocks T007 and T016)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (T001, T003)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (extends `LivePlayerManagementScreen` from T007
  and the players-mutation path from T008/T009) — not independently implementable before US1,
  but independently testable once both are done
- **User Story 3 (Phase 5)**: Depends on Phases 3 and 4 both being complete (nothing to
  implement on its own — see Phase 5's note)
- **Polish (Phase 6)**: Depends on all prior phases

### Parallel Opportunities

- T001 and T002 (Foundational, different files) can run in parallel
- T004, T005, T006 (US1 tests, different files) can run in parallel
- T010, T011, T012, T013 (US2 tests, different files) can run in parallel
- T021 (lint) can run in parallel with T022 (build) in Phase 6

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tests together (different files):
Task: "Write failing LivePlayerManagementScreen add-flow test in src/features/players/LivePlayerManagementScreen.test.tsx"
Task: "Write failing LivePlayerManagementScreen validation-error test in src/features/players/LivePlayerManagementScreen.test.tsx"
Task: "Write failing App entry-point/progress-preserved test in src/App.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 2: Foundational (T001-T003)
2. Phase 3: User Story 1 (T004-T009)
3. **STOP and VALIDATE**: a late player can be added mid-game without disrupting the session —
   already the feature's primary value (per spec.md's "Why this priority") even before removal
   exists
4. Continue to Phase 4 (US2), Phase 5 (US3 verification), Phase 6 (polish) for the full feature

### Incremental Delivery

1. Foundational → Phase 3 (US1) → validate → (optional demo point)
2. Phase 4 (US2) → validate → add/remove both work
3. Phase 5 (US3) → validate live-updating list (likely a no-op fix, if anything)
4. Phase 6 polish → lint/build/quickstart clean

---

## Notes

- Reused unmodified, no tasks touch them: `AddPlayerControl.tsx` (FR-001's "same '+' flow"),
  `PlayerList.tsx` (stays the pre-game instant-delete list; `LivePlayerList` is a new sibling,
  not a replacement — see research.md), `resolveTargets.ts`, `useDrawPile.ts`'s internals,
  `useVirusEffects.ts`, `EndOfGameScreen.tsx`.
- `usePlayers.removePlayer` (pre-game splice+reindex) is untouched — `retirePlayer` (T015) is
  additive, not a replacement, per research.md's decision to keep pre-game "remove means delete"
  semantics separate from live-game "remove means retire."
- Commit after each task or logical group, per Constitution Principle V / project convention.
- No new `localStorage` key — `setPlayers()`/`getPlayers()` (`src/lib/storage.ts`) are reused
  as-is; only the `Player` shape they serialize gains the optional `status` field.
