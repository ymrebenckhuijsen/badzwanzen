# Contract: Stitch MCP tool usage

Which `mcp__stitch__*` tools `speckit-design` calls, in what order, and the fallback contract
required by FR-009. Tool schemas confirmed live during planning (2026-07-25) via `ToolSearch` +
prior confirmed calls against the existing "Party Quest" project.

## Normal flow (Stitch reachable)

| Step | Tool | Purpose |
|---|---|---|
| 1 | `list_design_systems(projectId=2820714669126137113)` or `get_project` | Read current shared design system tokens; also needed as the `designSystem` arg for step 2 |
| 2a (new screen) | `generate_screen_from_text(projectId, prompt, designSystem)` | Create a new screen for the feature, consistent with the shared design system |
| 2b (edit existing) | `edit_screens(projectId, selectedScreenIds, prompt)` | Instead of 2a, when the feature only adds/changes something on an already-approved screen |
| 3 | `get_screen(name)` | Retrieve the resulting screen for the developer to review |
| 4 | *(repeat 2b + 3)* | On each developer change request, until approved |

Per `generate_screen_from_text`'s own tool description: on timeout, do not retry — poll
`get_screen` every ~30s, up to 10 times, before giving up and following the FR-009 fallback
below. `edit_screens` follows the same "connection error doesn't mean failure" caution — verify
with `get_screen`/`list_screens` before assuming a call failed.

## FR-009 fallback (Stitch unreachable or persistently failing)

1. Attempt the call. On a genuine failure (not the timeout/connection-error cases above, which
   get the poll/verify treatment first), inform the developer concretely: which tool failed and
   the error.
2. Offer an explicit choice — this is a real decision point, not an automatic fallback:
   - **Retry**: re-attempt the same step.
   - **Manual**: the developer supplies `DESIGN.md` addendum content themselves (colors,
     typography, component notes, in prose); `speckit-design` writes it verbatim to the feature
     addendum and sets `Status: Approved` once the developer confirms it's final. The root
     `DESIGN.md` is left untouched in this path (no Stitch tokens to mirror).
3. Never leave the workflow silently stuck: one of "retry succeeded", "manual content
   captured and approved", or "developer explicitly deferred" must be true before
   `speckit-design` returns control.

## Known operational caveat (carried over from a prior session)

`claude mcp list` may show the `stitch` server as "tools fetch failed" even when the
`mcp__stitch__*` tools work correctly when actually called. `speckit-design` MUST NOT treat that
banner as evidence of failure — it verifies reachability by attempting a real call (e.g.
`list_design_systems`) and judging success/failure from that call's own result, not from
`claude mcp list` output.
