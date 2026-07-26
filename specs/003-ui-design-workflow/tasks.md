---

description: "Task list for the UI design workflow feature (Google Stitch)"
---

# Tasks: UI-design-stap in de spec-driven workflow (Google Stitch)

**Input**: Design documents from `/specs/003-ui-design-workflow/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: This feature has no automated test suite (see `research.md` → "Testing approach for
this feature", the Constitution's non-application-tooling exemption): verification happens via
the manual `quickstart.md` scenarios, referenced directly from the tasks below instead of
separate contract/integration test tasks.

**Organization**: Tasks are grouped by user story so each can be implemented and verified
independently. Most of this feature's logic lives in one new skill file
(`.claude/skills/speckit-design/SKILL.md`); tasks against that file are additive sections, in
dependency order, not separate files — so most are **not** `[P]`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths are exact and relative to the repository root

## Phase 1: Setup

**Purpose**: Scaffolding shared by every later phase

- [X] T001 Create `.claude/skills/speckit-design/SKILL.md` with the standard skill scaffold:
      frontmatter (`name: "speckit-design"`, description, `argument-hint`, `compatibility`,
      `metadata`, `user-invocable: true`), a `## User Input` block, and the `## Pre-Execution
      Checks` section — matching the format every sibling `speckit-*` skill already uses
- [X] T002 [P] Create `.specify/scripts/bash/setup-design.sh`, mirroring
      `.specify/scripts/bash/setup-plan.sh`: outputs JSON with `FEATURE_DIR`, `BRANCH`,
      `ROOT_DESIGN_PATH` (`<repo-root>/DESIGN.md`), `ADDENDUM_PATH`
      (`<FEATURE_DIR>/DESIGN.md`), and `ADDENDUM_STATUS` (the parsed `Status:` frontmatter
      value from `ADDENDUM_PATH` if it exists, else empty)
- [X] T003 [P] Create `.specify/extensions.yml` registering `hooks.before_plan` and
      `hooks.before_tasks` entries for `command: speckit.design` (`optional: false`, no
      `condition`), exactly per `contracts/hook-registration.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared entry/branch logic every user story depends on, plus making the
existing planning/tasks skills aware that `DESIGN.md` exists to be read

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 In `.claude/skills/speckit-design/SKILL.md`, implement Outline Step 1 "Setup": run
      `setup-design.sh --json`, parse `FEATURE_DIR`/`ROOT_DESIGN_PATH`/`ADDENDUM_PATH`/
      `ADDENDUM_STATUS` (depends on T001, T002)
- [X] T005 In `.claude/skills/speckit-design/SKILL.md`, implement the `Status` short-circuit:
      if `ADDENDUM_STATUS` is `Approved` or `No UI Impact`, report that immediately and return
      without any Stitch calls or prompts (this is what makes FR-006's re-check at
      `before_tasks` and FR-007's no-UI skip both instant, not just the first time) (depends on
      T004)
