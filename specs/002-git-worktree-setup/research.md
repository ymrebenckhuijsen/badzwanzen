# Research: Git worktrees voor parallelle feature-ontwikkeling

## Root cause of the numbering collision (FR-003)

- **Finding**: `.specify/scripts/bash/create-new-feature.sh` picks the next feature number via
  `get_highest_from_specs()`, which only scans directory names under `specs/` **in the
  currently checked-out working tree**. Feature `001-add-players` was created on its own
  branch and never merged into `main`; when a second feature was started from `main`, its
  `specs/` directory didn't contain `001-add-players` yet, so the script handed out `001`
  again. This was reproduced directly in this session (had to pass `--number 2` manually to
  work around it).
- **Decision**: Extend the number-selection logic to also consider feature-numbered
  **branches** — both local (`refs/heads`) and remote-tracking (`refs/remotes/origin`) — not
  just the `specs/` directory of the active checkout. The next number is the max across: (a)
  existing `specs/NNN-*` directories, and (b) existing local/remote branches matching
  `^[0-9]{3,}-`, plus one.
- **Rationale**: Branches are the one piece of shared state that's visible from any worktree
  (via `git fetch`), even before a feature's spec directory has been merged to `main`. Scanning
  branches closes the exact gap that caused the collision.
- **Alternatives considered**:
  - *A shared "next number" file/counter committed to `main`*: rejected — it would itself need
    merging/rebasing across parallel branches, reintroducing the same race it's meant to
    solve.
  - *Timestamp-based numbering instead of sequential*: already supported by
    `create-new-feature.sh --timestamp`, but changes the project's numbering convention for
    every feature (not just parallel ones) and makes `specs/` harder to scan chronologically
    by eye; rejected as a bigger change than the problem requires.

## Worktree location convention

- **Decision**: Worktrees live in a sibling directory next to the main checkout:
  `../<repo-name>-worktrees/<branch-name>/` (e.g.
  `~/Projects/badzwanzen-worktrees/003-example/` next to `~/Projects/badzwanzen/`). `<repo-name>`
  is derived at runtime from the repository's own directory name, not hardcoded.
- **Rationale**: Keeps the main checkout directory clean, avoids any risk of nesting a worktree
  inside the main repo's own tree (git disallows a worktree path inside the main worktree's
  working directory in some configurations and it's confusing in an IDE either way), and
  groups all worktrees in one predictable, easy-to-`rm -rf` place.
- **Alternatives considered**: worktrees directly as siblings of the repo itself (e.g.
  `../003-example/`) — works, but clutters the parent folder (which may contain other
  projects) with per-feature directories; rejected in favor of one grouping folder.

## Script vs. Spec Kit extension hook

- **Decision**: Implement worktree creation/removal as two plain, standalone scripts
  (`.specify/scripts/bash/worktree-add.sh`, `.specify/scripts/bash/worktree-remove.sh`) that a
  developer runs directly, rather than wiring them in as a `.specify/extensions.yml`
  `before_specify`/`after_specify` git hook.
- **Rationale**: The hook mechanism referenced throughout the installed Spec Kit skills exists
  precisely for this kind of thing, but its exact contract (expected output format, how/when
  it's invoked, error handling) isn't documented in this project beyond the skill files'
  references to it. A plain script is transparent, debuggable by reading top-to-bottom, and
  easy for the student on this project to understand and modify — all explicit constitution
  goals (Principles I and III). Two people occasionally starting a parallel feature does not
  need a fully automatic pipeline.
- **Alternatives considered**: A `before_specify` hook via `.specify/extensions.yml` — more
  "magic"/automatic (worktree creation would happen transparently as part of running
  `/speckit-specify`), but higher risk of subtle breakage without documented hook semantics to
  verify against, and harder for a beginning student to follow. Can be revisited later if the
  manual step (running `worktree-add.sh` once before `/speckit-specify`) proves annoying in
  practice.

## Non-git files per worktree (FR-005)

- **Finding**: `git worktree` only checks out tracked files; anything git-ignored (crucially
  `node_modules/`, and any local `.env`-style file if one is ever introduced) is **not**
  shared between worktrees and must be (re)installed per worktree.
- **Decision**: Document this explicitly as a required step after creating a worktree
  (`npm install` inside the new worktree before running the dev server or tests), rather than
  trying to share/symlink `node_modules` between worktrees.
- **Rationale**: Symlinking `node_modules` across worktrees is a known source of subtle
  version-mismatch bugs (npm assumes it owns that directory) and saves disk space that isn't a
  real constraint here (a hobby project's `node_modules` is a few hundred MB at most).
  Reinstalling is slower per worktree but simple and reliable (YAGNI/simplicity over an
  optimization nobody asked for).
- **Alternatives considered**: A shared `node_modules` via a package-manager workspace/pnpm
  store — real benefit at scale, but new tooling (pnpm) with no current need; rejected.

## Testing approach for this feature (Constitution Principle II)

- **Finding**: Constitution Principle II fixes Vitest + React Testing Library as the TDD
  stack — that targets application code (components, hooks), not standalone bash scripts.
  There is no bash-testing framework already in this project, and introducing one (e.g. bats)
  purely to unit-test two small scripts would be disproportionate tooling for a two-person
  hobby project.
- **Decision**: Verify this feature via the manual scenario checklist in `quickstart.md`,
  run against real git state (create two branches, observe numbering, create/remove
  worktrees) both before the fix (to confirm the failure/gap) and after (to confirm it's
  resolved) — i.e., the same red → green discipline TDD asks for, just executed manually
  instead of via an automated test runner. This is logged as an explicit, justified deviation
  from the letter of Principle II in `plan.md`'s Complexity Tracking.
- **Alternatives considered**: Writing Vitest tests that shell out to the scripts — technically
  possible, but Vitest exists in this project for the web app's runtime code, not as a generic
  process-testing harness; rejected as accidental complexity for this feature's scope.

## Outcome

All aspects of the Technical Context are resolved above. No remaining
`NEEDS CLARIFICATION` markers.
