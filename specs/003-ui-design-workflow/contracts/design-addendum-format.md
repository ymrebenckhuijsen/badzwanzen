# Contract: `DESIGN.md` file formats

Two file shapes, both plain Markdown with YAML frontmatter. This is the contract `/speckit-plan`
and `/speckit-tasks` (and their human reader) can rely on when a feature is UI-affecting.

## Root `DESIGN.md` (`/DESIGN.md`, repository root)

```markdown
---
stitch_project: projects/2820714669126137113
stitch_design_system: <asset id, e.g. assets/15996705518239280238>
last_updated_by: <feature branch, e.g. 003-ui-design-workflow>
---

# Badzwanzen Design System

## Color Tokens
...

## Typography
...

## Component Style
...

## Screens by Feature
- `003-ui-design-workflow`: <screen names/links> — see specs/003-ui-design-workflow/DESIGN.md

## Tailwind CSS Mapping
Tokens above are also maintained as a Tailwind v4 `@theme` block at `design/tailwind-theme.css`
— see that file's own header comment and `design/tailwind-theme.css` below.
```

**Contract**: exactly one copy, at the repo root. `/speckit-plan` and `/speckit-tasks` for any
UI-affecting feature MUST treat this file (not their own guesses) as the source of truth for
colors/typography/component style. Only `speckit-design` writes to it, and only when the
underlying Stitch design system actually changed (idempotent — no-op diff otherwise).

## `design/tailwind-theme.css` (repository root)

A generated, Tailwind-v4-consumable mirror of `/DESIGN.md`'s tokens — a single `@theme { ... }`
block using Tailwind v4's CSS-first config (this project has no `tailwind.config.js`; confirmed
against `package.json`/`src/index.css`, which only does `@import 'tailwindcss';` plus plain CSS
custom properties today). Mapping convention:

| `/DESIGN.md` token | Tailwind v4 `@theme` key | Resulting utility |
|---|---|---|
| `colors.<name>` | `--color-<name>` | `bg-<name>`, `text-<name>`, `border-<name>`, … |
| `typography.<name>.fontFamily` (grouped: Rubik → display/headline/label, Be Vietnam Pro → body) | `--font-display` / `--font-body` | `font-display`, `font-body` |
| `typography.<name>` (size + line-height + letter-spacing + weight) | `--text-<name>` + `--text-<name>--line-height`/`--letter-spacing`/`--font-weight` | `text-<name>` |
| `rounded.<name>` (excluding bare `DEFAULT`) | `--radius-<name>` | `rounded-<name>` |
| `spacing.<name>` where the design system's scale is an exact multiple of Tailwind's default 4px unit | *(no override — use the numeric multiplier)* | `p-<n>`, `gap-<n>`, … (e.g. `md`=24px → `p-6`) |
| `spacing.<name>` for the two values that don't fit that scale (`container-margin`, `gutter`) | `--spacing-<name>` | `p-container-margin`, `gap-gutter` |

**Do not** define `--spacing-sm` / `--spacing-md` / `--spacing-lg` / `--spacing-xl` (or `-xs`)
here — confirmed live (2026-07-26) that Tailwind v4 reuses that exact namespace for *named*
width utilities too (`max-w-md`, `w-lg`, …), so doing so silently hijacks those. Named spacing
aliases are only safe for keys that don't collide with Tailwind's own reserved scale names.

**Contract**: exactly one copy, at the repo root, alongside `/DESIGN.md`. `speckit-design`
regenerates it in lockstep with `/DESIGN.md`'s token updates (same trigger, same idempotency
rule — no-op if tokens didn't change). It is the concrete, code-ready counterpart to
`/DESIGN.md`'s prose/frontmatter tokens; an implementer should use its utility classes directly
rather than re-deriving Tailwind values from `/DESIGN.md` by hand.

## Feature addendum `DESIGN.md` (`specs/[###-feature]/DESIGN.md`)

```markdown
---
Status: Draft | Changes Requested | Approved | No UI Impact
---

# Design Addendum: [feature name]

Extends [/DESIGN.md](../../DESIGN.md).

## Screens
- `projects/2820714669126137113/screens/<id>` — <short description>
  ![<short description>](./design/<screen-slug>.png)
  Stitch project (for interactive editing): https://stitch.withgoogle.com/project/2820714669126137113

## What this feature adds or changes
<prose>

## Review history
- <date>: generated (Draft) — screenshot saved to `specs/[feature]/design/<screen-slug>.png`
- <date>: change requested — "<what the developer asked for>"
- <date>: Approved
```

Each screen's screenshot is downloaded (from that screen's `screenshot.downloadUrl`, as returned
by `get_screen`/`list_screens`) and committed as a real file at
`specs/[###-feature]/design/<screen-slug>.png` — **not** just linked to the hosted Stitch URL.
This is what makes review possible from the git history alone (a PR diff, a later `git show`)
without depending on Stitch staying reachable or the screen not being edited out from under a
past decision. The Stitch project link is kept too, but only as a secondary pointer for
*interactively continuing* to edit the screen — the committed PNG is the record of what was
actually reviewed and approved.

For a feature confirmed to have no UI impact, the file is minimal:

```markdown
---
Status: No UI Impact
---

# Design Addendum: [feature name]

Confirmed by the developer at feature-start: this feature has no UI surface.
```

**Contract**:

- `Status` MUST be present in frontmatter and MUST be one of the four literal values above —
  this is the only field `speckit-plan`/`speckit-tasks` parse programmatically (via the hook in
  [hook-registration.md](./hook-registration.md)); everything else in the file is prose for
  human/agent reading, not machine-parsed.
- Exactly one addendum per feature, at `specs/[###-feature]/DESIGN.md` — same path convention
  as `spec.md`/`plan.md`/`tasks.md` in that directory.
- `/speckit-tasks` (via the `before_tasks` hook) MUST refuse to generate `tasks.md` while
  `Status` is `Draft` or `Changes Requested`, or while the file doesn't exist yet.
