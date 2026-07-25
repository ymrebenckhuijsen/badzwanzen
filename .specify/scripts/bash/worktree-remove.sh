#!/usr/bin/env bash
# Remove a feature's git worktree (and its branch, if merged) after it's done.
# See specs/002-git-worktree-setup/contracts/cli.md for the full contract.

set -e

FORCE=false
BRANCH_NAME=""

while [ $# -gt 0 ]; do
    case "$1" in
        --force)
            FORCE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 <branch-name> [--force]"
            exit 0
            ;;
        *)
            if [ -n "$BRANCH_NAME" ]; then
                echo "Error: unexpected extra argument '$1'" >&2
                exit 1
            fi
            BRANCH_NAME="$1"
            shift
            ;;
    esac
done

if [ -z "$BRANCH_NAME" ]; then
    echo "Usage: $0 <branch-name> [--force]" >&2
    exit 1
fi

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

REPO_ROOT=$(get_repo_root) || exit 1
cd "$REPO_ROOT"

# Locate the worktree path for this branch (git worktree list --porcelain is
# stable/parseable, unlike the human-readable default format).
WORKTREE_PATH=$(git worktree list --porcelain \
    | awk -v b="refs/heads/$BRANCH_NAME" '
        /^worktree /{wt=$2}
        $0=="branch "b{print wt}
    ')

if [ -z "$WORKTREE_PATH" ]; then
    echo "Error: no worktree found for branch '$BRANCH_NAME'" >&2
    echo "" >&2
    echo "Current worktrees:" >&2
    git worktree list >&2
    exit 1
fi

# Refuse to discard uncommitted work unless --force was passed.
DIRTY_STATUS=$(git -C "$WORKTREE_PATH" status --porcelain)
if [ -n "$DIRTY_STATUS" ] && [ "$FORCE" != true ]; then
    echo "Error: worktree '$WORKTREE_PATH' has uncommitted changes:" >&2
    echo "$DIRTY_STATUS" >&2
    echo "" >&2
    echo "Re-run with --force to remove it anyway (uncommitted changes will be lost)." >&2
    exit 1
fi

if [ "$FORCE" = true ]; then
    git worktree remove --force "$WORKTREE_PATH"
else
    git worktree remove "$WORKTREE_PATH"
fi
echo "Removed worktree: $WORKTREE_PATH"

# Only delete the branch if it's fully merged into main — never force-delete.
if git merge-base --is-ancestor "$BRANCH_NAME" main 2>/dev/null; then
    if git branch -d "$BRANCH_NAME" 2>/dev/null; then
        echo "Deleted branch: $BRANCH_NAME (was merged into main)"
    else
        echo "Note: branch '$BRANCH_NAME' looked merged but could not be deleted; left in place"
    fi
else
    echo "Note: branch '$BRANCH_NAME' is not yet merged into main; left in place"
fi

echo ""
echo "Current worktrees:"
git worktree list
