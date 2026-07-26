# Quickstart: UI-design-stap in de spec-driven workflow

Validates the design step end-to-end against the acceptance scenarios in [spec.md](./spec.md).
These manual steps also serve as this feature's "tests" (see [research.md](./research.md) →
"Testing approach for this feature") — run the red scenario **before** `speckit-design` and the
`extensions.yml` hooks exist, and again **after** implementation to confirm green.

## Prerequisites

- `mcp__stitch__*` tools reachable (verify with a real call, e.g.
  `mcp__stitch__list_projects` — do not trust the `claude mcp list` banner, see
  [stitch-mcp-usage.md](./contracts/stitch-mcp-usage.md)).
- A throwaway feature to run the flow against — e.g. run `/speckit-specify` for a small,
  obviously UI-affecting scratch feature (delete the branch/spec afterward), so this doesn't
  leave test artifacts in a real feature's history.

## Red: confirm the gate blocks before implementation exists

```bash
git log --oneline -1 -- .specify/extensions.yml   # expect: no such file yet, or hook not registered
```

With no `before_tasks` hook registered for `speckit-design`, running `/speckit-tasks` on a
UI-affecting scratch feature proceeds unconditionally today — that's the gap this feature
closes. (No output to check here beyond "it doesn't stop you"; this step is about confirming
the *current* absence of a gate, not a script assertion.)

## Green, part 1 — US1: design generated and recorded before planning (FR-001–FR-003)

1. Run `/speckit-specify` for the scratch UI feature.
2. Run `/speckit-plan`. Expected: before plan's own Outline starts, the `before_plan` hook
   fires `/speckit-design`, which asks whether the feature has UI impact, confirms yes, and
   drives the Stitch flow from [stitch-mcp-usage.md](./contracts/stitch-mcp-usage.md).
3. After it returns control to `/speckit-plan`: confirm `specs/[scratch-feature]/DESIGN.md`
   exists with `Status: Draft` or later, and that `/DESIGN.md` (repo root) exists with real
   color/typography tokens — not placeholders.
4. Confirm `/speckit-plan`'s own output references `DESIGN.md` rather than inventing its own
   styling decisions (acceptance scenario 2 of US1).

## Green, part 2 — US2: interactive review loop + tasks gate (FR-004–FR-006)

1. With the addendum still `Draft`, request a concrete change (e.g. a different accent color).
   Expected: `speckit-design` calls `edit_screens`, updates the addendum's "Review history",
   and `Status` becomes `Changes Requested` then stays in the review loop — it does not exit to
   `/speckit-plan`/`/speckit-tasks` on its own.
2. Attempt `/speckit-tasks` directly (skipping explicit approval). Expected: the `before_tasks`
   hook fires `/speckit-design` again, which reads `Status` (not yet `Approved`) and holds —
   `tasks.md` is NOT generated.
3. Approve the design. Expected: addendum `Status` flips to `Approved`.
4. Run `/speckit-tasks` again. Expected: the `before_tasks` hook fires, sees `Status: Approved`,
   returns immediately, and `tasks.md` is generated normally.

## Green, part 3 — US3: non-UI feature skips cleanly (FR-007, SC-004)

1. Run `/speckit-specify` for a second scratch feature with no UI (e.g. a pure internal script).
2. Run `/speckit-plan`. Expected: `speckit-design` fires once, the developer confirms no UI
   impact, `specs/[feature]/DESIGN.md` is written directly with `Status: No UI Impact`, and
   control returns immediately — no Stitch calls, no preview, no wait.
3. Run `/speckit-tasks`. Expected: the `before_tasks` firing of `speckit-design` sees
   `Status: No UI Impact`, returns immediately without re-asking the UI-impact question.

## Green, part 4 — US4: shared design system consistency (FR-008, SC-003)

1. Compare the two `DESIGN.md` addenda produced by two different UI-affecting features (the
   scratch feature above and this feature's own bootstrap run, `003-ui-design-workflow`).
2. Expected: both reference the same root `/DESIGN.md` and the same `stitch_design_system`
   asset id in its frontmatter; no conflicting base colors/typography between them.

## FR-009 fallback path (manual escape hatch)

Simulate unreachable Stitch (e.g. temporarily point the MCP config at a bad endpoint, or just
exercise this by inspection of the skill's fallback logic if simulating real failure isn't
practical). Expected: `speckit-design` reports the specific failed tool/error, offers
retry-or-manual, and on "manual" accepts developer-supplied `DESIGN.md` text and sets
`Status: Approved` without ever touching the Stitch tools again for that run.

## Cleanup

Delete any scratch feature branches/specs created for this walkthrough; do not merge them.
