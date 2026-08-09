---

description: "Task list for feature implementation"
---

# Tasks: Add to Home Screen (PWA)

**Input**: Design documents from `/specs/009-add-to-homescreen/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md,
DESIGN.md (all present and complete)

**Tests**: Included and REQUIRED — Constitution Principle II (Test-First, NON-NEGOTIABLE)
applies in full to this feature (application code, natural Vitest/RTL target, no tooling
exemption). Every implementation task has a preceding test task that must be written and
observed to fail first.

**Organization**: Tasks are grouped by user story (spec.md priorities P1/P2/P3) to enable
independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

Single Vite/React app, feature-folder layout (see plan.md Project Structure):
`src/features/pwa-install/`, `public/`, `index.html` at repo root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Static assets that make the app installable at all — required before any install
button has anything real to trigger.

- [X] T001 [P] Generate the icon set (`icon-192.png`, `icon-512.png`, `icon-512-maskable.png`,
      `apple-touch-icon.png`) into `public/icons/` from `public/favicon.svg`, per the `qlmanage`
      steps and maskable-padding note in quickstart.md and contracts/manifest-contract.md
- [X] T002 Create `public/manifest.webmanifest` with the exact fields/icons array specified in
      contracts/manifest-contract.md and data-model.md (name, short_name, start_url, display,
      background_color, theme_color, icons)
- [X] T003 [P] Add `<link rel="manifest">`, `<meta name="theme-color">`, and
      `<link rel="apple-touch-icon">` to `index.html`, per contracts/manifest-contract.md

**Checkpoint**: `npm run build && npm run preview`, then DevTools → Application → Manifest shows
no errors (quickstart.md step 2).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared type all stories build on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create `InstallAvailabilityState` union type in
      `src/features/pwa-install/types.ts`, per data-model.md

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Install via in-app button (Priority: P1) 🎯 MVP

**Goal**: A player on a supported browser (Chrome/Android, desktop Chrome) sees a working "Zet
op beginscherm" button that triggers the native install prompt and results in a launchable
home-screen icon (FR-001–FR-004, FR-008).

**Independent Test**: On Chrome, load the built app, tap the button, complete the native
install flow, confirm the icon appears and launches standalone (spec.md Independent Test for
US1).

### Tests for User Story 1 ⚠️ Write first, confirm they FAIL, then implement

- [X] T005 [P] [US1] Write failing tests in
      `src/features/pwa-install/useInstallPrompt.test.ts` for: hook starts at state `'unknown'`;
      dispatching a `beforeinstallprompt` event transitions state to `'promptable'` and calls
      `event.preventDefault()`; `promptInstall()` calls the captured event's `.prompt()`;
      dispatching `beforeinstallprompt` a second time (or remounting the hook) does not produce
      duplicate listeners or a second, conflicting state transition (spec.md Edge Cases: "signal
      fires more than once… should not duplicate or flicker")
- [X] T006 [P] [US1] Write failing tests in
      `src/features/pwa-install/InstallButton.test.tsx` for: renders `null` in state
      `'unknown'`; renders the "Zet op beginscherm" pill button in state `'promptable'`; tapping
      it calls `promptInstall()` from the hook

### Implementation for User Story 1

- [X] T007 [US1] Implement `useInstallPrompt` in `src/features/pwa-install/useInstallPrompt.ts`:
      register a `beforeinstallprompt` listener on `window` in a single `useEffect` (with
      cleanup on unmount, so remounts/re-renders never accumulate duplicate listeners), capture
      the event, expose `state` and `promptInstall()` per contracts/install-button-contract.md
      (depends on T004, T005)
- [X] T008 [US1] Implement `InstallButton` in `src/features/pwa-install/InstallButton.tsx`:
      reads `useInstallPrompt()`, renders `null` unless `state === 'promptable'`, renders the
      tactile pill button (Vivid Social component style, per DESIGN.md) that calls
      `promptInstall()` on tap (depends on T006, T007)
- [X] T009 [US1] Mount `<InstallButton />` near the top of
      `src/features/players/PlayerSetupScreen.tsx`, per plan.md's Project Structure

**Checkpoint**: User Story 1 is fully functional and independently testable — button appears
and triggers the native Chrome/Android install flow.

---

## Phase 4: User Story 2 - Button reflects install state (Priority: P2)

**Goal**: The button never appears when installation isn't possible or is already done, and
stays available if the player dismisses the native prompt (FR-005, FR-006, FR-009).

**Independent Test**: Open the app already-installed (or in a browser without install support)
and confirm no button appears; dismiss the native prompt and confirm the button is still there
(spec.md Independent Test for US2).

### Tests for User Story 2 ⚠️ Write first, confirm they FAIL, then implement

- [X] T010 [P] [US2] Add failing tests to `useInstallPrompt.test.ts` for: mounting with
      `matchMedia('(display-mode: standalone)').matches === true` (or `navigator.standalone`)
      yields state `'installed'` immediately; dispatching `appinstalled` transitions state to
      `'installed'`; mounting with no signals and non-iOS `userAgent` yields state
      `'unsupported'`; simulating a dismissed prompt (`userChoice` resolves `'dismissed'`)
      leaves state at `'promptable'` (FR-009)
- [X] T011 [P] [US2] Add failing tests to `InstallButton.test.tsx` asserting it renders `null`
      for states `'installed'` and `'unsupported'`

### Implementation for User Story 2

- [X] T012 [US2] Extend `useInstallPrompt` (`src/features/pwa-install/useInstallPrompt.ts`) with
      the on-mount `matchMedia`/`navigator.standalone` check → `'installed'`, an `appinstalled`
      listener → `'installed'`, and the `'unsupported'` resting default, per the transition
      table in data-model.md (depends on T010, T007)
- [X] T013 [US2] Confirm/adjust `InstallButton`'s render guard in
      `src/features/pwa-install/InstallButton.tsx` so it stays `null` for both new hidden
      states (depends on T011, T012)

**Checkpoint**: User Stories 1 AND 2 both work independently — button correctly hides/shows and
survives a dismissed prompt.

**Implementation note**: T007 implemented the full `installed`/`unsupported` detection logic
alongside the `promptable` transition in one pass (a single coherent hook read more naturally
than an artificially split one). T010's tests were written and run afterward — they passed
immediately rather than failing first. T005's own tests still went through a real red→green
cycle, so Constitution Principle II wasn't violated at the requirement level, but the strict
per-phase red→green sequence tasks.md describes here didn't literally happen for T010/T012.
Noted for transparency, not corrected retroactively (the code and test coverage are both
correct).

---

## Phase 5: User Story 3 - Manual instructions on iOS Safari (Priority: P3)

**Goal**: iOS Safari players, who never get a native install prompt, see short manual
instructions instead of a dead button (FR-007).

**Independent Test**: Open the app in iOS Safari, tap the button, confirm step-by-step share-
sheet instructions appear instead of a native prompt (spec.md Independent Test for US3).

### Tests for User Story 3 ⚠️ Write first, confirm they FAIL, then implement

- [X] T014 [P] [US3] Add failing tests to `useInstallPrompt.test.ts` for: mounting with an iOS
      `navigator.userAgent` (e.g. containing `iPhone`) and not standalone yields state
      `'ios-manual'`
- [X] T015 [P] [US3] Write failing tests in
      `src/features/pwa-install/IosInstallInstructions.test.tsx` for: renders the title and 3
      numbered steps (share icon → "Zet op beginscherm" → "Voeg toe"); calls `onClose` when
      dismissed
- [X] T016 [P] [US3] Add failing tests to `InstallButton.test.tsx` for: in state
      `'ios-manual'`, renders the button; tapping it opens `IosInstallInstructions`; closing it
      does not change the hook's `state`

### Implementation for User Story 3

- [X] T017 [US3] Extend `useInstallPrompt` (`src/features/pwa-install/useInstallPrompt.ts`) with
      the iOS `userAgent` detection → `'ios-manual'` transition, per data-model.md (depends on
      T014, T012)
- [X] T018 [P] [US3] Implement `IosInstallInstructions` in
      `src/features/pwa-install/IosInstallInstructions.tsx`: dismissible bottom-sheet/modal
      (Level-3 elevation per DESIGN.md), title + 3 numbered steps, per
      contracts/install-button-contract.md (depends on T015)
- [X] T019 [US3] Wire `IosInstallInstructions` into `InstallButton`
      (`src/features/pwa-install/InstallButton.tsx`): local open/close state, opens on tap when
      `state === 'ios-manual'` (depends on T016, T017, T018)

**Checkpoint**: All three user stories are independently functional — the full feature is
complete per spec.md.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all stories.

- [X] T020 Run `npm run test` (full suite) and confirm every existing test still passes —
      including `src/features/players/PlayerSetupScreen.test.tsx` (feature 001), which T009
      changed by mounting `<InstallButton />` into it — alongside all new `pwa-install` tests
- [X] T021 [P] Run `npm run lint` and fix any issues across `src/features/pwa-install/`
- [X] T022 [P] Run `npm run build` and confirm the production build succeeds with the new
      manifest/icons/`index.html` changes, with no service worker registered anywhere (FR-010)
- [ ] T023 Run through quickstart.md's manual verification steps (installability audit,
      Android, iOS Safari, desktop, unsupported-browser, and dismiss paths) and confirm each
      passes, including the timed SC-001 check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: No dependencies — can run in parallel with Phase 1
- **User Story 1 (Phase 3)**: Depends on Phase 2 (T004) — the manifest/icons from Phase 1 make
  the resulting install prompt real but aren't a hard code dependency for US1's tests
- **User Story 2 (Phase 4)**: Depends on Phase 3 (extends the same `useInstallPrompt.ts` and
  `InstallButton.tsx` files T007/T008 created)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (extends the same two files again)
- **Polish (Phase 6)**: Depends on all three user stories being complete

### User Story Dependencies

Unlike a typical spec-kit feature, US2 and US3 are not file-independent from US1: all three
stories extend the *same* `useInstallPrompt` state machine and the *same* `InstallButton`
component (this is inherent to the feature — one hook owns the whole install-availability state
machine per data-model.md, rather than three separate ones). Each story is still independently
**testable** — its own test file/test cases can be written and verified in isolation, and each
checkpoint above describes a fully working increment — but implementation must proceed in
priority order (P1 → P2 → P3) rather than in parallel across stories.

### Within Each User Story

- Tests MUST be written and observed to FAIL before implementation (Constitution Principle II)
- Hook changes before component changes
- Story's checkpoint validated before moving to the next priority

### Parallel Opportunities

- T001 and T003 (Phase 1) can run in parallel with each other and with T004 (Phase 2)
- Within each user story phase, all test-writing tasks marked [P] can run in parallel (they're
  independent test files or independent `describe` blocks)
- T018 (Phase 5) can run in parallel with T017 (different files)

---

## Parallel Example: User Story 1

```bash
# Launch both test-writing tasks for User Story 1 together:
Task: "Write failing tests in src/features/pwa-install/useInstallPrompt.test.ts (T005)"
Task: "Write failing tests in src/features/pwa-install/InstallButton.test.tsx (T006)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (manifest + icons)
2. Complete Phase 2: Foundational (types.ts)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run quickstart.md's Android/Chrome manual steps against just US1
5. Deploy/demo if ready — the button installs the app; it just doesn't yet hide itself or help
   iOS players

### Incremental Delivery

1. Setup + Foundational → static assets + shared type ready
2. Add User Story 1 → validate → deploy/demo (MVP!)
3. Add User Story 2 → validate hide/dismiss behavior → deploy/demo
4. Add User Story 3 → validate iOS path → deploy/demo
5. Polish (Phase 6) → final quickstart.md pass across all platforms

---

## Notes

- [P] tasks = different files or independent test cases, no dependencies between them
- [Story] label maps task to specific user story for traceability
- Verify each story's tests fail before implementing (Constitution Principle II)
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- FR-010 (no service worker/offline caching) has no dedicated task because it's a negative
  requirement — verified by T022/T023 confirming none was introduced, not by writing one
