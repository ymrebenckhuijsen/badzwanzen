---

description: "Task list for feature 004-assignments-and-viruses"
---

# Tasks: Assignment, Game and Virus Card Loop

**Input**: Design documents from `/specs/004-assignments-and-viruses/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, DESIGN.md (all present, no `contracts/` — see plan.md)

**Tests**: Included and REQUIRED, not optional — Constitution Principle II (Test-First, NON-NEGOTIABLE) mandates a failing test before implementation for every behavior in this feature's application code. Stack: Vitest (hooks/logic) + React Testing Library (components), per plan.md.

**Scope reminder**: this feature has **no scoring** — no success/fail recording, no virus violation reporting, no penalty points (spec.md Clarifications, 2026-07-27). No task below implements any of that; it is out of scope by design, not an oversight.

**Design reference**: UI follows the approved `DESIGN.md` addendum — three card-type screens (Opdracht=primary blue, Spel=secondary green, Virus=tertiary red), Tailwind classes `bg-primary-container` / `bg-secondary-container` / `bg-tertiary-container` (see `design/tailwind-theme.css`), and the canonical `ActiveVirusList` row style (avatar + name + subtext + count badge, per the Virus Kaart screen — **not** the Spel screen's simplified pill-chip variant, per DESIGN.md's explicit developer note).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5, matching spec.md's numbering)
- File paths are relative to the repository root

## Path Conventions

Single project (established by feature 001, reused as-is): `src/features/<feature>/`, tests colocated with source (`Foo.ts` + `Foo.test.ts`, or `Foo.tsx` + `Foo.test.tsx`).

<!-- Sample tasks from the template have been replaced with the actual task list below. -->

## Phase 1: Setup

**Purpose**: Confirm the existing toolchain (established by feature 001, no new setup needed for this feature) is green on this branch before starting new work.

- [ ] T001 Run `npm install && npm test && npm run lint && npm run build` at the repository root and confirm all four succeed cleanly on this branch (post-rebase onto `main`) before starting any new work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, the content validator, the real seed card set, and the shared `{player}` text-substitution utility — every user story below depends on these existing first.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 [P] Define `Card`, `CardSet`, and `TargetingRule` types per data-model.md in `src/features/cards/card.types.ts`
- [ ] T003 [P] Define the `ActiveVirusEffect` type (including `liftReason: "threshold" | "forced-end" | null`) per data-model.md in `src/features/virus/virus.types.ts`
- [ ] T004 [P] Write failing tests for `validateCardSet` in `src/features/cards/validateCardSet.test.ts`, using fixture `CardSet` data (not the real seed set): a specific card's `{player}` count must equal `targeting.count` (FR-013); a general card must have zero tokens (FR-013); a virus card's `liftText` must have exactly one token (FR-014); a set with <80 cards or <4 virus cards must fail (FR-015)
- [ ] T005 Implement `validateCardSet(cardSet: CardSet): ValidationError[]` in `src/features/cards/validateCardSet.ts` to make T004 pass (depends on T002, T004)
- [ ] T006 [P] Write a failing test in `src/features/cards/data/seed-card-set.test.ts` asserting the real seed `CardSet` passes `validateCardSet` with zero errors (depends on T005)
- [ ] T007 Author the static seed `CardSet` content (≥80 cards total, ≥4 of type `"virus"`, correct `{player}` token counts in every `instructionText`/`liftText`) in `src/features/cards/data/seed-card-set.ts` to make T006 pass (depends on T002, T006)
- [ ] T008 [P] Write failing tests for `renderCardText` in `src/features/cards/renderCardText.test.ts`: N `{player}` tokens are replaced in order with N given names; text with zero tokens is returned unchanged
- [ ] T009 Implement `renderCardText(text: string, names: string[]): string` in `src/features/cards/renderCardText.ts` to make T008 pass (depends on T008)

**Checkpoint**: Types, validated seed content, and text substitution exist — user story implementation can begin.

---

## Phase 3: User Story 4 - Build the session's card pool at game start (Priority: P1)

**Goal**: From the validated seed `CardSet`, build a `SessionCardPool` sized to a random 60-80 cards, guaranteeing at least 4 virus cards, once per game session.

**Independent Test**: Build pools from the same card set repeatedly; each is sized 60-80, drawn entirely from that set, always has ≥4 virus cards, and composition/size varies between calls.

**Note on ordering**: this phase is implemented before User Story 1 even though both are P1 — US1 has nothing to draw from without a pool (spec.md's own "Why this priority" for US1 vs. US4).

- [ ] T010 [P] [US4] Write failing tests for `buildSessionCardPool` in `src/features/cards/buildSessionCardPool.test.ts`: resulting `poolCardIds.length` is always in `[60, 80]`; at least 4 of the selected ids are virus cards; every id comes from the given `CardSet`; two calls on the same set can produce different size/composition
- [ ] T011 [US4] Implement `buildSessionCardPool(cardSet: CardSet): SessionCardPool` (guarantee-4-virus-then-fill-randomly algorithm per research.md) in `src/features/cards/buildSessionCardPool.ts` to make T010 pass (depends on T002, T010)

**Checkpoint**: A session pool can be built and inspected independently of any draw/display logic.

---

## Phase 4: User Story 1 - Draw a card and see who it targets (Priority: P1)

**Goal**: Draw one card at a time from the session pool (no fixed order), resolve general/specific targeting, and display the card's type and instruction text with `{player}` substitution — with no separate target-name list — discarding and immediately redrawing when a specific card needs more targets than currently exist.

**Independent Test**: Draw from a session with several players; confirm type/target resolution is correct for both general and specific cards, and that a specific card needing more targets than available players never appears and doesn't stall the draw.

- [ ] T012 [P] [US1] Write failing tests for `resolveTargets` in `src/features/cards/resolveTargets.test.ts`: a general card resolves to all current player ids; a specific card with `count` ≤ available players resolves to exactly `count` randomly-chosen ids; a specific card with `count` > available players resolves to an "unresolvable" result
- [ ] T013 [US1] Implement `resolveTargets(card: Card, players: Player[]): TargetResolution` in `src/features/cards/resolveTargets.ts` to make T012 pass (depends on T002, T012)
- [ ] T014 [P] [US1] Write failing tests for `useDrawPile` in `src/features/cards/useDrawPile.test.ts`: drawing removes one id from `remainingCardIds` at a time with no fixed order; when `resolveTargets` reports "unresolvable" for the next card, it is discarded (never returned/shown) and the hook immediately continues to the following id; the hook signals when `remainingCardIds` is empty
- [ ] T015 [US1] Implement the `useDrawPile(pool: SessionCardPool, cardSet: CardSet, players: Player[])` hook (draw + discard-and-redraw only — pool-exhaustion session-ending behavior is added in US5) in `src/features/cards/useDrawPile.ts` to make T014 pass (depends on T002, T009, T013, T014)
- [ ] T016 [P] [US1] Write failing React Testing Library tests for `DrawnCardView` in `src/features/cards/DrawnCardView.test.tsx`: renders the type label and rendered instruction text for each of the 3 types with the correct Tailwind background (`bg-primary-container` assignment, `bg-secondary-container` game, `bg-tertiary-container` virus — per DESIGN.md); a general card shows an all-players indicator, never a name list; a specific card shows target names only inline in the rendered text, never a separate list/badge
- [ ] T017 [US1] Implement `DrawnCardView` per the approved `DESIGN.md`/`design/*.html` mockups (Mode Chip + display-xl instruction text, type-colored per the classes above, no success/fail controls of any kind) in `src/features/cards/DrawnCardView.tsx` to make T016 pass (depends on T009, T016)
- [ ] T018 [US1] Wire the draw loop into `src/App.tsx`: on `PlayerSetupScreen`'s `onStartGame`, call `buildSessionCardPool` once and replace the current `console.log` placeholder with a "VOLGENDE KAART" action that calls `useDrawPile`'s draw function and renders the result via `DrawnCardView` (depends on T011, T015, T017)

**Checkpoint**: User Story 1 is independently functional — cards of all types/targeting draw and display correctly.

---

## Phase 5: User Story 2 - Draw a virus card and start an active virus effect (Priority: P2)

**Goal**: When a drawn card is a virus, start one independent `ActiveVirusEffect` per resolved target player (never one shared effect across targets) instead of it being a one-off task, and show every currently affected player in a mobile-friendly summary at all times.

**Independent Test**: Draw a virus card; confirm its target(s) resolve the same way as US1, an active effect appears per target, effects persist and remain visible across subsequent draws, and a second virus draw on an already-affected player adds an independent effect rather than replacing the first.

- [ ] T019 [P] [US2] Write failing tests for the "start effect(s)" behavior of `useVirusEffects` in `src/features/virus/useVirusEffects.test.ts`: a virus draw creates one independent `ActiveVirusEffect` per resolved target player, each with its own randomly assigned `liftThreshold` ≥10, `status: "active"`, `assignmentGameDrawsSinceStart: 0`; a second virus draw targeting an already-affected player adds another independent effect, leaving the first untouched
- [ ] T020 [US2] Implement the "start effect(s)" part of `useVirusEffects` in `src/features/virus/useVirusEffects.ts` to make T019 pass (depends on T003, T019)
- [ ] T021 [P] [US2] Write failing React Testing Library tests for `ActiveVirusList` in `src/features/virus/ActiveVirusList.test.tsx`: one row per affected player using the avatar+name+subtext+badge style approved in DESIGN.md; a count badge appears only when a player has more than one active effect; players with zero active effects have no row
- [ ] T022 [US2] Implement `ActiveVirusList` per the DESIGN.md-approved canonical row style (avatar+name+subtext+badge — not the Spel screen's simplified pill-chip variant) in `src/features/virus/ActiveVirusList.tsx` to make T021 pass (depends on T021)
- [ ] T023 [US2] Wire virus-effect starting into `src/App.tsx`: when `useDrawPile`'s result is a virus card, call `useVirusEffects`' start function in addition to rendering it via `DrawnCardView` (T017 already renders virus instruction text/color correctly), and always render `ActiveVirusList` below the current card (depends on T017, T018, T020, T022)

**Checkpoint**: User Stories 1 and 2 are both independently functional.

---

## Phase 6: User Story 3 - Virus is automatically lifted (Priority: P3)

**Goal**: Every active effect's progress advances on each assignment/game draw; once an effect's `assignmentGameDrawsSinceStart` reaches its `liftThreshold`, it lifts (`liftReason: "threshold"`) and a lift card using the virus's own `liftText` is shown, naming the affected player.

**Independent Test**: Start a virus effect, draw its `liftThreshold` worth of subsequent assignment/game cards, and confirm a lift card appears with the correct name substituted, and the effect no longer appears as active.

- [ ] T024 [P] [US3] Write failing tests extending `src/features/virus/useVirusEffects.test.ts` for the "advance + threshold-lift" behavior: every active effect's `assignmentGameDrawsSinceStart` increments by 1 on each assignment/game draw (not on virus draws, not on discarded draws); an effect transitions to `status: "lifted"`, `liftReason: "threshold"` exactly once `assignmentGameDrawsSinceStart >= liftThreshold`; lifted effects no longer appear in the active list
- [ ] T025 [US3] Implement the "advance + threshold-lift" logic in `src/features/virus/useVirusEffects.ts` to make T024 pass (depends on T020, T024)
- [ ] T026 [P] [US3] Write failing React Testing Library tests for `VirusLiftCard` in `src/features/virus/VirusLiftCard.test.tsx`: renders the virus's `liftText` with its single `{player}` token replaced by the lifted effect's target player name
- [ ] T027 [US3] Implement `VirusLiftCard` in `src/features/virus/VirusLiftCard.tsx` to make T026 pass (depends on T009, T026)
- [ ] T028 [US3] Wire threshold-triggered lifts into `src/App.tsx`: after each assignment/game draw, advance all active effects and, for any that just became lifted, show `VirusLiftCard` before returning to the normal draw flow (depends on T023, T025, T027)

**Checkpoint**: User Stories 1, 2, and 3 are all independently functional.

---

## Phase 7: User Story 5 - Game ends when the card pool is exhausted (Priority: P2)

**Goal**: Once the pool's `remainingCardIds` empties, end the session (no further draws) and force-lift every still-active effect (`liftReason: "forced-end"`, oldest `startedAtDraw` first), each shown via the same `VirusLiftCard`.

**Independent Test**: Play a session down to its last pool card and confirm the game ends with no further draw possible; separately, end a session with active effects still short of their threshold and confirm each is shown lifted, oldest first, before the session is considered ended.

**Note on ordering**: numbered "US5" per spec.md but implemented last — it depends on both US1 (the draw loop/pool) and US3 (the lift-card mechanism it reuses for the forced case), overriding pure P1→P2→P3 priority ordering.

- [ ] T029 [P] [US5] Write failing tests extending `src/features/cards/useDrawPile.test.ts`: once `remainingCardIds` is exhausted, `SessionCardPool.hasEnded` becomes `true` and a further draw attempt is refused (no card returned)
- [ ] T030 [US5] Implement the pool-exhaustion → `hasEnded` behavior in `src/features/cards/useDrawPile.ts` to make T029 pass (depends on T015, T029)
- [ ] T031 [P] [US5] Write failing tests extending `src/features/virus/useVirusEffects.test.ts`: a "force-lift all active effects" function sets every still-active effect to `status: "lifted"`, `liftReason: "forced-end"` regardless of `assignmentGameDrawsSinceStart`, returning them ordered by `startedAtDraw` ascending
- [ ] T032 [US5] Implement the force-lift function in `src/features/virus/useVirusEffects.ts` to make T031 pass (depends on T025, T031)
- [ ] T033 [US5] Add a "session ended" state to `src/App.tsx`: when `useDrawPile` reports `hasEnded`, call the force-lift function, show each returned effect's `VirusLiftCard` in order (oldest first), then render a clear game-over state with no further draw action available — no summary/leaderboard/replay flow (explicitly out of scope, spec.md Assumptions) (depends on T028, T030, T032)

**Checkpoint**: All 5 user stories are independently functional and integrated in `App.tsx`.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Full-feature validation now that every story is wired together.

- [ ] T034 [P] Run through all 9 scenarios in quickstart.md against the running app (`npm run dev`) and record/fix any gaps found
- [ ] T035 [P] Run `npm test && npm run lint && npm run build` at the repository root and confirm all green for the complete feature
- [ ] T036 Remove the now-obsolete `console.log('Starting game with players:', players)` placeholder in `src/App.tsx` (superseded by T018's real wiring)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Story 4 (Phase 3, P1)**: Depends on Foundational only.
- **User Story 1 (Phase 4, P1)**: Depends on Foundational **and** User Story 4 (needs a pool to draw from).
- **User Story 2 (Phase 5, P2)**: Depends on User Story 1 (needs the draw loop to draw a virus card).
- **User Story 3 (Phase 6, P3)**: Depends on User Story 2 (needs an active effect to lift).
- **User Story 5 (Phase 7, P2)**: Depends on User Story 1 (the pool/draw loop) **and** User Story 3 (reuses its lift-card mechanism for the forced case).
- **Polish (Phase 8)**: Depends on all five user stories.

This is a **linear** dependency chain (US4 → US1 → US2 → US3 → US5), not a fan-out from Foundational — each story's spec.md "Why this priority" explains the specific dependency on the previous one. Priority labels (P1/P2/P3) reflect user value, not implementation order; US5 (P2) is implemented after US3 (P3) because it structurally depends on US3's lift mechanism.

### Parallel Opportunities

- T002/T003 (Foundational types, different files) can run in parallel.
- T004/T008 (independent test files with no shared dependency) can run in parallel once T002/T003 land.
- Within each story phase, the `[P]`-marked test-writing tasks (e.g. T012, T014, T016) can be drafted in parallel since they target different files — but each must still be observed failing before its paired implementation task starts (Constitution Principle II).
- T034/T035 in Polish can run in parallel.

---

## Parallel Example: Foundational Phase

```bash
# Launch independent Foundational tasks together:
Task: "Define Card, CardSet, TargetingRule types in src/features/cards/card.types.ts"
Task: "Define ActiveVirusEffect type in src/features/virus/virus.types.ts"
```

## Parallel Example: User Story 1

```bash
# Launch independent test-writing tasks for US1 together:
Task: "Write failing tests for resolveTargets in src/features/cards/resolveTargets.test.ts"
Task: "Write failing tests for useDrawPile in src/features/cards/useDrawPile.test.ts"
Task: "Write failing RTL tests for DrawnCardView in src/features/cards/DrawnCardView.test.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 (Setup) and Phase 2 (Foundational) — CRITICAL, blocks everything.
2. Complete Phase 3 (US4: pool building) — needed before anything can be drawn.
3. Complete Phase 4 (US1: draw a card and see who it targets).
4. **STOP and VALIDATE**: run quickstart.md Scenarios 1-3 manually. This alone is a demoable (if minimal) card-drawing loop — no virus mechanic yet.

### Incremental Delivery

1. Foundational + US4 + US1 → MVP demo (assignment/game/virus cards draw and display correctly; virus cards just sit there with no ongoing effect yet).
2. Add US2 → virus effects start and stay visibly tracked → demo.
3. Add US3 → virus effects lift automatically → demo.
4. Add US5 → sessions have a real end, with no active effect ever left dangling → demo (full feature complete).
5. Phase 8 (Polish) → final validation pass.

### Notes

- `[P]` tasks touch different files with no unmet dependency.
- `[Story]` labels map every user-story-phase task back to spec.md for traceability.
- Every implementation task has a preceding failing-test task in the same or an earlier task — do not write implementation code before its paired test is written and observed to fail (Constitution Principle II, NON-NEGOTIABLE for this application code).
- Commit after each task or logical group, per Constitution Principle V (small commits mapped to tasks).
- Stop at any Checkpoint to validate that story's independent test from spec.md before continuing.
