---

description: "Task list for Deployment naar Vercel"
---

# Tasks: Deployment naar Vercel

**Input**: Design documents from `/specs/005-deployment/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No Vitest/RTL test tasks — per `plan.md` Constitution Check, this feature is
deployment configuration with no application behavior to unit-test. `quickstart.md` is the
verification procedure and is executed as tasks T016–T018 below (per the Principle II
tooling exemption logged in `plan.md`'s Complexity Tracking).

**Organization**: Tasks are grouped by user story to enable independent verification of each
story, per `spec.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- **[Manual]**: Requires a human (you) to act — account login, OAuth consent, or clicking in
  the Vercel/GitHub UI. These cannot be completed autonomously; they are executed together,
  guided step-by-step (browser-assisted).

## Path Conventions

Single project, repo root — matches `plan.md`'s Project Structure (`vercel.json` +
`README.md` at repo root; no `src/`/`tests/` changes).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repo-side configuration needed before any Vercel account/project work

- [ ] T001 [P] Create `vercel.json` at repo root with `"buildCommand": "npm run build"`,
      `"outputDirectory": "dist"`, `"framework": "vite"` (per `research.md` decision on
      reproducible build configuration, satisfies FR-009)
- [ ] T002 [P] Run `npm run build` locally and confirm `dist/` is produced without errors —
      pre-flight check that the command `vercel.json` points to actually works

**Checkpoint**: Repo has a committed, correct deployment config ready to be picked up when
the project is imported into Vercel.

---

## Phase 2: User Story 2 - Vercel-account en project opzetten en koppelen aan GitHub (Priority: P1)

**Goal**: A Vercel account exists, linked via GitHub, with a project connected to the
`badzwanzen` repository and `main` set as the production branch.

**Independent Test**: Log into the Vercel dashboard, confirm the `badzwanzen` project is
listed, linked to the correct GitHub repository, and has one successful deployment.

- [ ] T003 [US2] [Manual] Create a Vercel account at https://vercel.com/signup using
      "Continue with GitHub"
- [ ] T004 [US2] [Manual] Authorize the Vercel GitHub App with access to the `badzwanzen`
      repository (depends on T003)
- [ ] T005 [US2] [Manual] Import the `badzwanzen` repository as a new Vercel project via
      "Add New" → "Project" (depends on T004)
- [ ] T006 [US2] [Manual] Confirm the Vercel-detected build settings match `vercel.json`
      (Build Command `npm run build`, Output Directory `dist`) under Project Settings →
      Build & Development Settings (depends on T005, T001)
- [ ] T007 [US2] [Manual] Confirm Production Branch is set to `main` under Project Settings →
      Git (depends on T005)
- [ ] T008 [US2] [Manual] Trigger and verify the first production deployment succeeds
      (depends on T006, T007)

**Checkpoint**: Vercel project exists and is linked; first deployment is live. User Story 1
and User Story 3 both depend on this checkpoint.

---

## Phase 3: User Story 1 - Automatische productie-deployment bij merge naar main (Priority: P1) 🎯 MVP

**Goal**: Every push/merge to `main` automatically produces a new production deployment; a
failed build never replaces the live site.

**Independent Test**: Push a change to `main` and confirm the live URL updates within
minutes; separately, push a deliberately broken build and confirm production is unaffected.

- [ ] T009 [US1] Push a small test commit to `main` (or merge a test PR) and verify Vercel
      starts a new production build automatically (depends on T008)
- [ ] T010 [US1] Verify the production URL reflects the pushed change within ~5 minutes
      (SC-001) (depends on T009)
- [ ] T011 [US1] Verify GitHub shows a Vercel deployment status/check on the commit (FR-007,
      SC-002) (depends on T009)
- [ ] T012 [US1] On a throwaway branch, introduce a deliberate build-breaking change (e.g. a
      TypeScript type error), push it, and verify the previous production deployment stays
      live and the broken build is never published (FR-005, SC-003); then discard the
      change without merging (depends on T008)
- [ ] T013 [P] [US1] Add a "Deployment" section to `README.md` documenting the live URL and
      how automatic deployment from `main` works (depends on T008)

**Checkpoint**: User Story 1 fully verified — this is the MVP of the feature.

---

## Phase 4: User Story 3 - Preview-deployment per pull request (Priority: P2)

**Goal**: Every pull request gets its own preview deployment with a stable, unique URL.

**Independent Test**: Open a PR and confirm a preview URL appears as a GitHub check; push a
follow-up commit and confirm the same URL updates.

- [ ] T014 [US3] Open a test pull request against `main` and verify Vercel posts a unique
      preview URL as a PR check/comment (depends on T008)
- [ ] T015 [US3] Push an additional commit to that same PR and verify the same preview URL
      updates with the new changes (depends on T014)

**Checkpoint**: All three user stories independently verified.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T016 Run the full `specs/005-deployment/quickstart.md` walkthrough end-to-end as a
      final sanity check (depends on T001-T015)
- [ ] T017 [P] Review `README.md` deployment section for accuracy against what was actually
      configured (depends on T013)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **User Story 2 (Phase 2)**: Depends on Setup (needs `vercel.json` to exist so Vercel picks
  it up during import) — BLOCKS User Story 1 and User Story 3
- **User Story 1 (Phase 3)**: Depends on User Story 2's checkpoint (T008)
- **User Story 3 (Phase 4)**: Depends on User Story 2's checkpoint (T008); independent of
  User Story 1
- **Polish (Phase 5)**: Depends on all desired user stories being complete

### Notes on story independence

Unlike a typical feature, User Story 2 here is a genuine prerequisite for User Story 1 and
User Story 3 (there is nothing to auto-deploy or preview without an account/project first) —
this dependency is explicit in `spec.md`'s own acceptance scenarios ("Given de
Vercel-koppeling... correct ingesteld"). User Story 1 and User Story 3 are independent of
each other and can be verified in either order once User Story 2 is done.

### Parallel Opportunities

- T001 and T002 (Setup) can run in parallel
- T013 (README doc) can run in parallel with T009–T012 once T008 is done
- T017 (Polish) can run in parallel with T016

---

## Implementation Strategy

### MVP First (User Story 2 + User Story 1 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: User Story 2 (account + project link)
3. Complete Phase 3: User Story 1 (automatic production deploys)
4. **STOP and VALIDATE**: production auto-deploy works end-to-end — this alone satisfies the
   feature's core value
5. User Story 3 (preview deployments) can follow as a fast-follow increment

### Incremental Delivery

1. Setup → Phase 1 done
2. User Story 2 → Vercel project exists and deploys once
3. User Story 1 → auto-deploy-from-`main` verified (MVP!)
4. User Story 3 → PR previews verified
5. Polish → quickstart.md run end-to-end, docs reviewed

---

## Notes

- Tasks marked `[Manual]` require you personally to authenticate/consent (GitHub OAuth,
  Vercel dashboard clicks) — these will be done together, guided step-by-step rather than run
  autonomously.
- `[P]` tasks touch different files/surfaces and have no dependency on an incomplete task.
- Commit `vercel.json` and the `README.md` update as regular commits on this feature branch;
  everything else (T003–T015) is verification against the live Vercel/GitHub state, not new
  commits.
- This feature has no `tests/` changes — see `plan.md` Constitution Check for why, and
  `quickstart.md` for the substitute verification procedure run in T016.
