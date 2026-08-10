---

description: "Task list for feature 010-card-sets"
---

# Tasks: Kaartensets

**Input**: Design documents from `/specs/010-card-sets/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, DESIGN.md (all present, no `contracts/` — see plan.md)

**Tests**: Included and REQUIRED, not optional — Constitution Principle II (Test-First, NON-NEGOTIABLE) mandates a failing test before implementation for every behavior in this feature's application code. Stack: Vitest (hooks/logic) + React Testing Library (components), per plan.md.

**Scope reminder**: this feature only generalizes *which* `CardSet` a session uses — feature 004's pool-building/draw/targeting/virus mechanics are reused unmodified (plan.md, research.md). No task below touches `buildSessionCardPool`, `useDrawPile`, `resolveTargets`, `renderCardText`, or anything in `src/features/virus/`.

**Design reference**: UI follows the approved `DESIGN.md` addendum — the "Kaartenset kiezen" screen (`design/kaartenset-kiezen-mobile.html`/`.png`), a vertical list of named set-choice cards (icon + name + card count) with a primary-bordered + filled-check selected state vs. an outlined-circle unselected state, followed by a "START SPEL" tactile button — reusing the exact tokens/components already used by `PlayerSetupScreen`/`spelers-toevoegen-mobile.html` (no new colors, typography, or shapes).

**Post-merge note (2026-08-09)**: this branch was rebased onto `main` after feature 008 (end-of-game screen) merged, which added `sessionKey`/`onPlayAgain`/`onChangePlayers` state and `EndOfGameScreen` to `src/App.tsx`, plus a new `src/App.test.tsx` integration-test precedent (mocking `buildSessionCardPool`). Tasks below were revised accordingly — see research.md's new "Speel opnieuw reuses the locked card set" decision and data-model.md's updated "Session lock" section. Two test tasks (T006, T007) were added to US1 that didn't exist in the original task list, using that precedent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US3, matching spec.md's numbering)
- File paths are relative to the repository root

## Path Conventions

Single project (established by feature 001, reused as-is): `src/features/<feature>/`, tests colocated with source (`Foo.ts` + `Foo.test.ts`, or `Foo.tsx` + `Foo.test.tsx`).

<!-- Sample tasks from the template have been replaced with the actual task list below. -->

## Phase 1: Setup

**Purpose**: Confirm the existing toolchain (established by features 001/004/008, no new setup needed for this feature) is green on this branch before starting new work.

- [X] T001 Run `npm install && npm test && npm run lint && npm run build` at the repository root and confirm all four succeed cleanly on this branch (post-rebase onto `main`) before starting any new work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The card-set catalog — the single source every user story reads from — must exist and be validated before any selection UI can be built on top of it.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Write failing tests in `src/features/cards/data/card-set-catalog.test.ts`: `cardSetCatalog` contains at least one entry; every entry independently passes `validateCardSet` with zero errors (FR-006); no two entries share a `name` (FR-008)
- [X] T003 Implement `src/features/cards/data/card-set-catalog.ts`, exporting `cardSetCatalog: CardSet[] = [seedCardSet]`, to make T002 pass (depends on T002)

**Checkpoint**: A validated catalog exists, always containing the seed set — user story implementation can begin.

---

## Phase 3: User Story 1 - Een kaartenset kiezen bij het opzetten van een spel (Priority: P1) 🎯 MVP

**Goal**: At session setup, show the names of every available card set and let the user pick one before the game starts; once chosen, every card drawn that session comes from that set only, for the whole setup pass (including an end-of-game "Speel opnieuw" replay — see below); if only one set is available, skip the choice step entirely.

**Independent Test**: Set up a game with multiple sets available, choose one from the options, start the game, and verify every drawn card comes from the chosen set (never another). Separately, with only one set available, verify it's used automatically with no forced choice step.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T004 [P] [US1] Write failing tests for `useCardSetSelection` in `src/features/cards/useCardSetSelection.test.ts` (in-memory only, no persistence yet — that's US3): starts with `cardSetCatalog[0]` as the resolved `CardSet`; calling `select(id)` updates the resolved `CardSet` to the matching catalog entry
- [X] T005 [P] [US1] Write failing React Testing Library tests for `CardSetSelectionScreen` in `src/features/cards/CardSetSelectionScreen.test.tsx`: with a multi-entry catalog, renders one row per set showing its name, with exactly one visually marked as selected by default; tapping a different row changes which one is marked selected; tapping "START SPEL" calls `onContinue` with the currently selected set; with a single-entry catalog, renders no selectable rows and calls `onContinue` immediately with that one set (FR-007)
- [X] T006 [P] [US1] Extend `src/App.test.tsx` (reusing its existing `vi.mock('./features/cards/buildSessionCardPool')` pattern from feature 008, plus a `vi.mock` of `./features/cards/data/card-set-catalog` for a multi-entry test double): after adding players and confirming, the "Kaartenset kiezen" screen appears before any card can be drawn; choosing a specific set and confirming means `buildSessionCardPool` is called with that set (not another); with the catalog mocked to a single entry, no selection screen appears and "VOLGENDE KAART" is available immediately after player setup (FR-004, FR-005, FR-007)
- [X] T007 [P] [US1] Extend `src/App.test.tsx`: with a multi-entry catalog mock, choose a non-default set, play to the end-of-game screen, click "SPEEL OPNIEUW" — assert the new session's `buildSessionCardPool` call still uses the same previously-chosen set and the selection screen is **not** shown again; separately, click "Spelers wijzigen" instead — assert the flow returns to player setup and, after confirming players again, the selection screen **is** shown again (FR-012; research.md "Speel opnieuw reuses the locked card set" decision)

### Implementation for User Story 1

- [X] T008 [US1] Implement the `useCardSetSelection` hook (in-memory selection state, defaulting to `cardSetCatalog[0]`, exposing the resolved `CardSet` and a `select(id)` function) in `src/features/cards/useCardSetSelection.ts` to make T004 pass (depends on T003, T004)
- [X] T009 [US1] Implement `CardSetSelectionScreen` per the approved `DESIGN.md`/`design/kaartenset-kiezen-mobile.html` mockup (set-choice cards with selected/unselected states, "START SPEL" button, auto-skip-and-continue when `cardSetCatalog.length === 1`) in `src/features/cards/CardSetSelectionScreen.tsx` to make T005 pass (depends on T008, T005)
- [X] T010 [US1] Wire `CardSetSelectionScreen` into `src/App.tsx`: add a `cardSet: CardSet | null` state stage between `players` and `GameScreen`, set once when the selection screen's `onContinue` fires (alongside the existing `players` assignment). `GameScreen` takes `cardSet` as a new prop and calls `buildSessionCardPool(cardSet)` instead of importing `seedCardSet` directly. Critically, this state must follow the *same* lifecycle as the existing `players`/`sessionKey` state from feature 008: `onPlayAgain` (bumps `sessionKey`) leaves `cardSet` untouched — it does **not** re-render `CardSetSelectionScreen`; `onChangePlayers` resets `cardSet` to `null` alongside `players`, so the next setup pass re-prompts for a set too (research.md, data-model.md "Session lock"). Makes T006 and T007 pass (depends on T009, T006, T007)

**Checkpoint**: User Story 1 is independently functional — a set can be chosen (or is auto-used when there's only one), the whole session draws exclusively from it, and that lock correctly survives "Speel opnieuw" while resetting on "Spelers wijzigen".

---

## Phase 4: User Story 2 - Altijd kunnen testen met de seed-testset (Priority: P2)

**Goal**: Regardless of how many "real" sets have been added, the seed test set always appears as a choice and behaves exactly as it did before this feature (feature 004's behavior, unchanged).

**Independent Test**: Add several additional card sets to the catalog, confirm the seed test set still appears in the list and still works identically to the pre-feature-010 game.

### Tests for User Story 2 ⚠️

- [X] T011 [P] [US2] Extend `src/features/cards/data/card-set-catalog.test.ts` with a locally-constructed multi-entry fixture (seed set + 2+ fixture "real" sets): asserts the real `seedCardSet`'s `id` is present in `cardSetCatalog` regardless of how many other entries exist (FR-003)
- [X] T012 [P] [US2] Extend `src/features/cards/CardSetSelectionScreen.test.tsx` with a multi-entry fixture catalog (3+ sets): the seed test set's name is rendered among the choices and remains selectable in a single tap (SC-003)

### Implementation for User Story 2

- [X] T013 [US2] Confirm T011/T012 pass against the existing US1 implementation (expected: no code change, since `cardSetCatalog`'s first/only guaranteed entry is already `seedCardSet` per T003, and `CardSetSelectionScreen` already renders every catalog entry per T009); if either test reveals a gap, fix `card-set-catalog.ts` or `CardSetSelectionScreen.tsx` so the seed set can never be excluded or made unreachable (depends on T011, T012)

**Checkpoint**: User Stories 1 and 2 are both independently functional.

---

## Phase 5: User Story 3 - De laatst gekozen set onthouden (Priority: P3)

**Goal**: The app remembers the last chosen card set (same `localStorage` mechanism as the player list) and pre-selects it at the next session setup, falling back to the seed test set if the remembered choice no longer exists in the catalog.

**Independent Test**: Choose a set, reload the page (simulating a new session), and verify that set is pre-selected with the option to still pick another. Separately, remove the remembered set from the catalog and verify the app falls back to the seed test set instead of erroring.

### Tests for User Story 3 ⚠️

- [X] T014 [P] [US3] Write failing tests extending `src/lib/storage.test.ts`: `getSelectedCardSetId()` returns `null` when nothing is stored; `setSelectedCardSetId(id)` followed by `getSelectedCardSetId()` round-trips the id under the `badzwanzen:selected-card-set-id` key
- [X] T015 [P] [US3] Extend `src/features/cards/useCardSetSelection.test.ts`: on initial mount, if a stored id names an entry still present in `cardSetCatalog`, that entry is the resolved default (FR-010); if nothing is stored, or the stored id names no current catalog entry, `seedCardSet` is the resolved default instead (FR-011); calling `select(id)` immediately persists that id via `setSelectedCardSetId`; when the catalog has exactly one entry (auto-skip case), its id is still persisted even though no explicit tap occurred

### Implementation for User Story 3

- [X] T016 [US3] Implement `getSelectedCardSetId(): string | null` and `setSelectedCardSetId(id: string): void` in `src/lib/storage.ts`, under the new `badzwanzen:selected-card-set-id` key, to make T014 pass (depends on T014)
- [X] T017 [US3] Extend `useCardSetSelection` in `src/features/cards/useCardSetSelection.ts` to resolve its initial selection from `getSelectedCardSetId()` (falling back to `seedCardSet.id` per FR-011) instead of always `cardSetCatalog[0]`, and to call `setSelectedCardSetId` whenever the resolved selection changes (including the auto-skip case from US1), to make T015 pass (depends on T008, T016, T015)

**Checkpoint**: All three user stories are independently functional and integrated in `App.tsx`.

---

## Phase 5b: Real content — "Badzwanzen" card set (post-implementation, 2026-08-09)

**Context**: spec.md Assumptions always anticipated a first real set arriving after planning
(`specs/010-card-sets/badzwanzen.txt`, 780 raw lines). Converted and integrated once the file
arrived, following the developer's direct instruction that Badzwanzen be the production default
while the seed set stays the stable default for tests.

- [X] T017b Convert `badzwanzen.txt` (Picolo-style Dutch party prompts) into 386 `Card` objects in `src/features/cards/data/badzwanzen-card-set.ts` — type inferred from leading `Virus`/`Spel`/(none→assignment) prefix, `{player}` tokens inferred from standalone occurrences of "naam" (word-boundary aware, so compounds like "voornaam"/"achternaam" and genuine common-noun uses like "je naam hebt" are excluded — see conversion notes below), virus `liftText` synthesized generically (`"Het virus bij {player} is opgeheven."`) since the source has no lift text of its own. Per explicit developer instruction (2026-08-09), the source's one line containing a literal racial-slur inflection was removed by the developer directly in the source file before conversion; every other line, including crude/edgy content, was converted as-is.
- [X] T017c Write `badzwanzen-card-set.test.ts` asserting `validateCardSet(badzwanzenCardSet)` returns zero errors and `name === 'Badzwanzen'` (mirrors `seed-card-set.test.ts`)
- [X] T017d Reorder `cardSetCatalog` to `[badzwanzenCardSet, seedCardSet]` (Badzwanzen first)
- [X] T017e Change `useCardSetSelection`'s fallback/default from a hardcoded `seedCardSet.id` to `catalog[0].id` (research.md, revised decision) — updated `useCardSetSelection.test.ts` first (TDD) to assert fallback targets the catalog's first entry rather than a specific hardcoded id, then updated the implementation to match
- [X] T017f Manual browser verification: Badzwanzen (380 kaarten) pre-selected by default on the selection screen; `{player}` substitution renders correctly across assignment/game/virus draws with real content; a general-targeting virus card correctly started effects on both players; zero console errors

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Full-feature validation now that every story is wired together.

- [X] T018 [P] Run through all 7 scenarios in `quickstart.md` against the running app (`npm run dev`), record/fix any gaps found
- [X] T019 [P] Run `npm test && npm run lint && npm run build` at the repository root and confirm all green for the complete feature
- [X] T020 Confirm `src/App.tsx`'s `GameScreen` no longer imports `seedCardSet` directly (`grep -rn "seed-card-set" src/App.tsx` should return nothing) — it must only ever receive the selected `CardSet` via props, per plan.md's structure decision

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Story 1 (Phase 3, P1)**: Depends on Foundational only.
- **User Story 2 (Phase 4, P2)**: Depends on User Story 1 (reuses `CardSetSelectionScreen`/`cardSetCatalog` it built; adds regression-guard tests over a larger fixture catalog).
- **User Story 3 (Phase 5, P3)**: Depends on User Story 1 (extends `useCardSetSelection`, which US1 created).
- **Polish (Phase 6)**: Depends on all three user stories.

This is a **linear** dependency chain (US1 → US2 → US3), not a fan-out from Foundational — US2 and US3 each extend files US1 created rather than introducing independent new modules. Priority labels (P1/P2/P3) match spec.md and also match implementation order here.

### Parallel Opportunities

- T002 (Foundational test) has no sibling to parallelize with in this phase — it's the sole gate before US1.
- T004/T005/T006/T007 (US1 test-writing, different files: hook, component, and two `App.test.tsx` extensions) can run in parallel — note T006/T007 both extend the same file, so in practice write them as one combined edit even though they're listed as separate, independently-motivated assertions.
- T011/T012 (US2 test-writing, different files) can run in parallel.
- T014/T015 (US3 test-writing, different files: `storage.test.ts` vs. `useCardSetSelection.test.ts`) can run in parallel — note T015 exercises behavior that isn't implemented until T016/T017, so it must still be observed failing before those land.
- T018/T019 in Polish can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch independent test-writing tasks for US1 together:
Task: "Write failing tests for useCardSetSelection in src/features/cards/useCardSetSelection.test.ts"
Task: "Write failing RTL tests for CardSetSelectionScreen in src/features/cards/CardSetSelectionScreen.test.tsx"
Task: "Extend src/App.test.tsx with set-selection + single-set auto-skip assertions"
Task: "Extend src/App.test.tsx with Speel-opnieuw-keeps-set vs. Spelers-wijzigen-resets-set assertions"
```

