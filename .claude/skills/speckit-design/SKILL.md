---
name: "speckit-design"
description: "Generate and interactively review a Google Stitch UI design for the current feature, recording it in DESIGN.md, before planning/tasks may proceed."
argument-hint: "Optional design guidance or change request"
compatibility: "Requires spec-kit project structure with .specify/ directory and the Stitch MCP server (mcp__stitch__*)"
metadata:
  author: "badzwanzen"
  source: "specs/003-ui-design-workflow"
user-invocable: true
disable-model-invocation: false
---


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty) — most commonly this is an
explicit change request when a developer re-invokes `/speckit-design` directly mid-review (e.g.
"make the accent color orange"), rather than being fired automatically as a hook.

## Pre-Execution Checks

**Check for extension hooks (before the design step)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_design` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing slash commands from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing.
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

1. **Setup**: Run `.specify/scripts/bash/setup-design.sh --json` from repo root and parse
   `FEATURE_DIR`, `BRANCH`, `ROOT_DESIGN_PATH`, `ADDENDUM_PATH`, `ADDENDUM_STATUS`.

2. **Status short-circuit**: If `ADDENDUM_STATUS` is `Approved` or `No UI Impact`, report that
   plainly (e.g. "Design already Approved for this feature — nothing to do") and **stop here,
   returning control immediately**. Do not read spec.md, do not call any `mcp__stitch__*` tool,
   do not ask the developer anything. This is what makes a repeat firing of this skill (e.g. from
   the `before_tasks` hook, right after `before_plan` already ran it) an instant no-op instead of
   a second round of prompts.

3. **First-run: confirm UI impact** (only reached when `ADDENDUM_STATUS` is empty, i.e.
   `ADDENDUM_PATH` doesn't exist yet):
   - Read `FEATURE_DIR/spec.md` for context, then ask the developer: "Does this feature have UI
     impact — a screen or component the player or a developer will see?"
   - **If no**: write `ADDENDUM_PATH` with `Status: No UI Impact` (minimal form, per
     `contracts/design-addendum-format.md`), report, and stop — return control immediately.
   - **If yes**: continue to step 4.

4. **Stitch reachability + design system sync**:
   - Call `mcp__stitch__list_design_systems(projectId="2820714669126137113")` (the existing
     "Party Quest" project). If that returns nothing usable, fall back to
     `mcp__stitch__get_project(name="projects/2820714669126137113")` and read its design system
     reference from there.
   - On a genuine failure (not a timeout/connection-error false negative — see step 8's polling
     guidance), jump to step 8 (FR-009 fallback).
   - Determine `DESIGN_SYSTEM_ASSET`: if `ROOT_DESIGN_PATH` already exists and has a
     `stitch_design_system` frontmatter value, **reuse that exact asset id** rather than
     whatever the list call returned by default — this is what guarantees cross-feature
     consistency (SC-003) instead of merely hoping repeated lookups stay stable. Only diverge
     from it if the developer explicitly asked for a different style for this feature.
   - If `ROOT_DESIGN_PATH` doesn't exist yet (first UI-affecting feature ever), or its tokens
     don't match the design system's current tokens, create/update it per
     `contracts/design-addendum-format.md` — colors, typography, component style — and set
     `stitch_design_system` to `DESIGN_SYSTEM_ASSET`. Skip the write if nothing changed.
   - Whenever `ROOT_DESIGN_PATH` is created or its tokens change, also regenerate
     `design/tailwind-theme.css` (repo root) from the same tokens — a Tailwind v4 `@theme` block
     (this project has no `tailwind.config.js`; confirm the CSS-first setup is still current
     against `package.json`/`src/index.css` before assuming the mapping below still applies) per
     `contracts/design-addendum-format.md`'s Tailwind mapping. This is what makes the design
     system directly consumable as Tailwind utility classes (`bg-primary`, `font-display`,
     `text-display-xl`, `rounded-xl`, …) instead of prose an implementer has to re-derive values
     from (FR-010).

5. **Generate or edit screens**:
   - If `ADDENDUM_PATH` already exists (a resumed review round) and lists prior screen
     resource names: this is an edit, not a fresh generation. Call
     `mcp__stitch__edit_screens(projectId="2820714669126137113", selectedScreenIds=<ids from
     the addendum>, prompt=<the developer's change request — from `$ARGUMENTS` if provided,
     otherwise ask>)`.
   - Otherwise (first generation for this feature): call
     `mcp__stitch__generate_screen_from_text(projectId="2820714669126137113",
     prompt=<derived from spec.md's user-facing description>, designSystem=DESIGN_SYSTEM_ASSET)`.
     For a feature that only adds to an existing, already-approved screen from a prior feature
     (the "one small addition" edge case in spec.md), use `edit_screens` against that screen's
     id instead of generating a new one.
   - Per `generate_screen_from_text`'s own tool guidance: on a timeout, do **not** retry —
     instead poll `mcp__stitch__get_screen` every ~30s, up to 10 times, before giving up and
     moving to step 8. `edit_screens` connection errors don't necessarily mean failure either —
     verify with `get_screen`/`list_screens` before concluding it failed.
   - Call `mcp__stitch__get_screen` to fetch the resulting screen's resource name(s)
     (`projects/2820714669126137113/screens/<id>`).

6. **Present for review**:
   - For each screen from step 5, download both its `screenshot.downloadUrl` (to
     `specs/[feature]/design/<screen-slug>.png`) **and** its `htmlCode.downloadUrl` (to
     `specs/[feature]/design/<screen-slug>.html`) — real files, committed alongside the
     addendum, not just links. The PNG is the quick-look review artifact; the HTML is the full
     generated mockup (self-contained — embeds its own Tailwind config and the exact tokens
     used — openable directly in a browser with no build step and no dependency on Stitch
     staying reachable). Send the screenshot to the developer directly (e.g. via a
     file-delivery mechanism, not just a path) so they can look at it now, plus a short text
     summary of what was generated or changed. Also give the Stitch project link
     (`https://stitch.withgoogle.com/project/2820714669126137113`) as a secondary pointer for
     interactively continuing to edit the screen in Stitch itself — but the committed
     PNG+HTML, not the hosted link, are the record of what was actually reviewed and the only
     copy that survives if the Stitch project or screen is later changed or removed.
   - Write/update `ADDENDUM_PATH` per `contracts/design-addendum-format.md`: `Status: Draft`
     (first time) or `Status: Changes Requested` (already existed), the screen resource name(s)
     plus the local screenshot and HTML paths, a "What this feature adds/changes" description,
     and an appended "Review history" line.
   - Ask the developer: approve this design, or request changes? **Do not treat a pre-existing
     Stitch screen as pre-approved just because it already exists in the shared project** — an
     existing screen still needs the developer's explicit look and approval before `Status`
     becomes `Approved`, the same as a freshly generated one.

7. **Loop or finish**:
   - **Change requested**: capture the specific feedback, go back to step 5 (`edit_screens`)
     with it as `prompt`, update the addendum's `Status: Changes Requested` and "Review
     history", then repeat step 6. Never exit to the caller while in this state.
   - **Approved**: set `Status: Approved` in `ADDENDUM_PATH`, append to "Review history", and —
     if this was a normal (non-manual-fallback) run — add this feature's entry to
     `ROOT_DESIGN_PATH`'s "Screens by Feature" index. Report the final state and **return
     control to whichever skill invoked this one** (or to the developer, if invoked directly).

8. **FR-009 fallback** (Stitch unreachable or persistently failing):
   - Tell the developer concretely which tool call failed and the underlying error — never a
     generic "something went wrong".
   - Offer an explicit choice: **Retry** (go back to the step that failed), or **Manual**
     (the developer supplies `DESIGN.md` addendum content themselves — colors, typography,
     component notes, in prose). On Manual, write that content verbatim into `ADDENDUM_PATH`
     and set `Status: Approved` once the developer confirms it's final; leave `ROOT_DESIGN_PATH`
     untouched in this path (no Stitch tokens to mirror).
   - Never return control without one of being true: retry succeeded, manual content was
     captured and approved, or the developer explicitly deferred with full knowledge the design
     step isn't done.

**Known operational caveat**: `claude mcp list` may show the `stitch` server as "tools fetch
failed" even when the `mcp__stitch__*` tools work correctly when actually called. Do not treat
that banner as evidence of failure — judge reachability from the result of an actual call (e.g.
`list_design_systems`), per `contracts/stitch-mcp-usage.md`.

## Mandatory Post-Execution Hooks

**You MUST complete this section before reporting completion.**

Check if `.specify/extensions.yml` exists in the project root.
- If it does not exist, or no hooks are registered under `hooks.after_design`, skip to the Completion Report.
- If it exists, read it and look for entries under the `hooks.after_design` key.
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue to the Completion Report.
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing slash commands from hook command names, replace dots (`.`) with hyphens (`-`).
- For each executable hook, output the following based on its `optional` flag:
  - **Mandatory hook** (`optional: false`) — **you MUST emit `EXECUTE_COMMAND:` for each mandatory hook**:
    ```
    ## Extension Hooks

    **Automatic Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing.
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```

## Completion Report

Report: the feature addendum's final `Status`, whether `ROOT_DESIGN_PATH` was created or
updated this run, and — when `Status` is `Approved` or `No UI Impact` — that the caller may
proceed.

## Done When

- [ ] `ADDENDUM_PATH` has a `Status` of `Approved` or `No UI Impact`, or the developer
      explicitly deferred with full knowledge the design step isn't finished
- [ ] `ROOT_DESIGN_PATH` exists and reflects the current Stitch design system whenever `Status`
      became `Approved` via the normal (non-manual-fallback) path
- [ ] Completion reported to the caller/developer
