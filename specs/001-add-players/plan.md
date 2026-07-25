# Implementation Plan: Spelers toevoegen

**Branch**: `001-add-players` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-add-players/spec.md`

## Summary

A single screen where the user builds up a list of players before starting the game: press
"+", type a name, see it added to a visible list (repeatable, up to 20 players, no
duplicates), remove a player if needed, and press a play-icon button (enabled once ≥2 players
are present) to hand off the current player list to the game. The list survives an accidental
refresh via `localStorage` until the game starts. This is also the first feature in the
project, so this plan additionally establishes the initial technical setup (Vite + React +
TypeScript + TailwindCSS + Vitest/RTL + CI) that the constitution mandates but has not been
scaffolded yet.

## Technical Context

**Language/Version**: TypeScript (Vite `react-ts` template) — see [research.md](./research.md)

**Primary Dependencies**: React, Vite, TailwindCSS (`@tailwindcss/vite`)

**Storage**: Browser `localStorage` only (single key holding the JSON player list) — no
database, no backend

**Testing**: Vitest + React Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`), jsdom environment

**Target Platform**: Mobile-first responsive web browser (phone or laptop), static site

**Project Type**: Single-page web application (frontend only, client-side)

**Performance Goals**: Add/remove-player interactions feel instant (no perceptible delay) on
a mid-range mobile phone — there is no server round-trip to wait for

**Constraints**: Must run entirely client-side and deploy on Vercel's free tier (Constitution
Principle IV); no paid services

**Scale/Scope**: One screen, one entity (`Player`), max 20 players per session, single local
user building the list (not concurrent/multi-device)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Spec-Driven Development | Plan derives directly from the approved `spec.md`; no code written yet | PASS |
| II. Test-First (TDD) | Testing stack fixed to Vitest + RTL; `tasks.md` (next phase) must order failing tests before implementation for every behavior | PASS (enforced at task level) |
| III. Simplicity & YAGNI | Single project, plain React state + one `localStorage` key, no state-management library, no backend, no contracts layer | PASS |
| IV. Zero-Cost, Client-Side Architecture | No server/database/accounts; `localStorage` only; static site deployable on Vercel free tier | PASS |
| V. Quality Gates (CI + Review) | Feature built on its own branch (`001-add-players`); GitHub Actions CI (lint + test) is part of this feature's Setup tasks since the project has no CI yet | PASS (addressed in Setup phase of tasks.md) |

No violations — Complexity Tracking table is empty (see below).

## Project Structure

### Documentation (this feature)

```text
specs/001-add-players/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: this feature exposes no external API/CLI/service interface (see
[research.md](./research.md) → "Contracts").

### Source Code (repository root)

```text
src/
├── features/
│   └── players/
│       ├── PlayerSetupScreen.tsx     # screen: "+" button, list, play button
│       ├── PlayerSetupScreen.test.tsx
│       ├── PlayerList.tsx            # renders the current players
│       ├── PlayerList.test.tsx
│       ├── AddPlayerControl.tsx      # "+" button + name input/confirm
│       ├── AddPlayerControl.test.tsx
│       ├── usePlayers.ts             # state + localStorage sync + validation (add/remove/max/duplicate)
│       └── usePlayers.test.ts
├── lib/
│   ├── storage.ts                    # thin localStorage get/set/JSON helper
│   └── storage.test.ts
├── App.tsx
└── main.tsx

index.html
vite.config.ts
tailwind.config.js / tailwind entry CSS
package.json

.github/
└── workflows/
    └── ci.yml            # lint + test on push/PR (Constitution Principle V)
```

**Structure Decision**: Single-project structure at the repository root (`src/`), per
Constitution Principle IV (no backend, so the template's "web application"
`frontend/`+`backend/` split does not apply — see [research.md](./research.md) → "Project
structure"). Feature code lives under `src/features/players/`; tests are colocated with the
source files they test (see research.md → "Test file placement") rather than a parallel
`tests/` tree.

## Complexity Tracking

*No entries — Constitution Check reported no violations.*
