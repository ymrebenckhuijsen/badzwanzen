# Phase 1 Data Model: End of Game Screen

This feature introduces no new persisted entity and no change to any existing type. It reuses
`Player` (`src/features/players/types.ts`, unchanged) and adds one new component prop contract.

## Reused: `Player`

```ts
interface Player {
  id: string
  name: string
  order: number
}
```

Source of truth: `App`'s existing `players: Player[] | null` state (feature 001), unchanged by
this feature. `EndOfGameScreen` receives the same `players` array `GameScreen` already receives —
no copying, filtering, or snapshotting.

## New: `EndOfGameScreen` props

```ts
interface EndOfGameScreenProps {
  players: Player[]
  onPlayAgain: () => void
  onChangePlayers: () => void
}
```

- `players` — every player from the just-ended session, rendered as a list (FR-002). Order
  follows `player.order`, matching how `GameScreen`/`ActiveVirusList` already display players
  elsewhere in the app — no new sort/display convention introduced.
- `onPlayAgain` — fired by the "Speel opnieuw" action (FR-003). Implemented in `App` as
  incrementing its `sessionKey` state, which remounts `<GameScreen key={sessionKey}>` with the
  same `players` and a freshly built pool. `EndOfGameScreen` itself holds no pool/session logic.
- `onChangePlayers` — fired by the "Spelers wijzigen" action (FR-004). Implemented in `App` as
  `() => setPlayers(null)`, falling back to the existing `<PlayerSetupScreen>` branch, which
  self-pre-fills from `localStorage` (see research.md) — no data passed through this callback.

## State transitions (in `App`)

```
players != null, hasEnded=false   →(pool exhausted, next draw)→   players != null, hasEnded=true
        │                                                                    │
        │ (GameScreen key stays the same across ordinary draws)             │
        │                                                    onPlayAgain()  │  onChangePlayers()
        │                                                        ↓          ↓
        │                                          sessionKey += 1     players = null
        │                                          (GameScreen remounts,   (falls back to
        │                                           hasEnded resets to      PlayerSetupScreen,
        │                                           false, fresh pool)      pre-filled from storage)
```

No new state machine library or reducer is introduced — `hasEnded` (from `useDrawPile`, feature
004) and `sessionKey`/`players` (both plain `useState` in `App`) are sufficient.
