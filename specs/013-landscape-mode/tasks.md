# Tasks: Landscape-modus ondersteuning

**Input**: Design documents from `/specs/013-landscape-mode/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included — Constitution Principle II (TDD) applies to this application code; see
`research.md` Decision 5 for how class-presence assertions satisfy Red-Green-Refactor for a
CSS-only change under jsdom.

**Organization**: Tasks are grouped by user story (spec.md P1/P2/P3) so each can be implemented
and verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Target class string (all five screens)

Before (identical in all five files today):
```
mx-auto flex min-h-svh max-w-md flex-col gap-6 bg-surface p-6 text-on-surface
```

After (add landscape width + scroll + low-height tightening; keep every existing class so
portrait rendering is unchanged per FR-007):
```
mx-auto flex min-h-svh max-w-md landscape:max-w-2xl flex-col gap-6 overflow-y-auto bg-surface p-6 text-on-surface short:gap-3 short:p-4
```

Treat the exact `landscape:max-w-2xl` / `short:gap-3` / `short:p-4` values as a starting point:
confirm them against real device-emulation review (quickstart.md) and adjust if a screen's
content still clips or looks too cramped/sparse — the class *categories* (wider landscape cap,
`overflow-y-auto`, tighter `short:` spacing) are what the tests below lock in, not the literal
pixel/rem numbers.

---

## Phase 1: Setup

- [X] T001 Confirm the exact Tailwind v4 custom-variant syntax against the installed
  `tailwindcss` version (`package.json`) — either
  `@custom-variant short (@media (max-height: 500px));` or the block form
  (`@custom-variant short { @media (max-height: 500px) { @slot; } }`) — by adding it to
  `design/tailwind-theme.css` and confirming `short:` classes compile (`npm run dev`, inspect
  generated CSS or check no build error) before using `short:` in any component.
  Confirmed: the inline form `@custom-variant short (@media (max-height: 500px));` compiles
  cleanly (`npm run build` succeeded).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `short` custom variant must exist before any screen can use `short:` classes.

- [X] T002 Add the `short` custom variant to `design/tailwind-theme.css` (media query
  `max-height: 500px`, per T001's confirmed syntax), with a one-line comment noting it's for
  low-height landscape phones (spec.md FR-008, ~320–360px range) and is additive to the design
  system's existing token block, not a token itself.

**Checkpoint**: `short:` classes are available to use in components.

---

## Phase 3: User Story 1 - Een volledige speelronde in landscape (Priority: P1) 🎯 MVP

**Goal**: The main game loop screen (`App.tsx`'s `GameScreen`) and the end-of-game screen it
leads to (SC-001: "start tot het eindscherm") are fully usable in landscape — "volgende kaart"
stays reachable, virus end messages and their confirm button stay readable, the active-virus
list (up to 4) stays visible or scrollable, and the end-of-game screen's player list/actions
stay usable.

**Independent Test**: Per quickstart.md Scenario A — set a 740×360 (and 640×320) landscape
viewport, play through draws including a virus lifecycle through to the end-of-game screen,
verify no clipped text and every control reachable.

### Tests for User Story 1

- [X] T003 [P] [US1] In `src/App.test.tsx`, add a test asserting `GameScreen`'s root container
  (`render(...).container.firstChild`) has the classes `landscape:max-w-2xl`, `overflow-y-auto`,
  `short:gap-3`, and `short:p-4` (via `toHaveClass`), alongside the still-present `min-h-svh` and
  `max-w-md`. Run it and confirm it FAILS against the current, unmodified `App.tsx`.
  Confirmed red, then green after T005.
- [X] T004 [P] [US1] In `src/features/end-of-game/EndOfGameScreen.test.tsx`, add the same
  container-class assertion for `EndOfGameScreen`'s root container. Confirm it FAILS first.
  Confirmed red, then green after T006.

### Implementation for User Story 1

- [X] T005 [US1] In `src/App.tsx`, update `GameScreen`'s root `<div>` className (currently
  `mx-auto flex min-h-svh max-w-md flex-col gap-6 bg-surface p-6 text-on-surface`) to the target
  class string above. Depends on T002 (needs `short:` to exist) and should make T003 pass.
- [X] T006 [P] [US1] In `src/features/end-of-game/EndOfGameScreen.tsx`, update the root `<div>`
  className to the target class string. Depends on T002 and should make T004 pass.
- [ ] T007 [US1] Run `npm run dev`, follow quickstart.md Scenario A at 740×360 and 640×320 to
  manually confirm no clipped text/unreachable controls through a full draw → virus → end-of-
  virus → 4-active-virus → end-of-game sequence.
  DEFERRED: the in-session browser tool's viewport is pinned to a portrait size (543×904,
  confirmed unresponsive to 3 different resize attempts) — no real landscape viewport was
  available to verify this visually in-session. Portrait rendering was spot-checked instead
  (CardSetSelectionScreen, GameScreen with a drawn card) and looks unchanged. Developer to run
  this scenario on their own device/DevTools per `npm run dev` at localhost:5173.

**Checkpoint**: User Story 1 is independently functional — the main game loop and end-of-game
screen work in landscape at both a comfortable and the minimum supported height.

---

## Phase 4: User Story 2 - Spel opzetten en spelers beheren in landscape (Priority: P2)

**Goal**: `PlayerSetupScreen`, `CardSetSelectionScreen`, and `LivePlayerManagementScreen` are
fully usable in landscape.

**Independent Test**: Per quickstart.md Scenario B — in a 740×360 landscape viewport, add
players, pick a card set, and open live player management mid-game, all without rotating.

### Tests for User Story 2

- [X] T008 [P] [US2] In `src/features/players/PlayerSetupScreen.test.tsx`, add a test asserting
  the root container has `landscape:max-w-2xl`, `overflow-y-auto`, `short:gap-3`, `short:p-4`.
  Confirmed it FAILS first, passes after T011.
- [X] T009 [P] [US2] In `src/features/cards/CardSetSelectionScreen.test.tsx`, add the same
  container-class assertion. Confirmed it FAILS first, passes after T012.
- [X] T010 [P] [US2] In `src/features/players/LivePlayerManagementScreen.test.tsx`, add the same
  container-class assertion. Confirmed it FAILS first, passes after T013.

### Implementation for User Story 2

- [X] T011 [P] [US2] In `src/features/players/PlayerSetupScreen.tsx`, update the root `<div>`
  className to the target class string. Makes T008 pass.
- [X] T012 [P] [US2] In `src/features/cards/CardSetSelectionScreen.tsx`, update the root `<div>`
  className to the target class string. Makes T009 pass.
- [X] T013 [P] [US2] In `src/features/players/LivePlayerManagementScreen.tsx`, update the root
  `<div>` className to the target class string. Makes T010 pass.
- [ ] T014 [US2] Run quickstart.md Scenario B at 740×360, including DevTools' on-screen-keyboard
  simulation for the name-input step, to manually confirm every control stays reachable.
  DEFERRED — same reason as T007: no real landscape viewport available in-session. Developer to
  verify on their own device/DevTools.

**Checkpoint**: User Stories 1 and 2 both work independently in landscape.

---

## Phase 5: User Story 3 - Oriëntatie wisselen zonder voortgang te verliezen (Priority: P3)

**Goal**: Rotating the device mid-session preserves players, current card, and active virus
effects, and portrait orientation is pixel-for-pixel unchanged from before this feature
(FR-007/SC-004).

**Independent Test**: Per quickstart.md Scenario C — start in portrait, play a few turns,
rotate to landscape without reloading, confirm identical game state; rotate back and confirm
portrait looks unchanged.

### Tests for User Story 3

- [X] T015 [US3] Confirm the existing (unmodified) assertions in `src/App.test.tsx`,
  `PlayerSetupScreen.test.tsx`, `CardSetSelectionScreen.test.tsx`,
  `LivePlayerManagementScreen.test.tsx`, and `EndOfGameScreen.test.tsx` that check
  portrait-relevant behavior (rendering, button states, player lists) still pass unmodified
  after T005/T006/T011/T012/T013 — since `landscape:`/`short:` are additive classes that
  jsdom's default (no-media-query) rendering never applies, this is a direct regression check
  for FR-007, not a new test to write. Confirmed: full suite (`npm test`) is green, 162/162.

### Implementation for User Story 3

- [ ] T016 [US3] Run quickstart.md Scenario C: start a game in portrait (390×844), draw a few
  cards including a virus, switch the DevTools viewport to landscape without reloading, confirm
  the same card/players/active-virus state is shown, then switch back to portrait and confirm
  the layout matches pre-feature portrait screenshots (`specs/*/design/*.png` where available)
  with zero visual difference.
  PARTIALLY DONE: the portrait half (390×844-ish, actual session viewport 543×904) was
  confirmed in-session — CardSetSelectionScreen and GameScreen with a drawn card render
  identically to before this feature. The rotate-to-landscape half is DEFERRED, same reason as
  T007 — no real landscape viewport available in-session. Note the state-preservation guarantee
  is a structural property of the CSS-only approach (research.md Decision 1, data-model.md), not
  something this manual check discovers new risk in — it's confirmatory, not exploratory.

**Checkpoint**: All three user stories are independently functional; portrait is unchanged.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T017 Run `npm run lint` and `npm test` (full suite) and confirm everything is green.
  Confirmed: lint clean, 162/162 tests pass.
- [ ] T018 Walk through quickstart.md's "Edge cases to spot-check" section (very low landscape
  height, tablet landscape, portrait regression) once more end-to-end across all five screens.
  DEFERRED to the developer's own device/DevTools check — no real landscape viewport available
  in this session's browser tool. Portrait-regression edge case was confirmed in-session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 (needs confirmed variant syntax) — BLOCKS all
  user stories, since every story's screens use `short:` classes.
- **User Story 1 (Phase 3)**: Depends on Phase 2. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Phase 2. Independent of US1 (different files) — can run
  in parallel with Phase 3 if desired, though priority order suggests doing it after.
- **User Story 3 (Phase 5)**: Depends on Phase 2 and benefits from US1/US2 already being in
  place (it verifies the combined result), but does not modify any files itself.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### Within Each User Story

- Tests written and observed failing before the corresponding implementation task (Red-Green).
- Each story's Implementation task directly makes that story's Test task pass.

### Parallel Opportunities

- T003, T004 (US1 tests) are [P] — different files.
- T008, T009, T010 (US2 tests) are all [P] — different files.
- T011, T012, T013 (US2 implementation) are all [P] — different files.
- US1 (Phase 3) and US2 (Phase 4) touch entirely different files and can be worked in parallel
  once Phase 2 is done, despite being listed in priority order.

---

## Parallel Example: User Story 2

```bash
# Tests (after confirming each fails):
Task: "Add container-class assertion in src/features/players/PlayerSetupScreen.test.tsx"
Task: "Add container-class assertion in src/features/cards/CardSetSelectionScreen.test.tsx"
Task: "Add container-class assertion in src/features/players/LivePlayerManagementScreen.test.tsx"

# Implementation (after their respective tests are red):
Task: "Update root container className in src/features/players/PlayerSetupScreen.tsx"
Task: "Update root container className in src/features/cards/CardSetSelectionScreen.tsx"
Task: "Update root container className in src/features/players/LivePlayerManagementScreen.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001).
2. Phase 2: Foundational (T002) — CRITICAL, blocks everything else.
3. Phase 3: User Story 1 (T003–T007).
4. **STOP and VALIDATE**: run quickstart.md Scenario A. The main game loop and end-of-game
   screen are landscape-usable — this alone is a demoable, shippable increment per FR-001.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. User Story 1 → validate independently → demoable MVP.
3. User Story 2 → validate independently → setup/management screens now landscape-usable too.
4. User Story 3 → validate (verification-only, no new files) → rotation confirmed non-destructive
   and portrait confirmed unchanged.
5. Polish → full regression pass.

## Notes

- No `[Story]` label on Setup/Foundational/Polish tasks, per the checklist format rules.
- Every implementation task in US1/US2 modifies exactly one screen file's root `className` —
  no shared files are touched by two different story's tasks, keeping the stories independent.
- Commit after each task or logical group, per repo convention (feature branch + PR into
  `main`, CI green before merge — Constitution Principle V).