- [X] T006 [P] In `.claude/skills/speckit-plan/SKILL.md`, add an "IF EXISTS" optional-doc step
      to "Load context" (alongside the existing constitution-loading step): read
      `DESIGN.md` (repo root) and `specs/[feature]/DESIGN.md` (addendum) when present, and use
      their tokens/component style as the styling basis instead of inventing new ones —
      required for US1 acceptance scenario 2 ("plan references DESIGN.md instead of making up
      new styling")
- [X] T007 [P] In `.claude/skills/speckit-tasks/SKILL.md`, add the same "IF EXISTS" optional-doc
      step to "Load design documents" (alongside `data-model.md`/`contracts/`): read
      `DESIGN.md` (repo root) and the feature's addendum when present, so generated tasks can
      reference concrete design tokens/screens

**Checkpoint**: `speckit-design` has a working entry point and short-circuit; `speckit-plan`
and `speckit-tasks` both know to read `DESIGN.md` when it exists. User story work can begin.

---

## Phase 3: User Story 1 - Ontwerp vastleggen vóór implementatie (Priority: P1) 🎯 MVP

**Goal**: For a UI-affecting feature, a Stitch-generated design is automatically produced and
recorded in `DESIGN.md` (root + addendum) before any implementation code is written.

**Independent Test**: Run `/speckit-specify` for a new, clearly UI-affecting feature; verify
that before `/speckit-plan` has to invent anything about styling, a `DESIGN.md` addendum exists
in the feature directory with concrete colors, typography, and component style.

### Implementation for User Story 1

- [X] T008 [US1] In `.claude/skills/speckit-design/SKILL.md`, implement the "confirm UI impact"
      step: when no addendum exists yet (from T005's check), ask the developer whether this
      feature has UI impact; on "no", write a minimal addendum with `Status: No UI Impact` per
      `contracts/design-addendum-format.md` and return immediately (depends on T005)
- [X] T009 [US1] In `.claude/skills/speckit-design/SKILL.md`, implement the Stitch reachability
      check and root `DESIGN.md` token sync: call `mcp__stitch__list_design_systems` (or
      `get_project`) against project `2820714669126137113`, and create-or-update
      `ROOT_DESIGN_PATH` per `contracts/design-addendum-format.md` — only writing if the tokens
      actually differ from what's already there (depends on T008; implements
      `contracts/stitch-mcp-usage.md` step 1)
- [X] T010 [US1] In `.claude/skills/speckit-design/SKILL.md`, implement screen generation: call
      `mcp__stitch__generate_screen_from_text` for a new screen, or
      `mcp__stitch__edit_screens` when the feature only adds to an existing, already-approved
      screen (the "one small addition" edge case from spec.md), passing the design system asset
      from T009; then `mcp__stitch__get_screen` to fetch the result (depends on T009; implements
      `contracts/stitch-mcp-usage.md` steps 2-3)
- [X] T011 [US1] In `.claude/skills/speckit-design/SKILL.md`, implement feature-addendum
      creation: write `ADDENDUM_PATH` with `Status: Draft`, the Stitch screen reference(s), a
      link to the Stitch project for visual review, and a "What this feature adds/changes"
      section, per `contracts/design-addendum-format.md` (depends on T010)
- [X] T012 [US1] In `.claude/skills/speckit-design/SKILL.md`, implement the FR-009 fallback:
      on a genuine Stitch failure (not the timeout/connection-error cases, which get polled/
      verified first per `contracts/stitch-mcp-usage.md`), tell the developer which call failed
      and why, then offer an explicit retry-or-manual choice; on "manual", accept
      developer-supplied `DESIGN.md` content verbatim into the addendum and set
      `Status: Approved` (depends on T009, T010)
- [X] T013 [US1] Bootstrap the real repository-root `DESIGN.md` by running the T009 token-sync
      logic once against the existing "Party Quest" Stitch design system, producing the actual
      `DESIGN.md` file at the repo root — this feature's own required seed file, since none
      exists in the repo yet (per `research.md` → "Root DESIGN.md bootstrap") (depends on T009;
      file: `DESIGN.md`)

**Checkpoint**: User Story 1 is fully functional and independently testable per
`quickstart.md` → "Green, part 1".

---

## Phase 4: User Story 2 - Interactief ontwerp beoordelen en aanpassen (Priority: P1)

**Goal**: The developer can review the proposed design, request changes, and `/speckit-tasks`/
`/speckit-implement` are blocked until they explicitly approve.

**Independent Test**: Generate a design for a feature, request a concrete change, and confirm
the design and `DESIGN.md` update based on that feedback before anything is approved; then
confirm `/speckit-tasks` refuses to proceed until approval is given.

### Implementation for User Story 2

- [X] T014 [US2] In `.claude/skills/speckit-design/SKILL.md`, implement the change-request loop:
      after presenting the Stitch project link/description (from T010/T011), ask the developer
      whether they want changes or want to approve; on a change request, call
      `mcp__stitch__edit_screens` with their feedback as `prompt` against the existing screen
      IDs, append to the addendum's "Review history", set `Status: Changes Requested`, and loop
      back to review — never exiting to the caller on its own (depends on T011)
- [X] T015 [US2] In `.claude/skills/speckit-design/SKILL.md`, implement the approval step: on
      explicit developer approval, set `Status: Approved`, append to "Review history", and only
      then return control to whichever skill invoked the hook (depends on T014)
- [X] T016 [US2] Verify end-to-end that the `before_tasks` hook (T003) re-invokes
      `speckit-design`, which — via T005's short-circuit and T014/T015's loop — actually blocks
      `tasks.md` generation until `Status` is `Approved`; this is a verification pass against
      `.specify/extensions.yml` plus `speckit-tasks/SKILL.md`'s existing mandatory-hook-waiting
      behavior (T007), not new code (depends on T003, T005, T007, T015)

**Checkpoint**: User Stories 1 and 2 both functional per `quickstart.md` → "Green, part 2".

---

## Phase 5: User Story 3 - Niet-UI features slaan de designstap over (Priority: P2)

**Goal**: A feature with no UI impact isn't forced through the design step.

**Independent Test**: Run `/speckit-specify` for a feature explicitly without UI; verify the
workflow proceeds to `/speckit-plan` without a `DESIGN.md` being demanded or a Stitch design
being generated.

### Implementation for User Story 3

- [X] T017 [US3] Verify per `quickstart.md` → "Green, part 3" that the `No UI Impact` path
      (T008) combined with the `Status` short-circuit (T005) means a later `before_tasks`
      firing returns immediately without re-asking the UI-impact question; this phase adds no
      new logic beyond T005/T008 by design (the same short-circuit handles both the approved
      and no-UI-impact cases identically) — fix any gap found during verification (depends on
      T005, T008)

**Checkpoint**: All three P1/P2 user stories independently functional.

---

## Phase 6: User Story 4 - Consistente visuele stijl over features heen (Priority: P3)

**Goal**: Successive UI-affecting features reuse the same underlying design system rather than
each drifting into its own style.

**Independent Test**: Run the design step for two different UI-affecting features in sequence;
confirm both `DESIGN.md` addenda reference the same underlying design system (same base
colors/typography).

### Implementation for User Story 4

- [X] T018 [US4] In `.claude/skills/speckit-design/SKILL.md`, add an explicit consistency
      cross-check: before generating (T010), read the root `DESIGN.md`'s `stitch_design_system`
      frontmatter value (written by T013) and reuse that exact asset id as the `designSystem`
      argument, rather than re-fetching a possibly different default from Stitch — guarantees
      SC-003 (no conflicting base tokens between features) instead of merely hoping repeated
      lookups stay stable (depends on T009, T010, T013)

**Checkpoint**: All four user stories independently functional per `quickstart.md` → "Green,
part 4".

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Full end-to-end validation and final consistency pass before opening the PR

- [ ] T019 [P] Run `quickstart.md` top-to-bottom (all four "Green" parts plus the FR-009
      fallback path) against a throwaway scratch feature branch; fix any discrepancy found,
      per `research.md` → "Testing approach for this feature"
- [X] T020 [P] Update root `DESIGN.md`'s "Screens by Feature" index (per
      `contracts/design-addendum-format.md`) to include `003-ui-design-workflow`'s own entry,
      once T013 has produced the file (depends on T013)