## Parallel Example: User Story 3

```bash
# Launch independent test-writing tasks for US3 together:
Task: "Extend src/lib/storage.test.ts with getSelectedCardSetId/setSelectedCardSetId round-trip tests"
Task: "Extend src/features/cards/useCardSetSelection.test.ts with stored-default/fallback/persist-on-select tests"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational) — CRITICAL, blocks everything.
2. Complete Phase 3 (US1: choose a set at setup, locked for the session — including across a "Speel opnieuw" replay — and auto-skipped when only one exists).
3. **STOP and VALIDATE**: run quickstart.md Scenarios 1, 3, and 7 manually. This alone is a demoable set-selection step, even with only the seed set in the catalog.

### Incremental Delivery

1. Foundational + US1 → MVP demo (choose among sets, or auto-use the only one; chosen set drives the whole session and survives replay).
2. Add US2 → regression-guard tests confirming the seed set survives catalog growth → demo (mostly a confidence/test milestone, minimal new UI).
3. Add US3 → last choice remembered across sessions, with a safe fallback → demo (full feature complete).
4. Phase 6 (Polish) → final validation pass.

### Notes

- `[P]` tasks touch different files with no unmet dependency (T006/T007 are the one exception — both touch `App.test.tsx` — see Parallel Opportunities).
- `[Story]` labels map every user-story-phase task back to spec.md for traceability.
- Every implementation task has a preceding failing-test task in the same or an earlier task — do not write implementation code before its paired test is written and observed to fail (Constitution Principle II, NON-NEGOTIABLE for this application code).
- Commit after each task or logical group, per Constitution Principle V (small commits mapped to tasks).
- Stop at any Checkpoint to validate that story's independent test from spec.md before continuing.
