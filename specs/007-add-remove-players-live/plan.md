# Implementation Plan: Spelers tijdens het lopende spel toevoegen en verwijderen

**Branch**: `007-add-remove-players-live` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-add-remove-players-live/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Let the group add a late-arriving player or remove a player who's leaving while a game is
already in progress, via the same "+" add flow used before the game and a new confirm-before-
delete player-management view reachable from `GameScreen` at any time. Reuses feature 004's
existing random-per-draw target selection unchanged (see research.md: feature 004 has no
turn-rotation concept, so this feature's "turn rotation" requirements are reinterpreted as
"included in / excluded from future random draws"). Adds an optional `status` field to `Player`
so a removed player's participation history is retained (marked, not deleted) rather than
spliced out of the array, satisfying FR-010.

## Technical Context

**Language/Version**: TypeScript, existing Vite + React 18 app (no version change)

**Primary Dependencies**: React, TailwindCSS v4 (CSS-first `@theme`, no `tailwind.config.js`) —
both already in use, no new dependency introduced

**Storage**: Browser `localStorage` via `src/lib/storage.ts` — reuses the existing
`badzwanzen:players` key (`getPlayers()`/`setPlayers()`), no new key or schema migration beyond
the new optional `status` field on `Player`

**Testing**: Vitest + React Testing Library, co-located `*.test.ts(x)` files — same conventions
as every other feature in this repo

**Target Platform**: Mobile-first responsive web (single shared phone/laptop screen), no native
app — unchanged

**Project Type**: Single-page web app (existing structure: `src/features/<domain>/`), not a
web app with separate frontend/backend

**Performance Goals**: N/A beyond "instant" local state updates (SC-001/SC-002: add/remove
completes within 15s/10s including user input time, trivially met by synchronous React state +
`localStorage` writes with no network round trip)

**Constraints**: Client-side only (Constitution IV) — no server, no accounts, must stay
deployable on Vercel's free tier; no new persisted structure beyond the existing players array

**Scale/Scope**: One new optional field on an existing type, one extended hook (`usePlayers`),
two new components (`LivePlayerList`, `LivePlayerManagementScreen`), and a small header/entry-
point change to the existing `GameScreen` in `src/App.tsx`. No new screens beyond the one
already-approved "Spelers Beheer" mockup.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec-Driven Development**: PASS. `spec.md` (Approved via checklist), this `plan.md`, and
  a subsequent `tasks.md` will exist before any implementation code is written. The
  turn-rotation mismatch found during Phase 0 was resolved with the developer and documented in
  research.md rather than silently assumed.
- **II. Test-First (TDD)**: PASS (governs the plan; enforced during `/speckit-tasks`/
  `/speckit-implement`, not here). All new behavior (`retirePlayer`, scoped duplicate/max
  checks, `LivePlayerList` confirmation state, `GameScreen`'s new view toggle) is application
  code with a natural Vitest/RTL target — no exemption needed.
- **III. Simplicity & YAGNI**: PASS. Explicitly rejected in research.md: building real
  turn-order state into feature 004 (not required — the spec's actual intent is met by the
  existing random-draw model plus array filtering), a second persisted "removed players" log
  (a derived filter suffices), a `requireConfirmation` prop bolted onto the existing
  `PlayerList` (would burden the pre-game component with a mode it doesn't need), and a
  persistent bottom navigation bar implied by the mockup but not required by any FR.
- **IV. Zero-Cost, Client-Side Architecture**: PASS. No new storage key, no backend, no paid
  service — reuses `localStorage` via the existing `src/lib/storage.ts`.
- **V. Quality Gates**: PASS (process, enforced by branch/PR/CI as usual — nothing feature-
  specific here).

No violations — Complexity Tracking table below is empty.

## Project Structure

### Documentation (this feature)

```text
specs/007-add-remove-players-live/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── live-player-management-contract.md
├── checklists/
│   └── requirements.md
├── design/
│   ├── spelers-beheer-mobile.png
│   └── spelers-beheer-mobile.html
├── DESIGN.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── App.tsx                                    # MODIFIED: GameScreen gains a
│                                               #   view: 'card' | 'players' toggle, a header
│                                               #   entry point, and a players-mutation path
│                                               #   threaded down from App
├── features/
│   └── players/
│       ├── types.ts                           # MODIFIED: Player gains optional `status` field
│       ├── usePlayers.ts                      # MODIFIED: addPlayer scoped to active players;
│       │                                       #   adds retirePlayer()
│       ├── usePlayers.test.ts                 # MODIFIED: new tests for retirePlayer, scoped
│       │                                       #   duplicate/max checks
│       ├── AddPlayerControl.tsx                # UNCHANGED — reused as-is (FR-001)
│       ├── PlayerList.tsx                      # UNCHANGED — pre-game instant-delete list stays
│       ├── LivePlayerList.tsx                 # NEW: confirm-before-remove list for live game
│       ├── LivePlayerList.test.tsx             # NEW
│       ├── LivePlayerManagementScreen.tsx      # NEW: "Spelers Beheer" screen
│       └── LivePlayerManagementScreen.test.tsx # NEW
└── App.test.tsx                                # MODIFIED: coverage for the new view toggle and
                                                 #   live add/remove flowing into future draws
```

**Structure Decision**: Existing `src/features/<domain>/` structure is unchanged — this feature
extends the `players` feature folder (already home to setup-time add/remove) with the live-game
variants, and makes a small, localized change to `App.tsx`'s existing `GameScreen` rather than
introducing a new top-level screen/routing concept. This matches every prior feature in this
repo (001, 004, 008, 009, 010) and Constitution III.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — table intentionally left empty.
