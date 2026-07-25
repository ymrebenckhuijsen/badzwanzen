---

description: "Task list for feature: Spelers toevoegen"
---

# Tasks: Spelers toevoegen

**Input**: Design documents from `/specs/001-add-players/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: Included and required. Constitution Principle II (Test-First, NON-NEGOTIABLE)
mandates tests before implementation for all application code (Vitest + React Testing
Library). Every implementation task below is preceded by a failing-test task for the same
behavior.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent
implementation and testing of each story. This is also the project's first feature, so Phase 1
scaffolds the Vite + React + TypeScript + TailwindCSS + Vitest/RTL + CI setup the constitution
requires but that doesn't exist yet.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps the task to a user story (US1, US2, US3) for traceability
- Every task includes its exact file path(s)

## Path Conventions

Single-project structure at the repository root (per plan.md → Project Structure):

```text
src/
├── features/players/   # PlayerSetupScreen, PlayerList, AddPlayerControl, usePlayers
├── lib/                # storage.ts (localStorage helper)
├── App.tsx
└── main.tsx
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the project — nothing under `src/` exists yet.

- [X] T001 Scaffold the Vite + React + TypeScript project at the repository root (`npm create
      vite@latest . -- --template react-ts`, resolving the prompt about the directory already
      containing `.git`, `.specify/`, `docs/`, `specs/`, `README.md`, `package-lock.json` by
      keeping those and only adding the template's files); produces `package.json`,
      `tsconfig*.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`
- [X] T002 [P] Add TailwindCSS via the official Vite plugin (`@tailwindcss/vite`) per
      research.md: install the package, register the plugin in `vite.config.ts`, add the
      Tailwind import to the CSS entry point loaded from `src/main.tsx`
- [X] T003 [P] Install and configure Vitest + React Testing Library (`@testing-library/react`,
      `@testing-library/jest-dom`, `@testing-library/user-event`) with jsdom: add the `test`
      block to `vite.config.ts`, create `src/test-setup.ts` (jest-dom matchers), add a `test`
      script to `package.json`
- [X] T004 [P] Configure linting (ESLint, using/extending the config the Vite `react-ts`
      template ships) and add a `lint` script to `package.json`, per Constitution Principle V
- [X] T005 [P] Add GitHub Actions CI workflow running `npm run lint` and `npm test` on push and
      pull request, in `.github/workflows/ci.yml`, per Constitution Principle V

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `Player` entity and the `localStorage` persistence helper — needed by every
user story below.

**⚠️ CRITICAL**: No user story task may start until this phase is complete.

- [X] T006 [P] Define the `Player` type (`id: string`, `name: string`, `order: number`) in
      `src/features/players/types.ts`, per data-model.md
- [X] T007 [P] Write failing tests for the `localStorage` helper (get returns `[]` when unset,
      round-trips a `Player[]` through the `badzwanzen:players` key) in
      `src/lib/storage.test.ts`
- [X] T008 Implement `storage.ts` (typed `getPlayers`/`setPlayers` over the
      `badzwanzen:players` key) to make T007 pass, in `src/lib/storage.ts` (depends on: T007)

**Checkpoint**: `Player` type and persistence helper ready; user story work can begin.

---

## Phase 3: User Story 1 - Een speler toevoegen (Priority: P1) 🎯 MVP

**Goal**: Press "+", type a name, confirm, and see that name appear in the player list —
repeatable, with empty and duplicate names rejected.

**Independent Test**: Press "+", type a name, confirm → name appears in the list; repeat for a
second name → both are present; confirm with an empty/whitespace-only name → nothing is added;
add a name already in the list → rejected with a clear message.

### Tests for User Story 1

> Write these first; confirm they fail before implementing.

- [X] T009 [P] [US1] Write failing tests for `usePlayers` add behavior — trims whitespace,
      rejects empty/whitespace-only names, rejects case-sensitive duplicates, rejects the 21st
      player, persists via `storage.ts` after every successful add — in
      `src/features/players/usePlayers.test.ts`
- [X] T010 [P] [US1] Write failing tests for `AddPlayerControl` — "+" opens the name input,
      confirming a valid name calls `onAdd`, confirming empty/duplicate shows the corresponding
      error message and does not call `onAdd` — in
      `src/features/players/AddPlayerControl.test.tsx`
- [X] T011 [P] [US1] Write failing integration test for the US1 flow (press "+", type a name,
      confirm, name appears in the rendered list; add a second name, both are present) in
      `src/features/players/PlayerSetupScreen.test.tsx`

### Implementation for User Story 1

- [X] T012 [US1] Implement `usePlayers` hook: player-list state initialized from `storage.ts`,
      `addPlayer` with trim/empty/duplicate/max-20 validation, persists on every change, in
      `src/features/players/usePlayers.ts` (depends on: T009, T008, T006)
- [X] T013 [US1] Implement `AddPlayerControl` component: "+" button, name input, confirm
      action, inline validation messages for empty/duplicate/max-reached, in
      `src/features/players/AddPlayerControl.tsx` (depends on: T010, T012)
- [X] T014 [US1] Implement `PlayerSetupScreen` composing `AddPlayerControl` with a minimal
      rendered list of current player names, in
      `src/features/players/PlayerSetupScreen.tsx` (depends on: T011, T013)
- [X] T015 [US1] Wire `PlayerSetupScreen` in as the app's entry screen, in `src/App.tsx`
      (depends on: T014)

**Checkpoint**: User Story 1 is independently functional — players can be added, validated,
and seen, and survive a refresh (via the Phase 2 persistence layer).

---

## Phase 4: User Story 2 - Alle toegevoegde spelers zien (Priority: P2)

**Goal**: All players added so far are visible together in one overview, and any of them can
be removed before the game starts (FR-008).

**Independent Test**: Add 3 players → all 3 names visible at once; add another → previous ones
stay visible; remove one → it disappears, the rest remain.

### Tests for User Story 2

- [X] T016 [P] [US2] Write failing tests for `usePlayers` `removePlayer` behavior — removes the
      player with the given id, leaves the rest and their relative order intact, persists the
      change — in `src/features/players/usePlayers.test.ts`
- [X] T017 [P] [US2] Write failing tests for `PlayerList` — renders every player in the given
      list simultaneously, renders a remove control per player, calls `onRemove` with the
      player's id — in `src/features/players/PlayerList.test.tsx`

### Implementation for User Story 2

- [X] T018 [US2] Implement `usePlayers` `removePlayer` (updates state and persists via
      `storage.ts`) in `src/features/players/usePlayers.ts` (depends on: T016, T012)
- [X] T019 [US2] Implement `PlayerList` component rendering the full current roster with a
      remove control per player, in `src/features/players/PlayerList.tsx` (depends on: T017)
- [X] T020 [US2] Replace `PlayerSetupScreen`'s minimal list (from T014) with `PlayerList`,
      wired to `removePlayer`, in `src/features/players/PlayerSetupScreen.tsx` (depends on:
      T018, T019, T014)

**Checkpoint**: User Stories 1 and 2 both work independently — full roster visible and
manageable.

---

## Phase 5: User Story 3 - Het spel starten (Priority: P3)

**Goal**: A play-icon button starts the game with the current player list, enabled only once
the minimum of 2 players is reached.

**Independent Test**: With 0–1 players, the play button is disabled/hidden; add a 2nd player →
it becomes available; press it → the current full player list is handed off.

### Tests for User Story 3

- [X] T021 [P] [US3] Write failing tests for the play button in `PlayerSetupScreen` — disabled
      with 0 or 1 players, enabled with ≥2, pressing it invokes `onStartGame` with the current
      player list — in `src/features/players/PlayerSetupScreen.test.tsx`

### Implementation for User Story 3

- [X] T022 [US3] Implement the play-icon button in `PlayerSetupScreen`, gated on player count
      ≥2 (disabled/not usable otherwise), in `src/features/players/PlayerSetupScreen.tsx`
      (depends on: T021, T020)
- [X] T023 [US3] Implement the `onStartGame` hand-off: `PlayerSetupScreen` accepts an
      `onStartGame(players)` prop invoked on play, wired from `src/App.tsx` (the receiving game
      screen itself is out of scope for this feature) (depends on: T022)

**Checkpoint**: All three user stories are independently functional and integrated.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T024 [P] Run `npm run lint` and `npm test`; fix any failures across all files touched
      above
- [X] T025 [P] Walk through all 10 checks in [quickstart.md](./quickstart.md) manually via
      `npm run dev` and confirm each behaves as described
- [X] T026 [P] Update `README.md` with the now-scaffolded project's dev/test/build/lint
      commands

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (needs `src/` to exist) — BLOCKS all user
  stories
- **User Story 1 (Phase 3)**: Depends on Foundational only
- **User Story 2 (Phase 4)**: Depends on Foundational; extends US1's `usePlayers` and
  `PlayerSetupScreen` (T018 depends on T012, T020 depends on T014) but is independently
  testable once integrated
- **User Story 3 (Phase 5)**: Depends on Foundational; extends US2's `PlayerSetupScreen`
  (T022 depends on T020) but is independently testable once integrated
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### Within Each User Story

- Tests are written first and must fail before their corresponding implementation task
- `usePlayers` logic before the component that consumes it
- `PlayerSetupScreen` integration last within each story

### Parallel Opportunities

- Setup: T002, T003, T004, T005 in parallel (T001 first — everything else touches files it
  creates)
- Foundational: T006 and T007 in parallel; T008 after T007
- Each story's test tasks (marked [P]) can run in parallel with each other before that story's
  implementation tasks start
- Polish: T024, T025, T026 in parallel

---

## Parallel Example: User Story 1

```bash
# Tests for User Story 1 together:
Task: "Write failing tests for usePlayers add behavior in src/features/players/usePlayers.test.ts"
Task: "Write failing tests for AddPlayerControl in src/features/players/AddPlayerControl.test.tsx"
Task: "Write failing integration test for PlayerSetupScreen US1 flow in src/features/players/PlayerSetupScreen.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run T009–T011's tests green, confirm the US1 Independent Test
   manually
5. Demo if ready — adding players already works end-to-end with persistence

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → validate independently → MVP
3. Add User Story 2 → validate independently (roster view + remove)
4. Add User Story 3 → validate independently (play button + hand-off)
5. Polish (lint, full test run, quickstart.md walkthrough, README)

---

## Notes

- [P] tasks touch different files and have no incomplete-task dependency between them
- Tests MUST be observed failing before writing the implementation that makes them pass
  (Constitution Principle II)
- Commit after each task or logical group, per Constitution Development Workflow
- Stop at any checkpoint to validate a story independently before moving to the next
