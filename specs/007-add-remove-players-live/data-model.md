# Phase 1 Data Model: Spelers tijdens het lopende spel toevoegen en verwijderen

## Player (extended)

`src/features/players/types.ts`

```ts
export interface Player {
  id: string
  name: string
  order: number
  status?: 'active' | 'removed'
}
```

- `status` is **optional** and treated as `'active'` when absent (backward compatible with
  every existing player object created before this feature, and with pre-game-only usage where
  the field is never set).
- `status: 'removed'` is set only by live-game removal (this feature). It is a **terminal**
  state for the remainder of the session — per spec.md Assumptions, "verwijderen" during the
  game means excluded from further turns for the rest of the session, not a toggle. There is no
  code path that transitions a player back from `'removed'` to `'active'`.
- Pre-game removal (`PlayerSetupScreen` → `usePlayers.removePlayer`) is unchanged: it still
  splices the player out of the array entirely rather than setting `status: 'removed'`, since a
  player removed before the game starts was never part of a session and has no participation
  history to retain (FR-010 only concerns removal *during* a game).

### Derived: active players

Any code that determines "who is currently playing" (target resolution for card draws, the
visible player count, the live player-management list) uses a derived filter, not a new stored
field:

```ts
const activePlayers = players.filter((p) => p.status !== 'removed')
```

### State transitions

```text
(created, no status field) --status defaults to active-->  active
active --retirePlayer(id), live game only-->  removed  [terminal for this session]
```

No other transitions exist. Pre-game `removePlayer(id)` operates outside this state machine
entirely (array splice, not a status change).

## Validation rules (updated)

`usePlayers.addPlayer` (`src/features/players/usePlayers.ts`) must scope its checks to active
players only, so a freed-up name (FR-013) and the 20-player cap both ignore removed players:

```ts
const activeCurrent = playersRef.current.filter((p) => p.status !== 'removed')
if (activeCurrent.some((p) => p.name === trimmed)) return { ok: false, reason: 'duplicate' }
if (activeCurrent.length >= MAX_PLAYERS) return { ok: false, reason: 'max' }
```

This applies identically whether `addPlayer` is called pre-game (where no player is ever
`'removed'`, so behavior is unchanged) or during a live game (where it now matters).

## New: live removal function

Added alongside (not replacing) `usePlayers.removePlayer`:

```ts
export type RemoveLivePlayerResult =
  | { ok: true }
  | { ok: false; reason: 'min-players' }

function retirePlayer(id: string): RemoveLivePlayerResult {
  const activeCount = playersRef.current.filter((p) => p.status !== 'removed').length
  if (activeCount <= 2) return { ok: false, reason: 'min-players' }

  const next = playersRef.current.map((p) =>
    p.id === id ? { ...p, status: 'removed' as const } : p,
  )
  playersRef.current = next
  setPlayersState(next)
  setPlayers(next) // persists via src/lib/storage.ts, same `badzwanzen:players` key
  return { ok: true }
}
```

The FR-009 floor is enforced here as a defense-in-depth guard (in addition to the UI disabling
the affordance at 2 active players) so the invariant holds even if called some other way (e.g.
future tests).

## Components

### `LivePlayerList` (new)

`src/features/players/LivePlayerList.tsx` — sibling to the existing `PlayerList`, for the
live-game context.

```ts
interface LivePlayerListProps {
  players: Player[] // already filtered to active players by the caller
  onRetire: (id: string) => RemoveLivePlayerResult
  minPlayersReached: boolean // players.length <= 2 — disables every row's delete affordance
}
```

Internal state: `confirmingId: string | null` — tapping a row's delete icon sets
`confirmingId` to that player's id, rendering an inline "Verwijder {name}? Ja／Nee" state for
that row only (per the approved `specs/007-add-remove-players-live/design/spelers-beheer-mobile.png`
mockup) instead of immediately removing. "Ja" calls `onRetire(id)`; "Nee" or tapping elsewhere
clears `confirmingId` without calling `onRetire`.

### `LivePlayerManagementScreen` (new)

`src/features/players/LivePlayerManagementScreen.tsx` — the "Spelers Beheer" screen itself,
composing `AddPlayerControl` (reused as-is) + `LivePlayerList` + the "SPELERS (n/20) · Minimaal
2 nodig" status line, plus a close/back action back to the card view.

```ts
interface LivePlayerManagementScreenProps {
  players: Player[] // full array, including any 'removed' — screen filters internally for display
  onAdd: (name: string) => AddPlayerResult
  onRetire: (id: string) => RemoveLivePlayerResult
  onClose: () => void
}
```

### `GameScreen` (modified)

`src/App.tsx` — gains a local `view: 'card' | 'players'` state and a header button toggling it
(FR-011: reachable at any time during the game). Gains a `players`-mutation path: `App` must
thread a setter down so `GameScreen` can call `addPlayer`/`retirePlayer`-equivalents and have
the result flow both into `useDrawPile`/`resolveTargets` (next draw onward) and into
`localStorage` via `setPlayers()`. See research.md's "persistence wiring" decision for why a
lifted setter is used instead of a second `usePlayers()` instance inside `GameScreen`.

## Relationship to feature 004's draw/target model

No changes to `resolveTargets`, `useDrawPile`, or `useVirusEffects` signatures. Both
`GameScreen` and `App` must pass only `activePlayers` (the `status !== 'removed'` filter) —
not the full players array — into `useDrawPile`/`resolveTargets`, `PlayerList`/`ActiveVirusList`
display, and any other "who's playing" consumer, so a removed player is immediately and
completely excluded from future draws (satisfying FR-006/FR-007 under the reinterpretation in
research.md). The full (unfiltered) array, including removed players, is only used by
`LivePlayerManagementScreen` internally (to know who exists, even if not shown) and, in future,
by the separate scoring feature.
