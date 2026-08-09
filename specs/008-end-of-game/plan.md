# Implementation Plan: End of Game Screen

**Branch**: `008-end-of-game` | **Date**: 2026-08-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-end-of-game/spec.md`

## Summary

When the group's session (feature 004's bounded draw pool) is exhausted, the next "draw" attempt
must show a dedicated end-of-game screen instead of doing nothing useful — listing every player
from the session and offering "play again" (same players, fresh pool) or "change players" (back
to setup, pre-filled). The pool-exhaustion detection this depends on (`useDrawPile`'s `hasEnded`
flag, set only on the draw *after* the last card, never early) already exists from feature 004 and
needs no changes. The work is: replace `App.tsx`'s current bare "Het spel is afgelopen!" message
with a real `EndOfGameScreen` component, and give `App` a way to restart a session (remount
`GameScreen` with a fresh pool for the same players) or return to player setup — reusing
`PlayerSetupScreen`/`usePlayers`'s existing `localStorage`-backed pre-fill as-is, with no new
prop plumbing needed there.

## Technical Context

**Language/Version**: TypeScript (Vite `react-ts` template) — unchanged from features 001/004

**Primary Dependencies**: React, Vite, TailwindCSS (`@tailwindcss/vite`) — no new dependencies

**Storage**: In-memory React state only for this feature's own new behavior (a session-restart
key in `App`). No new `localStorage` usage: "change players" relies on `usePlayers`'s *existing*
`localStorage` persistence (from feature 001) already holding the just-ended session's players,
since nothing in the app removes players mid-session — see research.md.

**Testing**: Vitest + React Testing Library, same as features 001/004

**Target Platform**: Mobile-first responsive web browser, static site. UI follows the shared
design system at [`/DESIGN.md`](../../DESIGN.md), with this feature's own addendum at
[`DESIGN.md`](./DESIGN.md) (Approved 2026-08-09 — "Potje afgelopen!" screen, player list, primary
"Speel opnieuw" / secondary "Spelers wijzigen" actions).

**Project Type**: Single-page web application (frontend only, client-side) — extends the existing
single-project structure from features 001/004

**Performance Goals**: Showing the end-of-game screen and starting a new session are both local
state transitions with no network round-trip — supports SC-002 (<2s, trivially met)

**Constraints**: Must run entirely client-side and deploy on Vercel's free tier (Constitution
Principle IV); no paid services; depends on feature 004's `useDrawPile`/`hasEnded` and feature
001/007's `Player`/`usePlayers` existing at integration time; reload/refresh resilience is
explicitly out of scope (spec.md Assumptions)

**Scale/Scope**: One shared session, same player cap as feature 001 (up to 20); the end-of-game
screen itself has no scale concerns — it renders once, for the same player list already used
through the session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Spec-Driven Development | Plan derives directly from approved `spec.md` and Approved `DESIGN.md`; no application code written yet | PASS |
| II. Test-First (TDD) | Testing stack fixed to Vitest + RTL; `tasks.md` (next phase) must order failing tests before implementation for `EndOfGameScreen` (player list, both actions) and the `App.tsx` wiring (empty-pool → screen shown, play-again remount, change-players fallback) | PASS (enforced at task level) |
| III. Simplicity & YAGNI | No new state-management library; session-restart uses a plain `key`-remount, the simplest way to reset `GameScreen`'s internal hook state; no new `localStorage` reads/writes added — reuses feature 001's existing persistence as-is instead of threading an `initialPlayers` prop through `PlayerSetupScreen` | PASS |
| IV. Zero-Cost, Client-Side Architecture | No server/database/accounts; all state in-memory or (reused, unmodified) `localStorage`; static site on Vercel free tier | PASS |
| V. Quality Gates (CI + Review) | Built on its own branch (`008-end-of-game`); reuses CI (lint + test) already established by feature 001's Setup tasks | PASS |

No violations — Complexity Tracking table is empty (see below).

## Project Structure

### Documentation (this feature)

```text
specs/008-end-of-game/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── DESIGN.md            # /speckit-design output (UI design addendum, Approved)
├── design/               # /speckit-design output (screenshot + HTML mockup)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: like features 001 and 004, this feature exposes no external
API/CLI/service interface — it's an internal client-side component and its wiring into `App.tsx`
(see research.md → "Contracts").

### Source Code (repository root)

```text
src/
├── features/
│   ├── players/                        # from feature 001/007 (reused, not modified)
│   │   ├── PlayerSetupScreen.tsx       # already localStorage-pre-filled on remount — no changes needed
│   │   └── usePlayers.ts
│   ├── cards/                          # from feature 004 (reused, not modified)
│   │   └── useDrawPile.ts              # hasEnded already set correctly per FR-001 — no changes needed
│   ├── virus/                          # from feature 004 (reused, not modified)
│   └── end-of-game/                    # new
│       ├── EndOfGameScreen.tsx         # player list + "Speel opnieuw" / "Spelers wijzigen" actions (FR-002, FR-003, FR-004)
│       └── EndOfGameScreen.test.tsx
├── App.tsx                             # replaces the current hasEnded placeholder block with EndOfGameScreen; adds a session-restart key + onChangePlayers wiring
└── main.tsx
```

**Structure Decision**: Continues the single-project structure established by features 001/004
(`src/features/<feature>/`, tests colocated with source). One new feature folder is added
(`end-of-game`), holding only the new screen component — no new hooks are needed since the
pool-exhaustion signal (`hasEnded`) and player pre-fill (`usePlayers` + `localStorage`) are both
already provided by existing features. `App.tsx` changes are wiring only: it gains a `sessionKey`
piece of state (incremented by "play again" and passed as `key={sessionKey}` on `<GameScreen>` so
React fully remounts it — resetting the pool, draw state, and virus effects together in one
step — and equivalent to feature 004's own approach of keeping all session state local to
`GameScreen`) and passes `onChangePlayers={() => setPlayers(null)}` down so `EndOfGameScreen`'s
second action falls back to the existing `<PlayerSetupScreen>` branch.

## Complexity Tracking

*No entries — Constitution Check reported no violations.*
