# Phase 0 Research: End of Game Screen

No `NEEDS CLARIFICATION` markers remain in `plan.md`'s Technical Context — `/speckit-clarify`
already resolved the three open questions during specification (see spec.md Clarifications,
2026-07-27). This document records the implementation-approach decisions made while filling in
Technical Context and Project Structure, each grounded in the existing codebase rather than
invented fresh.

## Decision: Reuse `useDrawPile`'s existing `hasEnded` flag as-is

**Rationale**: `src/features/cards/useDrawPile.ts`'s `draw()` already implements exactly FR-001's
timing: while `remainingCardIds` is non-empty it pops and returns a card (even if that pop empties
the array); only a *subsequent* call, made when the array is already empty, sets `hasEnded = true`
and returns `null`. That is precisely "the last card is shown and resolved normally; the end
screen appears on the *next* draw attempt" — traced through the code, not assumed. No change to
`useDrawPile` is needed or in scope.

**Alternatives considered**: Adding a separate "pool exhausted" check computed from
`remainingCount === 0` in `App.tsx` instead of trusting `hasEnded`. Rejected — `hasEnded` already
is that check, applied at the correct moment; duplicating it in `App.tsx` would just be two
sources of truth for the same fact.

## Decision: Restart a session via a `key`-remount, not a manual reset function

**Rationale**: `GameScreen` (in `App.tsx`) holds all of a session's state as component-local hooks
(`pool`, `useDrawPile`, `useVirusEffects`, `current`, `liftQueue`). "Play again" needs *all* of
that reset together, for the same `players`. React's own remount-on-`key`-change mechanism does
this in one step with no new reset logic to write or keep in sync as `GameScreen`'s internal state
grows — `App` holds a `sessionKey` number, increments it on "play again", and passes
`key={sessionKey}` to `<GameScreen>`.

**Alternatives considered**: A `resetSession()` function threaded through `useDrawPile` and
`useVirusEffects` that clears each hook's internal state in place. Rejected as more code for the
same outcome, and error-prone if a future feature adds session state to `GameScreen` and forgets
to wire it into the reset function too (violates Simplicity & YAGNI — Constitution Principle III).

## Decision: No new prop plumbing for "change players" pre-fill

**Rationale**: `PlayerSetupScreen` (feature 001) already initializes from `usePlayers()`, which
reads `getPlayers()` from `localStorage['badzwanzen:players']` (`src/lib/storage.ts`). Every
`addPlayer`/`removePlayer` call during setup persists to that same key. Nothing in the app removes
players once a session starts (there is no mid-session player-removal feature), so the players
still in `localStorage` when a session ends are exactly the players who took part in it. FR-004's
"pre-filled with the same player list from the just-ended session" therefore falls out for free
from `App` simply returning to its existing `!players` branch (`setPlayers(null)`) — no
`initialPlayers` prop, no copying of the session's player list anywhere.

**Alternatives considered**: Passing the session's `Player[]` explicitly into `PlayerSetupScreen`
as an `initialPlayers` prop, sourced from `App`'s own `players` state rather than trusting
storage. Rejected — it's redundant with what storage already holds (same data, two paths to it),
and only becomes necessary if a future feature allows removing players mid-session, at which point
storage and `App`'s `players` state could diverge; not needed now (Simplicity & YAGNI).

## Decision: One new component, no new hook

**Rationale**: `EndOfGameScreen` needs no state or logic of its own beyond rendering
`players.map(...)` and firing two callback props (`onPlayAgain`, `onChangePlayers`) — both owned
by `App`. A hook would be pure ceremony around zero actual state.

**Alternatives considered**: An `useEndOfGame()` hook wrapping the two callbacks. Rejected — no
behavior to encapsulate; would only exist to satisfy a "features have hooks" pattern that doesn't
apply here.

## Contracts

This feature exposes no external API/CLI/service interface — same as features 001 and 004. Its
only "contract" is the `EndOfGameScreen` component's own prop signature, captured in
data-model.md rather than a separate `contracts/` directory (consistent with 004's plan.md
precedent).
