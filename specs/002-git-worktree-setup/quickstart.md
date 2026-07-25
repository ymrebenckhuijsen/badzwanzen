# Quickstart: Git worktrees voor parallelle feature-ontwikkeling

Validates the worktree workflow end-to-end, per the acceptance scenarios in
[spec.md](./spec.md). These manual steps also serve as this feature's "tests" (see
[research.md](./research.md) → "Testing approach") — run them once **before** the fix is
implemented to confirm the failure, and again **after** to confirm it's resolved.

## Prerequisites

- A local clone of the repo with `origin` configured (already the case).
- `git worktree` available (bundled with any reasonably current git).

## Confirm the numbering bug is fixed (US2)

Two distinct scenarios, both of which must resolve correctly — they exercise different git
states, so don't skip one because the other passed.

### Scenario A: a branch exists locally but its `specs/` dir isn't in the current checkout

(This is the `001-add-players` vs. `001-git-worktree-setup` situation this project's own
history actually hit — a branch exists locally, but was never merged, so its `specs/`
directory isn't visible from `main`.)

```bash
git checkout main
git branch | grep -E '^[[:space:]]*[0-9]{3,}-'
.specify/scripts/bash/create-new-feature.sh --json --dry-run --short-name scenario-a "Test numbering A"
```

Expected: the printed feature number is one higher than the highest local branch number found
above, even though `main`'s `specs/` directory doesn't contain that branch's spec directory.

### Scenario B: a branch exists only on `origin`, never fetched into a local branch before

(Simulates a teammate's in-progress feature that this checkout hasn't seen yet.)

```bash
git fetch origin
git branch -a | grep -E 'remotes/origin/[0-9]{3,}-'
.specify/scripts/bash/create-new-feature.sh --json --dry-run --short-name scenario-b "Test numbering B"
```

Expected: the printed feature number is one higher than the highest number found among
`origin/*` branches too, not just local ones. (Before the fix, only the local `specs/`
directory was scanned — either scenario could produce a repeated number.)

## Create a worktree (US1)

```bash
time .specify/scripts/bash/worktree-add.sh --short-name example "Example feature for validation"
```

Expected: a new directory appears at `../badzwanzen-worktrees/<NNN>-example/`, containing a
full checkout on a new branch `<NNN>-example`, branched from `origin/main`. Your original
working directory (and any uncommitted changes in it) is untouched. The `time` output's
"real" value should be well under SC-001's 2-minute budget (this is a local git operation with
no network dependency beyond the earlier `fetch`, so it should take seconds, not minutes).

**Deferred until `001-add-players` is merged** (see `plan.md` → Constraints — this feature's
own scripts don't provide `npm`/dev-server/test functionality, that comes from 001's scaffold):

```bash
cd ../badzwanzen-worktrees/<NNN>-example
npm install
npm run dev   # in one terminal
npm test      # in another
```

Expected, once runnable: both commands work independently of whatever is running in the
original checkout (validates FR-002 and SC-004).

## Confirm isolation (US1, acceptance scenario 2)

In the original checkout, make a commit on its branch. In the new worktree, run `git log` —
the commit should not appear until `git fetch` is run there.

## Attempt a conflicting worktree (Edge case)

Running `worktree-add.sh` twice in a row does **not** reproduce this — it recomputes a free
number on every invocation, so back-to-back runs just get `NNN` and `NNN+1`. The actual error
path only fires in a narrow, genuine race (two invocations computing the same free number at
nearly the same instant) or when something outside the script grabs that exact branch first.
To exercise the underlying git behavior `worktree-add.sh` wraps:

```bash
git worktree add -b demo-conflict ../badzwanzen-worktrees/demo-conflict-1 main
git worktree add -b demo-conflict ../badzwanzen-worktrees/demo-conflict-2 main
```

Expected: the second command fails ("a branch named 'demo-conflict' already exists"), and
`git worktree list --porcelain` still shows `demo-conflict` checked out only at
`demo-conflict-1`, with `demo-conflict-2` never created. `worktree-add.sh`'s own error handling
wraps exactly this failure — printing the branch name and, when `git worktree list` shows the
branch already has a worktree, that path too (FR-006) — rather than surfacing git's raw
message or leaving a broken partial worktree behind. Clean up afterward:

```bash
git worktree remove ../badzwanzen-worktrees/demo-conflict-1 --force
git branch -D demo-conflict
```

## Clean up (US3)

```bash
cd /path/to/badzwanzen   # back in the main worktree
git merge <NNN>-example  # simulate the feature being done
time .specify/scripts/bash/worktree-remove.sh <NNN>-example
git worktree list
```

Expected: the worktree directory is gone, the branch is deleted (since it was merged), and
`git worktree list` no longer shows it. The `time` output's "real" value should be well under
SC-003's 1-minute budget.

## Attempt to remove a dirty worktree (Edge case)

Create another worktree, change a file in it without committing, then run
`worktree-remove.sh` on it without `--force`. Expected: refusal, with a message listing the
uncommitted change; the worktree is left intact. Re-run with `--force` to confirm it then
removes it.

If all of the above behave as described, the feature meets its spec.
