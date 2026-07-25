# Implementation Plan: Git worktrees voor parallelle feature-ontwikkeling

**Branch**: `002-git-worktree-setup` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-git-worktree-setup/spec.md`

## Summary

Add two small bash scripts (`worktree-add.sh`, `worktree-remove.sh`) alongside the existing
Spec Kit scripts, so a developer can spin up a fully independent git worktree (own branch, own
checkout, own `node_modules`) for a new feature without disturbing whatever is checked out
elsewhere — and fix the feature-numbering logic in `create-new-feature.sh` so two features
started in parallel worktrees never collide on the same number (the exact bug this session hit
with `001-add-players` vs. `001-git-worktree-setup`). Document the whole workflow so both
developers can follow it without re-deriving it.

## Technical Context

**Language/Version**: Bash, matching the existing `.specify/scripts/bash/*.sh` scripts
(macOS `bash` 3.2-compatible, same constraint those scripts already observe)

**Primary Dependencies**: git (`git worktree`, `git for-each-ref`), the project's existing
`.specify/scripts/bash/common.sh` helpers

**Storage**: N/A — no application data; only git refs and the filesystem

**Testing**: Manual verification via `quickstart.md` scenarios, run red → green against real
git state (see [research.md](./research.md) → "Testing approach"); not Vitest/RTL, which is
this project's stack for application code, not standalone shell scripts

**Target Platform**: Developer machines (the two contributors' laptops)

**Project Type**: Internal developer tooling / CLI scripts (not the web app itself)

**Performance Goals**: N/A — human-timescale, occasional operations, not a runtime concern

**Constraints**: Must not change the behavior of the existing single-worktree workflow (running
`/speckit-specify` directly in the main worktree must keep working exactly as before); zero
new paid tooling or services. Full verification of FR-002/SC-004 (installing dependencies,
running the dev server and test suite *inside* a new worktree) depends on feature
`001-add-players`'s app scaffold (`package.json`, `npm run dev`, `npm test`) existing —
that feature is still an open, unmerged PR at the time this plan is written. Until it's
merged, this feature's own verification is scoped to the git-level mechanics (worktree/branch
creation, isolation, numbering, removal); the `npm install`/`npm run dev`/`npm test` steps in
`quickstart.md` are marked as deferred until 001 lands (see `quickstart.md` and `tasks.md`).

**Scale/Scope**: Two developers, occasional parallel features — not a high-concurrency concern

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Spec-Driven Development | Plan derives directly from the approved `spec.md` | PASS |
| II. Test-First (TDD) | Vitest/RTL stack targets application code; for these bash scripts, verification is the manual red→green `quickstart.md` walkthrough instead (see research.md) | PASS (explicit non-application-tooling exemption per Constitution v1.1.0 §II) |
| III. Simplicity & YAGNI | Plain bash scripts + one numbering fix + one doc; no new framework, no bats/shell-test runner, no automatic hook system | PASS |
| IV. Zero-Cost, Client-Side Architecture | Doesn't touch the app's runtime architecture at all; no new services of any kind | PASS / N/A |
| V. Quality Gates (CI + Review) | Developed on its own branch (`002-git-worktree-setup`) with a PR; doesn't itself modify CI config | PASS |

One entry logged in Complexity Tracking (Principle II's non-application-tooling exemption).
This exemption is explicitly authorized by Constitution v1.1.0's Governance section (amended
after `/speckit-analyze` flagged that the constitution previously only named Principle III/IV
for this mechanism) — it is a sanctioned exception, not an unresolved deviation.

## Project Structure

### Documentation (this feature)

```text
specs/002-git-worktree-setup/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── cli.md           # Phase 1 output — CLI contract for the two scripts
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `data-model.md`: this feature introduces no data entities (see research.md) — it only adds
scripts and a numbering fix operating on git refs and the filesystem.

### Source Code (repository root)

```text
.specify/
└── scripts/
    └── bash/
        ├── common.sh                  # existing — gains a branch-scanning helper
        ├── create-new-feature.sh      # existing — numbering fix (scan branches, not just specs/)
        ├── worktree-add.sh            # new
        └── worktree-remove.sh         # new

docs/
└── worktrees.md                       # new — the documented procedure required by FR-001/004/005
```

**Structure Decision**: This feature lives entirely under `.specify/scripts/bash/` (extending
the existing scripts) plus one new `docs/worktrees.md`. It does not touch `src/` at all —
consistent with it being developer tooling, not application functionality (Constitution
Principle IV scopes the client-side architecture to the app itself, not to the project's own
dev tooling).

## Complexity Tracking

| Exemption | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Principle II's non-application-tooling exemption (Constitution v1.1.0 §II) applied: manual `quickstart.md` verification used instead of automated Vitest/RTL tests | The feature is two bash scripts + a numbering fix, not application code; the project's TDD stack (Vitest/RTL) has no natural target here — exactly the case the constitution's exemption was written for | Introducing a shell-testing framework (e.g. bats) to unit-test ~100 lines of bash, used by two people, is tooling overhead disproportionate to the problem (violates Principle III/YAGNI in the other direction) |
