#!/usr/bin/env bash

set -e

# Parse command line arguments
JSON_MODE=false

for arg in "$@"; do
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --help|-h)
            echo "Usage: $0 [--json]"
            echo "  --json    Output results in JSON format"
            echo "  --help    Show this help message"
            exit 0
            ;;
    esac
done

# Get script directory and load common functions
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get all paths and variables from common functions
_paths_output=$(get_feature_paths) || { echo "ERROR: Failed to resolve feature paths" >&2; exit 1; }
eval "$_paths_output"
unset _paths_output

ROOT_DESIGN_PATH="$REPO_ROOT/DESIGN.md"
ADDENDUM_PATH="$FEATURE_DIR/DESIGN.md"

# Extract the Status: frontmatter value from the addendum, if it exists.
# Frontmatter is the first `---`-delimited block; Status is a plain
# "Status: <value>" line within it (see contracts/design-addendum-format.md).
ADDENDUM_STATUS=""
if [[ -f "$ADDENDUM_PATH" ]]; then
    ADDENDUM_STATUS=$(awk '
        /^---[[:space:]]*$/ { delim++; next }
        delim == 1 && /^Status:[[:space:]]*/ {
            sub(/^Status:[[:space:]]*/, "");
            print;
            exit
        }
        delim >= 2 { exit }
    ' "$ADDENDUM_PATH")
fi

# Output results
if $JSON_MODE; then
    if has_jq; then
        jq -cn \
            --arg feature_dir "$FEATURE_DIR" \
            --arg branch "$CURRENT_BRANCH" \
            --arg root_design_path "$ROOT_DESIGN_PATH" \
            --arg addendum_path "$ADDENDUM_PATH" \
            --arg addendum_status "$ADDENDUM_STATUS" \
            '{FEATURE_DIR:$feature_dir,BRANCH:$branch,ROOT_DESIGN_PATH:$root_design_path,ADDENDUM_PATH:$addendum_path,ADDENDUM_STATUS:$addendum_status}'
    else
        printf '{"FEATURE_DIR":"%s","BRANCH":"%s","ROOT_DESIGN_PATH":"%s","ADDENDUM_PATH":"%s","ADDENDUM_STATUS":"%s"}\n' \
            "$(json_escape "$FEATURE_DIR")" "$(json_escape "$CURRENT_BRANCH")" \
            "$(json_escape "$ROOT_DESIGN_PATH")" "$(json_escape "$ADDENDUM_PATH")" \
            "$(json_escape "$ADDENDUM_STATUS")"
    fi
else
    echo "FEATURE_DIR: $FEATURE_DIR"
    echo "BRANCH: $CURRENT_BRANCH"
    echo "ROOT_DESIGN_PATH: $ROOT_DESIGN_PATH"
    echo "ADDENDUM_PATH: $ADDENDUM_PATH"
    echo "ADDENDUM_STATUS: $ADDENDUM_STATUS"
fi
