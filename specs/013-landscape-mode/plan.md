# Implementation Plan: Landscape-modus ondersteuning

**Branch**: `013-landscape-mode` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-landscape-mode/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Make every existing screen (player setup, card-set selection, the main card/virus game loop,
live player management, end-of-game) fully usable in landscape orientation, without introducing
any new screens, components, or visual design (design step confirmed `No UI Impact`). All five
screens currently share one identical outer-container class string
(`mx-auto flex min-h-svh max-w-md flex-col gap-6 bg-surface p-6 text-on-surface`), so the fix is
CSS-only: add Tailwind's built-in `landscape:`/`portrait:` orientation variants plus one custom
`short:` variant (for low-height phone landscape, ~320–360px) to that shared class string in
each of the five files, widen the column and let content scroll instead of clip when it doesn't
fit. Because this is pure CSS (no new component state, no orientation-driven React state), the
DOM tree and all existing session state survive an orientation change untouched, which is what
satisfies FR-004/SC-002 automatically rather than as something that has to be separately built.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: React 19, Vite 8, TailwindCSS v4 — CSS-first config in
`design/tailwind-theme.css` (no `tailwind.config.js`); no new dependencies introduced

**Storage**: N/A — no data model or persistence changes; existing session state (players,
current card, active virus effects, current screen) is untouched by this feature

**Testing**: Vitest + React Testing Library (existing project stack). jsdom has no layout
engine, so RTL cannot assert real rendered geometry (overflow, clipping, on-screen position).
Automated tests instead assert that each screen's root container carries the expected
responsive Tailwind classes (orientation/height variants, scroll behavior) — a real
red-before/green-after check on the source of truth for the CSS behavior. `quickstart.md`
documents the manual, browser-based device-emulation walkthrough that verifies the actual
rendered behavior these classes are supposed to produce, since that part cannot be automated
in this stack.

**Target Platform**: Mobile-first responsive web (single shared phone/laptop screen), now
including phone and tablet landscape orientation

**Project Type**: Single-page web app (frontend only, no backend)

**Performance Goals**: N/A — CSS-only change, no runtime logic added

**Constraints**: Must remain zero-cost/client-side per Constitution IV; no new runtime
dependencies; portrait orientation must remain pixel-for-pixel behaviorally identical (FR-007);
no new screens/components/visual design (FR-006); landscape support must hold down to ~320–360px
viewport height (FR-008)

**Scale/Scope**: Five screen containers share one identical class string and all need the same
orientation/height-variant treatment: `App.tsx`'s `GameScreen`, `PlayerSetupScreen`,
`CardSetSelectionScreen`, `LivePlayerManagementScreen`, `EndOfGameScreen`. `ActiveVirusList`
needs no direct change — it's an unconstrained flex child, so the outer container's scroll
already carries it. One custom Tailwind variant (`short`) needs to be added to
`design/tailwind-theme.css`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec-Driven Development**: PASS — this plan follows an approved `spec.md` with no
  `NEEDS CLARIFICATION` markers; `/speckit-tasks` will follow this plan.
- **II. Test-First (TDD)**: PASS (planned) — Phase 2 tasks (via `/speckit-tasks`) MUST add
  failing tests first for each screen's container carrying the new responsive classes, and for
  `ActiveVirusList`'s scroll-container class. This is application code, so the Principle II
  tooling exemption does not apply; the class-assertion strategy above (documented further in
  `research.md`) is how TDD is satisfied for a CSS-only change in a jsdom test environment.
- **III. Simplicity & YAGNI**: PASS — edits the existing duplicated class string in place in
  each of the five files rather than introducing a new shared `ScreenLayout` wrapper component;
  that duplication already exists in the codebase today and extracting an abstraction for it is
  not something this feature's spec asks for (FR-006 explicitly rules out new components).
  `ActiveVirusList` is deliberately left untouched rather than given a redundant nested scroll
  region — the outer container's scroll already covers it.
- **IV. Zero-Cost, Client-Side Architecture**: PASS — no server, no new dependency, no paid
  service; purely client-side CSS.
- **V. Quality Gates (CI + Review)**: PASS (planned) — ships on `013-landscape-mode`, PR into
  `main`, CI (test + lint) must be green before merge.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/013-landscape-mode/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── DESIGN.md            # Design addendum — Status: No UI Impact
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: this feature has no external interface (no API, no CLI, no library
surface) — it's an internal CSS/layout change to existing screens, consistent with how prior
internal-only features (e.g. `011-max-active-viruses`, `008-end-of-game`) were planned.

### Source Code (repository root)

```text
src/
├── App.tsx                                        # MODIFIED: GameScreen's outer container
│                                                    # classes (orientation/height variants)
├── features/
│   ├── players/
│   │   ├── PlayerSetupScreen.tsx                   # MODIFIED: same container class treatment
│   │   ├── PlayerSetupScreen.test.tsx              # MODIFIED: class-presence assertions
│   │   ├── LivePlayerManagementScreen.tsx          # MODIFIED: same container class treatment
│   │   └── LivePlayerManagementScreen.test.tsx     # MODIFIED: class-presence assertions
│   ├── cards/
│   │   ├── CardSetSelectionScreen.tsx              # MODIFIED: same container class treatment
│   │   └── CardSetSelectionScreen.test.tsx         # MODIFIED: class-presence assertions
│   ├── virus/
│   │   └── ActiveVirusList.tsx                     # UNCHANGED: unconstrained flex child,
│   │                                                # already carried by the outer container's
│   │                                                # scroll — no direct change needed
│   └── end-of-game/
│       ├── EndOfGameScreen.tsx                     # MODIFIED: same container class treatment
│       └── EndOfGameScreen.test.tsx                # MODIFIED: class-presence assertions
└── App.test.tsx                                    # MODIFIED: class-presence assertions for
                                                     # GameScreen's container

design/
└── tailwind-theme.css                              # MODIFIED: add `short` custom variant
                                                     # (`@custom-variant short (@media
                                                     # (max-height: 500px))`)
```

**Structure Decision**: Single existing frontend project (`src/`), no new directories, no new
files beyond the standard spec-kit docs. This feature only touches the outer-container class
strings of five existing screens plus the shared Tailwind theme file; no component's props,
state, or logic changes.

## Complexity Tracking

*No violations — table intentionally omitted.*
