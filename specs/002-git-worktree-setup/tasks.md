---

description: "Task list for git worktree setup feature"
---

# Tasks: Git worktrees voor parallelle feature-ontwikkeling

**Input**: Design documents from `/specs/002-git-worktree-setup/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/cli.md, quickstart.md

**Tests**: This feature has no automated test suite (see `research.md` → "Testing approach"):
verification happens via the manual `quickstart.md` scenarios, referenced directly from the
tasks below instead of separate contract/integration test tasks.

**Organization**: Tasks are grouped by user story so each can be implemented and verified
independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact and relative to the repository root

## Phase 1: Setup

**Purpose**: Scaffolding shared by every later phase

- [X] T001 Create the `docs/` directory with a `docs/worktrees.md` stub containing section
      headings: "Overzicht", "Een feature starten", "Nummering over werkmappen heen",
      "Opruimen", "Bekende beperkingen"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix the feature-numbering logic so it's safe across parallel worktrees/branches —
required before either US1 or US2 can be correctly implemented or verified (this is the exact
bug reproduced in this project: `001-add-players` and `001-git-worktree-setup` both got
assigned `001`)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add a `get_highest_from_branches()` helper to `.specify/scripts/bash/common.sh` that
      runs `git for-each-ref --format='%(refname)' refs/heads refs/remotes/origin`, matches
      names against `^[0-9]{3,}-` (reusing the existing digit-range-safety checks already in
      `create-new-feature.sh`), and returns the highest number found
- [X] T003 In `.specify/scripts/bash/create-new-feature.sh`, change the `BRANCH_NUMBER`
      auto-detection to take the max of `get_highest_from_specs()` (existing) and
      `get_highest_from_branches()` (T002) before adding one (depends on T002)
- [X] T004 Manually verify per `specs/002-git-worktree-setup/quickstart.md` → "Scenario A: a
      branch exists locally but its `specs/` dir isn't in the current checkout" (depends on
      T003)

**Checkpoint**: Feature numbering is now collision-safe for every feature created from this
point on — both user stories below build on this.

---

## Phase 3: User Story 1 - Een nieuwe feature starten in een eigen werkmap (Priority: P1) 🎯 MVP

**Goal**: A developer can run one command to get a fully independent worktree (own branch, own
checkout) for a new feature, without touching whatever is checked out elsewhere.

**Independent Test**: With another branch checked out and holding uncommitted changes, run
`worktree-add.sh` for a new feature; confirm a new, isolated worktree appears and the original
working directory (and its uncommitted changes) is untouched.

### Implementation for User Story 1

- [X] T005 [P] [US1] Implement `.specify/scripts/bash/worktree-add.sh`: parse
      `[--short-name <name>] "<feature description>"` per `contracts/cli.md`, source
      `common.sh`, run `git fetch origin`, and compute the next branch name via the
      now-fixed numbering logic (dry-run style, reusing `create-new-feature.sh`'s branch-name
      generation)
- [X] T006 [US1] In `worktree-add.sh`, create the worktree with
      `git worktree add -b <branch> ../<repo-name>-worktrees/<branch> origin/main`, deriving
      `<repo-name>` from the repository directory's own basename (depends on T005)
- [X] T007 [US1] In `worktree-add.sh`, add explicit error handling (non-zero exit, no partial
      state left behind) per the concrete message contract in `contracts/cli.md`: target path
      already exists → message includes the path; branch already checked out elsewhere → 
      message includes the branch name **and** the other worktree's path (FR-006); `origin`
      unreachable → message includes the remote name and the underlying git error (depends on
      T006)
- [X] T008 [US1] In `worktree-add.sh`, print the created worktree path, branch name, and
      next-step instructions (`cd` into it, run `npm install`, then run `/speckit-specify`) on
      success (depends on T006)
- [X] T009 [US1] Document "Een feature starten" in `docs/worktrees.md`: when/why to use
      `worktree-add.sh`, the exact command, and the required `npm install` step per worktree
      since dependencies aren't shared between worktrees (FR-005) (depends on T008)
- [X] T010 [US1] Manually verify per `quickstart.md` → "Create a worktree", "Confirm
      isolation", and "Attempt a conflicting worktree": happy path (including the `time`
      check against SC-001's 2-minute budget), isolation from the original worktree, and the
      conflict error path all behave as documented. The `npm install`/`npm run dev`/`npm test`
      portion (FR-002/SC-004) stays deferred until `001-add-players` is merged — see `plan.md`
      → Constraints (depends on T007, T009)

**Checkpoint**: User Story 1 is fully functional and independently testable — this alone is
the MVP (a developer can already start a parallel feature safely).

---

## Phase 4: User Story 2 - Conflictvrije feature-nummering over werkmappen heen (Priority: P1)

**Goal**: Confirm and document, specifically for the parallel-worktree scenario, that two
features started at the same time never collide on the same number.

**Independent Test**: With a feature branch that exists only on `origin` (not yet fetched
locally, not present in the current checkout's `specs/` directory), start a new feature and
confirm the computed number doesn't collide with it.

### Implementation for User Story 2

- [X] T011 [US2] Manually verify per `quickstart.md` → "Scenario B: a branch exists only on
      `origin`, never fetched into a local branch before" — this is a distinct git state from
      T004's Scenario A and MUST be run separately, not assumed to pass because T004 did
- [X] T012 [US2] Document the numbering guarantee and its one precondition (`git fetch origin`
      must run first) in `docs/worktrees.md` → "Nummering over werkmappen heen" (FR-003)
      (depends on T011)

**Checkpoint**: User Stories 1 and 2 both functional — numbering is verified safe specifically
across parallel worktrees, not just within a single checkout.

---

## Phase 5: User Story 3 - Een werkmap opruimen na afronding (Priority: P3)

**Goal**: A developer can cleanly remove a finished feature's worktree (and its branch, if
merged) with one command, without silently discarding uncommitted work.

**Independent Test**: Merge a feature branch, run `worktree-remove.sh` on it, and confirm the
worktree and branch are gone from `git worktree list`/`git branch`.

### Implementation for User Story 3

- [X] T013 [P] [US3] Implement `.specify/scripts/bash/worktree-remove.sh`: parse
      `<branch-name> [--force]` per `contracts/cli.md`, source `common.sh`, and locate the
      worktree for `<branch-name>` via `git worktree list`
- [X] T014 [US3] In `worktree-remove.sh`, detect uncommitted changes in the target worktree
      and refuse (non-zero exit, list the changes) unless `--force` is passed (depends on
      T013)
- [X] T015 [US3] In `worktree-remove.sh`, run `git worktree remove`, then delete the local
      branch with `git branch -d` only if it's fully merged into `main` (reporting whether it
      did), and print `git worktree list` afterward for confirmation (depends on T014)
- [X] T016 [US3] Document "Opruimen" in `docs/worktrees.md`: the removal command, the
      dirty-worktree refusal, and the `--force` override (depends on T015)
- [X] T017 [US3] Manually verify per `quickstart.md` → "Clean up" and "Attempt to remove a
      dirty worktree": the happy path (including the `time` check against SC-003's 1-minute
      budget) and the dirty-refusal/`--force` path both behave as documented (depends on T016)

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tie the per-story documentation together and do a final end-to-end check

- [X] T018 [P] Consolidate `docs/worktrees.md` into one coherent walkthrough (create → work →
      clean up) and cross-check that every requirement FR-001 through FR-007 is covered
      somewhere in it, including: the non-git-files gotcha (FR-005), the "already checked out
      elsewhere" error expectation (FR-006), and an explicit line for FR-007 noting this
      works per-developer/per-machine by construction (git worktrees are inherently local to
      one clone — nothing in `worktree-add.sh`/`worktree-remove.sh` distinguishes developers),
      so no dedicated code was needed for it
- [X] T019 [P] Add a short pointer to `docs/worktrees.md` from `README.md` (e.g. "Aan meerdere
      features tegelijk werken? Zie docs/worktrees.md.")
- [X] T020 Run the full `specs/002-git-worktree-setup/quickstart.md` top-to-bottom once as
      final acceptance validation for everything **except** the `npm install`/`npm run
      dev`/`npm test` portion of "Create a worktree" (FR-002/SC-004), which stays deferred
      until `001-add-players` is merged (see `plan.md` → Constraints); re-run just that
      portion once 001 lands

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS both user stories (US1 and US2 both
  rely on the fixed numbering logic)
- **User Story 1 (Phase 3)**: Depends on Foundational only — this is the MVP
- **User Story 2 (Phase 4)**: Depends on Foundational only; independent of US1 (verifies/
  documents a guarantee the Foundational phase already implements)
- **User Story 3 (Phase 5)**: Depends on Foundational only; independent of US1 and US2 (can be
  built and tested with any existing branch/worktree, not necessarily one created by US1's
  script)
- **Polish (Phase 6)**: Depends on all three user stories being complete (it consolidates their
  documentation)

### Cross-Feature Dependency

- T010 and T020's `npm install`/`npm run dev`/`npm test` checks (FR-002/SC-004) depend on
  feature `001-add-players`'s app scaffold existing. That feature was still an open, unmerged
  PR when this plan was written. This feature (002) can be fully implemented and merged
  without waiting for 001 — only that specific slice of verification is deferred, and is
  explicitly called out as such in T010/T020 rather than silently skipped.

### Within Each User Story

- Script implementation before error handling before output/reporting before documentation
  before manual verification (each task lists its specific dependency above)

### Parallel Opportunities

- T005 (`worktree-add.sh`) and T013 (`worktree-remove.sh`) touch different files and have no
  dependency on each other — can be built in parallel once Foundational is done
- T018 and T019 (Polish) touch different files and can run in parallel

---

## Parallel Example: Foundational done, starting User Stories

```bash
# Once T002-T004 (Foundational) are complete, these can start in parallel:
Task: "Implement worktree-add.sh in .specify/scripts/bash/worktree-add.sh"
Task: "Implement worktree-remove.sh in .specify/scripts/bash/worktree-remove.sh"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (fixes the numbering bug — CRITICAL, blocks everything else)
3. Complete Phase 3: User Story 1 (`worktree-add.sh`)
4. **STOP and VALIDATE**: run the relevant `quickstart.md` scenarios for US1
5. At this point, a developer can already start a parallel feature safely — US2 and US3 add
   the numbering write-up and the cleanup path on top

### Incremental Delivery

1. Setup + Foundational → numbering is fixed project-wide
2. Add User Story 1 → validate independently → developers can start parallel features (MVP)
3. Add User Story 2 → validate independently → the numbering guarantee is documented and
   specifically re-verified for the cross-worktree case
4. Add User Story 3 → validate independently → developers can also clean up afterward
5. Polish → one coherent doc, linked from the README, final full quickstart run

---

## Notes

- [P] tasks touch different files and have no unfinished dependency
- [Story] label maps each task to its user story for traceability
- No automated tests are generated for this feature (see the "Tests" note at the top); manual
  `quickstart.md` scenarios are referenced directly from the tasks that need them
- Commit after each task or logical group, on branch `002-git-worktree-setup`
- Stop at any checkpoint to validate a story independently before moving to the next
