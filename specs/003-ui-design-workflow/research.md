# Phase 0 Research: UI-design-stap in de spec-driven workflow

## Decision: Mechanism — reuse the existing extension-hook system, no new orchestrator

**Decision**: Implement the design step as one new skill, `speckit-design` (slash command
`/speckit-design`), registered in `.specify/extensions.yml` as a **mandatory** hook
(`optional: false`, no `condition`) under both `hooks.before_plan` and `hooks.before_tasks`.
No existing skill file (`speckit-plan/SKILL.md`, `speckit-tasks/SKILL.md`, etc.) is modified.

**Rationale**: Every `speckit-*` skill in this repo already has a "Pre-Execution Checks" block
that reads `.specify/extensions.yml` and, for a mandatory hook, executes the named command and
*waits for its result before proceeding to the Outline* — this is exactly "block until design is
approved" (FR-006) and "run design generation before planning" (FR-001), for free, with zero
edits to the commands whose behavior must change. Registering the same skill at two hook points
means one skill body handles both "generate/iterate" (first call, from `before_plan`) and
"gate check" (repeat call, from `before_tasks`) — the logic is identical either way: read the
feature's addendum status, and only return control once it says `Approved` (or the feature was
confirmed to have no UI impact, or the developer explicitly chose the FR-009 manual escape
hatch). This satisfies Principle III (Simplicity & YAGNI): no new hook engine, no polling loop,
no separate "gate" skill.

**Alternatives considered**:
- *Edit `speckit-plan` and `speckit-tasks` directly* to inline the design/gate logic. Rejected:
  touches two existing, working skills for a concern that the hook system was already built to
  carry; higher review risk, and diverges from how `002-git-worktree-setup` and other features
  are expected to extend the workflow (via `extensions.yml`, not core-skill edits).
- *A single hook point only (`before_plan`)*, relying on the developer's discipline to not run
  `/speckit-tasks` early. Rejected: FR-006 explicitly requires `/speckit-tasks` itself to be
  blocked, not just discouraged: a `before_tasks` hook is the only way to enforce that
  mechanically within this prompt-driven system.

## Decision: Stitch integration — direction of the DESIGN.md ↔ Stitch sync

**Decision**: For this project, Stitch's existing "Party Quest" project
(`projects/2820714669126137113`, confirmed reachable — see
[Stitch MCP reference](../../.claude — n/a, see project memory)) is the durable source of
visual truth. The flow per UI-affecting feature is Stitch → DESIGN.md (extract), not
DESIGN.md → Stitch (upload):

1. `mcp__stitch__list_design_systems(projectId=2820714669126137113)` (or `get_project`) to read
   the current shared design system's tokens (colors, typography, shape/component style) —
   used to keep the root `DESIGN.md` an accurate mirror, and to pass as the `designSystem`
   argument on generation calls so new screens stay visually consistent (FR-008/SC-003).
2. `mcp__stitch__generate_screen_from_text(projectId, prompt, designSystem=<asset from step 1>)`
   to generate new screen(s) for the feature. For a feature that only tweaks an existing,
   already-approved screen, use `mcp__stitch__edit_screens` with the existing `selectedScreenIds`
   instead of generating a new screen from scratch (handles the "one small addition" edge case
   from spec.md without a full re-design).
3. `mcp__stitch__get_screen` (or `list_screens`) to retrieve the resulting screen's details —
   each includes a `screenshot.downloadUrl`.
4. Developer review happens against a **downloaded, committed image**: fetch that URL and save
   it to `specs/[feature]/design/<screen-slug>.png`, send it to the developer directly, and
   reference it from the addendum (see `contracts/design-addendum-format.md`). The Stitch
   project link is still given as a secondary pointer for continuing to edit interactively, but
   the committed PNG — not the hosted URL — is the artifact that was actually reviewed and the
   one that survives in git history/PR diffs even if the screen is later edited or Stitch is
   unreachable. (Revised from an earlier version of this decision, which assumed only a link was
   practical — corrected after live testing against feature `001-add-players` showed the
   developer specifically wants the image itself in git next to the spec, not just a pointer to
   it.)
