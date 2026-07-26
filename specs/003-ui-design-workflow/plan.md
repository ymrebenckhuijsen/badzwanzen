# Implementation Plan: UI-design-stap in de spec-driven workflow (Google Stitch)

**Branch**: `003-ui-design-workflow` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-ui-design-workflow/spec.md`

## Summary

Add one new skill, `speckit-design` (`/speckit-design`), and register it as a mandatory hook at
two existing extension points (`hooks.before_plan`, `hooks.before_tasks`) in a new
`.specify/extensions.yml`. No existing `speckit-*` skill is edited — the hook mechanism they
already implement is exactly the "run before planning" (FR-001) and "block tasks until
approved" (FR-006) behavior this feature needs. `speckit-design` drives Google Stitch (MCP) to
generate/edit screens against the project's existing shared design system ("Party Quest",
`projects/2820714669126137113`), runs an interactive review loop with the developer, and
records the result in two Markdown files: a canonical, project-wide `/DESIGN.md` (bootstrapped
by this feature, since none exists yet) and a per-feature addendum
`specs/[###-feature]/DESIGN.md` carrying an explicit `Status` field that gates
`/speckit-tasks`/`/speckit-implement`.

## Technical Context

**Language/Version**: Markdown/YAML (skill prompt + hook config) and Bash, matching the
existing `.specify/scripts/bash/*.sh` scripts (macOS `bash` 3.2-compatible)

**Primary Dependencies**: The project's existing Spec Kit skill/hook framework
(`.specify/extensions.yml`, already-implemented hook points in `speckit-plan`/`speckit-tasks`);
the Stitch MCP server (`mcp__stitch__*` tools — confirmed reachable, see
[research.md](./research.md)); `.specify/scripts/bash/common.sh` helpers for a new
`setup-design.sh`

**Storage**: N/A — no database; persistence is two kinds of Markdown files
(`/DESIGN.md`, `specs/[feature]/DESIGN.md`) plus one YAML config (`.specify/extensions.yml`),
all git-tracked

**Testing**: Manual verification via `quickstart.md`, run red → green against a real throwaway
feature branch (see [research.md](./research.md) → "Testing approach"); not Vitest/RTL, which
is this project's stack for application code, not this workflow tooling

**Target Platform**: Developer machines, inside Claude Code sessions (the two contributors)

**Project Type**: Internal developer tooling / spec-driven-workflow extension (not the web app
itself)

**Performance Goals**: N/A — human-timescale, occasional, per-feature operations

**Constraints**: Must not change behavior for features that never touch `/speckit-plan` or
`/speckit-tasks` through this hook path (none exist, since both are the standard flow — so this
is really "must not break the existing flow for non-UI features," per FR-007/SC-004); must not
modify `speckit-plan/SKILL.md` or `speckit-tasks/SKILL.md`; zero new paid tooling (Stitch
access already exists per Constitution IV's "no paid service without an amendment" — using an
already-provisioned integration, not adding one)

**Scale/Scope**: Two developers, one shared Stitch project, occasional UI-affecting features —
not a high-concurrency or high-volume concern

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Spec-Driven Development | Plan derives directly from the approved, clarified `spec.md`; this feature is itself an extension of that same Spec Kit flow | PASS |
| II. Test-First (TDD) | Vitest/RTL stack targets application code; for this skill/hook/config feature, verification is the manual red→green `quickstart.md` walkthrough instead (see research.md) | PASS (explicit non-application-tooling exemption per Constitution v1.1.0 §II) |
| III. Simplicity & YAGNI | Reuses the existing hook system instead of building a new orchestrator; one new skill, one new script, one new config file, two new/updated Markdown file shapes — no new framework | PASS |
| IV. Zero-Cost, Client-Side Architecture | Doesn't touch the app's runtime architecture; Stitch is a design-time tool used by developers, not a runtime dependency of the deployed game | PASS / N/A |
| V. Quality Gates (CI + Review) | Developed on its own branch (`003-ui-design-workflow`) with a PR; doesn't modify CI config | PASS |

One entry logged in Complexity Tracking (Principle II's non-application-tooling exemption),
same precedent as `002-git-worktree-setup`.

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-design-workflow/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── hook-registration.md        # extensions.yml hook contract
│   ├── design-addendum-format.md   # DESIGN.md file-format contract
│   └── stitch-mcp-usage.md         # Stitch MCP tool-usage + FR-009 fallback contract
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
.claude/
└── skills/
    └── speckit-design/
        └── SKILL.md                # new — the design-step skill (/speckit-design)

.specify/
├── extensions.yml                  # new — registers speckit-design at before_plan/before_tasks
└── scripts/
    └── bash/
        └── setup-design.sh         # new — resolves FEATURE_DIR, addendum path, root DESIGN.md path (mirrors setup-plan.sh)

DESIGN.md                           # new — canonical project-wide design system doc (repo root)

specs/[###-feature]/
└── DESIGN.md                       # new, per UI-affecting feature — addendum with Status field
```

**Structure Decision**: This feature lives entirely under `.claude/skills/`, `.specify/`, and
the repository root (`/DESIGN.md`), plus the per-feature `DESIGN.md` addendum convention it
establishes. It does not touch `src/` — consistent with it being workflow tooling, not
application functionality (Constitution Principle IV scopes the client-side architecture to the
app itself). `speckit-plan/SKILL.md` and `speckit-tasks/SKILL.md` are read but not written by
this feature — see [hook-registration.md](./contracts/hook-registration.md) for why the
existing hook mechanism makes that unnecessary.

## Complexity Tracking

| Exemption | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Principle II's non-application-tooling exemption (Constitution v1.1.0 §II) applied: manual `quickstart.md` verification used instead of automated Vitest/RTL tests | This feature is a Markdown skill prompt, one bash setup script, and YAML config — not application code; the project's TDD stack (Vitest/RTL) has no natural target for prompt-driven agent behavior or MCP tool orchestration | A harness that mocks `mcp__stitch__*` calls and asserts on generated prose would test the mock, not real Stitch behavior or real hook execution — lower confidence than actually running the flow once (Principle III) |