- [X] T021 Review `.claude/skills/speckit-design/SKILL.md` end-to-end for formatting
      consistency with sibling `speckit-*` skills (section headers, hook block wording) before
      opening the PR
- [X] T022 [P] Added during live dogfooding against feature 001 (developer request, not in the
      original plan): generate a Tailwind v4 `@theme` mirror of the root `DESIGN.md` tokens at
      `design/tailwind-theme.css`, documented in `contracts/design-addendum-format.md` and
      wired into `speckit-design/SKILL.md` step 4 so it regenerates in lockstep with root
      `DESIGN.md` going forward, not just as a one-off. Confirmed against the real app's
      `package.json`/`src/index.css` (via `git show origin/main:...`) that the project is on
      Tailwind v4 with no `tailwind.config.js`, so a CSS `@theme` block — not a JS config
      object — is the correct target format.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all four user stories
- **User Story 1 (Phase 3)**: Depends on Foundational only — this is the MVP
- **User Story 2 (Phase 4)**: Depends on Foundational and on US1 (T011, the addendum, must
  exist before there's anything to review/approve)
- **User Story 3 (Phase 5)**: Depends on Foundational only (T005, T008) — independent of US1's
  Stitch-generation path, though T008 is technically part of the US1 phase above
- **User Story 4 (Phase 6)**: Depends on US1 (T009, T010, T013) — refines US1's generation
  logic for cross-feature consistency
- **Polish (Phase 7)**: Depends on all four user stories being complete

### Within Each User Story

- Within `speckit-design/SKILL.md`, sections build in this order: reachability/sync → generate
  → record as Draft → review/iterate → approve. Each task above states its specific
  file-level dependency.

### Parallel Opportunities

- T002 and T003 (Setup) touch different files and can run in parallel
- T006 and T007 (Foundational) touch different files (`speckit-plan` vs. `speckit-tasks`) and
  can run in parallel with each other, though not with T004/T005 (same target file group,
  `speckit-design/SKILL.md`, is edited sequentially)
- T019 and T020 (Polish) touch different files and can run in parallel

---

## Parallel Example: Foundational, cross-skill edits

```bash
# Once T004-T005 (speckit-design core) are underway, these can run in parallel:
Task: "Add DESIGN.md read step to .claude/skills/speckit-plan/SKILL.md"
Task: "Add DESIGN.md read step to .claude/skills/speckit-tasks/SKILL.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks everything else)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run `quickstart.md` → "Green, part 1" against a scratch feature
5. At this point, UI-affecting features already get a real, Stitch-backed `DESIGN.md` before
   planning — US2-US4 add the review/approval gate and cross-feature consistency on top

### Incremental Delivery

1. Setup + Foundational → `speckit-design` exists and both planning skills read `DESIGN.md`
2. Add User Story 1 → validate independently → designs get generated and recorded (MVP)
3. Add User Story 2 → validate independently → review/approval gate blocks `/speckit-tasks`
4. Add User Story 3 → validate independently → no-UI features stay frictionless
5. Add User Story 4 → validate independently → cross-feature style consistency is guaranteed,
   not just likely
6. Polish → full quickstart run, index update, formatting pass

---

## Notes

- [P] tasks touch different files and have no unfinished dependency
- [Story] label maps each task to its user story for traceability
- No automated tests are generated for this feature (see the "Tests" note at the top); manual
  `quickstart.md` scenarios are referenced directly from the tasks that need them
- Commit after each task or logical group, on branch `003-ui-design-workflow`
- Stop at any checkpoint to validate a story independently before moving to the next
- T013 (bootstrapping the real root `DESIGN.md`) is the one task in this feature that produces
  a durable, non-tooling artifact — treat its output as real project content, not a throwaway
  test fixture