5. On a change request: `mcp__stitch__edit_screens` again with the developer's specific
   feedback as `prompt`, targeting the same `selectedScreenIds`; loop back to step 3.
6. On approval: write the root `DESIGN.md` (tokens, only if the shared design system actually
   changed) and the feature's addendum `DESIGN.md` (screen references, local screenshot
   path(s), `Status: Approved`).

**Important caveat found during live testing**: the shared Stitch project can already contain
screens from before this workflow existed (e.g. "Party Quest" already had a screen titled
"Party Pulse - Spelers Toevoegen" matching feature `001-add-players`'s UI, pre-dating this
feature). A screen already existing in the project is **not** the same as it being reviewed and
approved for a specific feature — `speckit-design` MUST still show it to the developer and get
explicit approval before setting `Status: Approved`, exactly as it would for a screen it just
generated itself.

**Rationale**: The `upload_design_md` / `create_design_system_from_design_md` tool pair goes the
*other* direction — bootstrapping a brand-new Stitch design system from a hand-written
`DESIGN.md`. That's the right tool for a project that doesn't yet have a Stitch design system;
this project already has one ("Party Quest", confirmed via `list_projects` in a prior session —
see project memory), so extending it via `generate_screen_from_text` /`edit_screens` and mirroring
its tokens back into `DESIGN.md` is the correct direction and avoids re-creating what already
exists (FR-008, Assumptions in spec.md).

**Alternatives considered**:
- *Upload a hand-written root `DESIGN.md` via `upload_design_md` to (re)create the design
  system from scratch.* Rejected: would discard the existing, already-tailored "Party Quest"
  design system (dark mode, game-state colors, Rubik/Be Vietnam Pro type) for no benefit — the
  spec's Assumptions section is explicit that the existing project is the base to extend, not
  replace.
- *Render screen previews inline (e.g., fetch and display an image).* Deferred: `get_screen`'s
  exact response shape (whether it embeds an image, a URL, or neither) is only confirmed by a
  live call; the skill is written to degrade gracefully to "here's the project link" either way,
  so this isn't a blocking unknown for the plan.

## Decision: Testing approach for this feature

**Decision**: Same non-application-tooling exemption as `002-git-worktree-setup`: this feature
is a new skill (a Markdown prompt file interpreted by the agent) plus a small bash setup script
and a YAML config file — none of it is Vitest/RTL-testable application code. Verification is a
manual, repeatable `quickstart.md` walkthrough, run red → green against a real throwaway
feature branch: red = `/speckit-tasks` correctly refuses to proceed with no/unapproved addendum;
green = after `/speckit-design` produces an `Approved` addendum, `/speckit-tasks` proceeds.

**Rationale**: Matches Constitution v1.1.0 §II's explicit exemption for internal developer
tooling with no natural Vitest/RTL target, applied the same way it already was for
`002-git-worktree-setup` (see that feature's `plan.md` Constitution Check / Complexity
Tracking for precedent).

**Alternatives considered**: Writing a test harness that mocks the `mcp__stitch__*` tools and
asserts on generated `SKILL.md` prose. Rejected: the "implementation" here is instructional
text for an LLM agent, not executable logic — a mock-based unit test would assert on prose
structure, not real behavior, which is lower-value than actually running the flow once against
live Stitch tools and real hook files (Principle III).

## Decision: Root `DESIGN.md` bootstrap

**Decision**: `specs/003-ui-design-workflow`'s own implementation is the first time the design
step runs, so it is also responsible for creating the initial root `DESIGN.md` (there is none
in the repo yet — confirmed by search). Bootstrap content comes from the existing "Party Quest"
Stitch design system's tokens (step 1 of the sync flow above), not written by hand.

**Rationale**: Avoids a chicken-and-egg gap where the design step's own contract (FR-003: root
`DESIGN.md` must exist and stay current) is unmet until some later feature happens to trigger
it. Bootstrapping from the already-existing Stitch design system means the first root
`DESIGN.md` reflects real, already-approved styling (dark mode, game-state colors, Rubik/Be
Vietnam Pro), not a placeholder.
