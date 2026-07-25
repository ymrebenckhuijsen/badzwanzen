# CLI Contract: worktree scripts

These two scripts are the interface this feature exposes to the project's developers. Both
live in `.specify/scripts/bash/`, alongside the existing Spec Kit scripts, and source
`common.sh` the same way `create-new-feature.sh` does.

## `worktree-add.sh`

**Usage**:

```bash
.specify/scripts/bash/worktree-add.sh [--short-name <name>] "<feature description>"
```

**Behavior**:

1. Fetches `origin` and resolves the next feature number using the fixed cross-branch numbering
   logic (see `research.md` → "Root cause of the numbering collision"), reusing
   `create-new-feature.sh`'s branch-name generation for `<name>`.
2. Creates a new worktree at `../<repo-name>-worktrees/<NNN-name>/`, on a new branch
   `<NNN-name>` branched from `origin/main`.
3. Prints, on success: the worktree path, the branch name, and the next steps (`cd` into the
   path, run `npm install`, then run `/speckit-specify` from there).

**Exit codes**:

- `0`: worktree and branch created successfully.
- non-zero: any failure — accompanied by a specific message on stderr that names the exact
  cause and the relevant path/branch, never a generic "something went wrong". Concretely:
  - target worktree path already exists → message includes that path
  - branch name already checked out elsewhere → message includes the branch name **and** the
    path of the worktree that already has it checked out (from `git worktree list`)
  - `origin` unreachable → message includes the remote name and the underlying git error
  Never partially creates a worktree without reporting it.

## `worktree-remove.sh`

**Usage**:

```bash
.specify/scripts/bash/worktree-remove.sh <branch-name> [--force]
```

**Behavior**:

1. Locates the worktree associated with `<branch-name>` (via `git worktree list`).
2. If the worktree has uncommitted changes and `--force` was not passed: aborts with a
   non-zero exit code and a message listing the uncommitted changes, doing nothing further.
3. Otherwise: runs `git worktree remove` for that path, and if the branch is fully merged into
   `main`, also deletes the local branch (`git branch -d`) and reports that it did so.
4. Prints `git worktree list` afterward so the developer can confirm the result.

**Exit codes**:

- `0`: worktree removed (branch deletion is reported but its own failure — e.g. not yet
  merged — does not fail the whole command; it's reported and left in place).
- non-zero: worktree not found for `<branch-name>` (message names the branch and shows the
  current `git worktree list` output), or uncommitted changes blocked removal without
  `--force` (message lists the specific changed files, from `git status --porcelain` in that
  worktree).
