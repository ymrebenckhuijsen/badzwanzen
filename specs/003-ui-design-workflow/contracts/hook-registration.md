# Contract: `extensions.yml` hook registration

This is the interface between the new `speckit-design` skill and the existing, unmodified
`speckit-plan` / `speckit-tasks` skills. Both skills already implement this contract on their
side (see their "Pre-Execution Checks" / "Mandatory Post-Execution Hooks" sections) — this
feature only needs to add the registration below to `.specify/extensions.yml` (new file; none
exists in the repo yet).

```yaml
hooks:
  before_plan:
    - extension: ui-design-workflow
      command: speckit.design
      optional: false
      description: >
        Generates/reviews the Stitch UI design and DESIGN.md for this feature before planning.
      prompt: Run the UI design step for the current feature before continuing to plan.

  before_tasks:
    - extension: ui-design-workflow
      command: speckit.design
      optional: false
      description: >
        Confirms the feature's DESIGN.md addendum is Approved (or marked No UI Impact) before
        task generation is allowed to proceed.
      prompt: Confirm the UI design for the current feature is approved before generating tasks.
```

**Behavioral contract** (already guaranteed by `speckit-plan`/`speckit-tasks`, per their
existing SKILL.md text, unmodified by this feature):

- Both entries have `optional: false` → both callers treat this as a **mandatory** pre-hook:
  they emit an `EXECUTE_COMMAND: speckit.design` block, actually invoke `/speckit-design`, and
  **wait for it to finish** before proceeding to their own Outline. Neither `speckit-plan` nor
  `speckit-tasks` starts its own work while `speckit-design` is still running or blocked.
- Neither entry has a `condition` → both callers always execute the hook (never skip based on
  a condition they'd have to evaluate themselves); all skip/short-circuit logic (no UI impact,
  already approved) lives inside `speckit-design` itself, not in the hook registration.
- `command: speckit.design` maps to slash command `/speckit-design` (dots → hyphens, per the
  existing rule every `speckit-*` skill already documents).

**`speckit-design`'s contract back to its callers**: on return (whether invoked from
`before_plan` or `before_tasks`), the feature's addendum `DESIGN.md` — see
[design-addendum-format.md](./design-addendum-format.md) — MUST have `Status: Approved` or
`Status: No UI Impact`. `speckit-design` MUST NOT return control while `Status` is `Draft` or
`Changes Requested`; it keeps the conversation in an interactive review loop (regenerate ↔
review ↔ change request) until the developer explicitly approves, declares no UI impact, or
invokes the FR-009 manual escape hatch (which itself sets `Status: Approved` once the developer
supplies their own `DESIGN.md` content).
