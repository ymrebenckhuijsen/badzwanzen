#!/usr/bin/env bash
# Create an isolated git worktree + branch for a new feature, so it can be
# developed in parallel with whatever is checked out in other worktrees.
# See specs/002-git-worktree-setup/contracts/cli.md for the full contract.

set -e

SHORT_NAME=""
OPEN_IDE=false
ARGS=()

while [ $# -gt 0 ]; do
    case "$1" in
        --short-name)
            if [ $# -lt 2 ]; then
                echo "Error: --short-name requires a value" >&2
                exit 1
            fi
            SHORT_NAME="$2"
            shift 2
            ;;
        --open-ide)
            OPEN_IDE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--short-name <name>] [--open-ide] \"<feature description>\""
            echo ""
            echo "Fetches origin, computes the next collision-safe feature number/branch"
            echo "name, and creates a new git worktree + branch for it at"
            echo "../<repo-name>-worktrees/<branch-name>/, based on origin/main."
            echo ""
            echo "--open-ide opens the new worktree in a separate IntelliJ IDEA window"
            echo "via the 'idea' CLI launcher, if it's installed. Opt-in and best-effort:"
            echo "silently skipped with a warning if 'idea' isn't on PATH."
            exit 0
            ;;
        --)
            shift
            while [ $# -gt 0 ]; do ARGS+=("$1"); shift; done
            ;;
        *)
            ARGS+=("$1")
            shift
            ;;
    esac
done

FEATURE_DESCRIPTION="${ARGS[*]}"
if [ -z "$FEATURE_DESCRIPTION" ]; then
    echo "Usage: $0 [--short-name <name>] \"<feature description>\"" >&2
    exit 1
fi

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

REPO_ROOT=$(get_repo_root) || exit 1
cd "$REPO_ROOT"

echo "Fetching origin..." >&2
FETCH_OUTPUT=$(git fetch origin 2>&1) || {
    echo "Error: could not fetch from remote 'origin':" >&2
    echo "$FETCH_OUTPUT" >&2
    exit 1
}

# Reuse create-new-feature.sh's branch-name generation (and the fixed,
# cross-branch-safe numbering logic) instead of duplicating it here.
DRY_RUN_ARGS=(--json --dry-run)
[ -n "$SHORT_NAME" ] && DRY_RUN_ARGS+=(--short-name "$SHORT_NAME")
DRY_RUN_ARGS+=("$FEATURE_DESCRIPTION")

DRY_RUN_OUTPUT=$("$SCRIPT_DIR/create-new-feature.sh" "${DRY_RUN_ARGS[@]}") || {
    echo "Error: failed to compute the next feature branch name" >&2
    exit 1
}

extract_json_field() {
    # Minimal single-field extractor for this script's own well-formed,
    # quote-free JSON output — not a general-purpose JSON parser.
    printf '%s' "$1" | grep -o "\"$2\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 \
        | sed -E 's/^"[^"]+"[[:space:]]*:[[:space:]]*"([^"]*)"$/\1/'
}

BRANCH_NAME=$(extract_json_field "$DRY_RUN_OUTPUT" "BRANCH_NAME")
if [ -z "$BRANCH_NAME" ]; then
    echo "Error: could not determine the branch name from create-new-feature.sh's output" >&2
    exit 1
fi

REPO_NAME=$(basename "$REPO_ROOT")
WORKTREES_BASE="$(dirname "$REPO_ROOT")/${REPO_NAME}-worktrees"
WORKTREE_PATH="$WORKTREES_BASE/$BRANCH_NAME"

if [ -e "$WORKTREE_PATH" ]; then
    echo "Error: target worktree path already exists: $WORKTREE_PATH" >&2
    exit 1
fi

mkdir -p "$WORKTREES_BASE"

ADD_OUTPUT=$(git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH" origin/main 2>&1) || {
    echo "Error: could not create worktree for branch '$BRANCH_NAME':" >&2
    echo "$ADD_OUTPUT" >&2
    # If the branch is already checked out somewhere, name that path too —
    # git's own message already contains it, but make it unmissable.
    EXISTING_PATH=$(git worktree list --porcelain 2>/dev/null \
        | awk -v b="refs/heads/$BRANCH_NAME" '
            /^worktree /{wt=$2}
            $0=="branch "b{print wt}
        ')
    if [ -n "$EXISTING_PATH" ]; then
        echo "Branch '$BRANCH_NAME' is already checked out at: $EXISTING_PATH" >&2
    fi
    rmdir "$WORKTREE_PATH" 2>/dev/null || true
    exit 1
}

echo "Created worktree: $WORKTREE_PATH"
echo "Branch: $BRANCH_NAME"

if [ "$OPEN_IDE" = true ]; then
    if command -v idea >/dev/null 2>&1; then
        echo "Opening $WORKTREE_PATH in a new IntelliJ IDEA window..."
        idea "$WORKTREE_PATH" >/dev/null 2>&1 &
        disown
    else
        echo "Warning: --open-ide was passed but 'idea' CLI launcher is not on PATH; skipping." >&2
    fi
fi

echo ""
echo "Next steps:"
echo "  cd $WORKTREE_PATH"
echo "  npm install"
echo "  /speckit-specify \"<describe the feature>\""
