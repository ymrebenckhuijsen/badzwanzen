# Contract: live player add/remove (`usePlayers` extensions + `LivePlayerList`/`LivePlayerManagementScreen`)

## `usePlayers()` hook (extended)

```ts
function usePlayers(): {
  players: Player[] // full array, including any status: 'removed'
  addPlayer: (name: string) => AddPlayerResult
  removePlayer: (id: string) => void // pre-game only, unchanged: splices + reindexes
  retirePlayer: (id: string) => RemoveLivePlayerResult // NEW, live-game only
}
```

**Contract**:
- `addPlayer`'s duplicate/max-20 checks consider only players with `status !== 'removed'`
  (FR-013) — calling it with a name matching a `removed` player succeeds.
- `addPlayer` never sets `status` on the created player object (left `undefined`, i.e.
  implicitly active) — same object shape whether called pre-game or during a live game
  (FR-004: no special-cased starting status for late joiners).
- `retirePlayer` never removes a player from the array or from `localStorage` — it only ever
  flips `status` to `'removed'`, preserving `id`, `name`, `order` (FR-010).
- `retirePlayer` returns `{ ok: false, reason: 'min-players' }` and makes no state change when
  fewer than 3 active (`status !== 'removed'`) players currently exist (FR-009 floor: refuses
  to drop below 2). Returns `{ ok: true }` and persists otherwise.
- `retirePlayer` is idempotent-safe against a double-call race (e.g. two rapid taps): a second
  call on an already-`removed` id is a no-op that still returns `{ ok: true }` (the invariant —
  "this player will not be drawn again" — already holds; there is nothing to reject).
- Both `addPlayer` and `retirePlayer` call `setPlayers()` (`src/lib/storage.ts`) synchronously
  on success, so a page reload immediately after either call reflects the change (FR-012).

## `<LivePlayerList players onRetire minPlayersReached />`

**Contract**:
- `players` prop is expected pre-filtered to active players by the caller (`status !==
  'removed'` players never appear as rows) — a removed player disappears from this list
  immediately (US2 AC1), not just visually struck through.
- Tapping a row's delete icon does not call `onRetire` directly — it sets local
  `confirmingId` to that row's player id, switching that single row to an inline
  "Verwijder {name}? Ja／Nee" confirmation state (FR-008). Other rows are unaffected.
- "Ja" calls `onRetire(id)` and clears `confirmingId`. If the result is
  `{ ok: false, reason: 'min-players' }` (a race against another removal), the row silently
  reverts to its normal (non-confirming) state — no error is surfaced, since the UI already
  disables removal at the floor (`minPlayersReached`) and this path should be unreachable in
  practice, not a user-facing failure mode.
- "Nee" clears `confirmingId` without calling `onRetire` — no state change (US2 AC2's
  confirmation-before-action requirement).
- When `minPlayersReached` is `true` (i.e. exactly 2 active players), every row's delete icon
  is rendered `disabled` and does not open the confirmation state on tap (FR-009).

## `<LivePlayerManagementScreen players onAdd onRetire onClose />`

**Contract**:
- Internally derives `activePlayers = players.filter(p => p.status !== 'removed')` and passes
  that (not the raw `players` prop) to `<LivePlayerList>` and to the "SPELERS (n/20)" count.
- Renders `<AddPlayerControl onAdd={onAdd} />` unmodified (FR-001: identical "+" flow to
  pre-game).
- Renders "Minimaal 2 nodig" and computes `minPlayersReached = activePlayers.length <= 2` for
  `<LivePlayerList>`.
- `onClose` returns control to the card-draw view (`GameScreen`'s `view` state) without any
  side effect of its own — all persistence already happened at the point `onAdd`/`onRetire`
  were called (FR-011: the list reflects live state at all times, not just on close).

## `GameScreen` (modified) — entry point + player-array wiring

**Contract**:
- Adds a header icon/button (next to the "Badzwanzen" title) that sets local
  `view: 'card' | 'players'` to `'players'`. Visible/reachable at all times while `GameScreen`
  is mounted, including while a card or virus-lift is displayed (FR-011).
- Receives a `players`-mutating capability from `App` (a lifted `addPlayer`/`retirePlayer` pair
  or the full `usePlayers()` return value — implementation detail left to tasks/implementation,
  not fixed here) rather than only the read-only `players` prop it has today.
- Passes `activePlayers` (filtered, `status !== 'removed'`) — not the raw array — into
  `useDrawPile`, `resolveTargets` (via `useDrawPile`), `<DrawnCardView>`, `<ActiveVirusList>`,
  and `<VirusLiftCard>`. A player removed mid-session is excluded from target selection starting
  with the very next `draw()` call (FR-006/FR-007 per research.md's reinterpretation).
- `<EndOfGameScreen>` continues to receive the full `players` array as before (out of scope for
  this feature per spec.md Assumptions — how removed players are reflected at end-of-game is
  the separate scoring feature's concern).
