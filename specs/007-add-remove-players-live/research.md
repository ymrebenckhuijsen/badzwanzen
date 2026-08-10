# Phase 0 Research: Spelers tijdens het lopende spel toevoegen en verwijderen

## Decision: reinterpret "turn rotation" against feature 004's real (turn-less) model

**Decision**: Feature 007's spec assumes a "beurtrotatie" (turn-rotation) model — new players join
"at the end of the rotation," and removing the player currently "at turn" auto-advances to the
next. Feature 004, as actually specified and implemented, has no such concept: every card draw
calls `resolveTargets(card, players)` (`src/features/cards/resolveTargets.ts`), which picks
target(s) at random from the live `players` array at draw time. There is no "current drawer"
role and no per-player turn pointer anywhere in the codebase (`grep -rn "turn\|beurt" src`
returns zero matches; confirmed against `specs/004-assignments-and-viruses/spec.md` Assumptions
and `data-model.md`).

Confirmed with the developer (2026-08-10): reinterpret the turn-rotation-dependent requirements
against the real mechanic rather than building new turn-tracking state:

- **FR-003/FR-004** ("new player joins at the end of the rotation, with the same starting
  status as at game start"): satisfied by simply adding the new player to the live `players`
  array with no special-cased status — the next `draw()` call already treats every player in
  that array as equally eligible for random target selection. There is no literal "end of
  rotation" position to insert at, so this requirement is met vacuously: the new player is
  never retroactively assigned targets for draws that already happened, and is included in the
  random pool starting from the next draw.
- **FR-006/FR-007** ("remove player from rotation immediately; if it's currently their turn,
  auto-advance without further action"): satisfied by excluding a removed player from the
  `players` array passed to `resolveTargets`/`useDrawPile` from the next draw onward. Since
  there is no "current turn" pointer, there is nothing to auto-advance — removal takes effect
  immediately and completely for all future draws, which is the observable behavior FR-007
  actually cares about (the removed player is never called on again), even though the literal
  "auto-advance" mechanism described doesn't apply.
- **FR-009** (disable removal below 2 active players): unaffected by this reinterpretation —
  applies directly to the count of active (non-removed) players.

**Rationale**: Building a real turn-order/current-drawer concept into feature 004's engine was
explicitly rejected by the developer as out of scope for this feature — the spec's
turn-rotation language was written before feature 004 existed and doesn't match what was
actually built. Reinterpreting is the smallest change consistent with the spec's actual intent
(a late player should play going forward without disrupting anyone already in the session; a
removed player should never be called on again) and with Constitution Principle III
(Simplicity & YAGNI).

**Alternatives considered**:
- *Build real turn-order state into feature 004's draw engine*: rejected — large, speculative
  scope increase not requested by any current feature, contradicts YAGNI.
- *Send spec.md back through `/speckit-clarify`/re-specify before planning*: rejected by the
  developer as the path forward this round; the reinterpretation is recorded here instead so
  the mismatch is documented rather than silently assumed.

## Decision: player status field, not array deletion, for live removal

**Decision**: Add an optional `status?: 'active' | 'removed'` field to `Player`
(`src/features/players/types.ts`). Pre-game removal (`PlayerSetupScreen`, `usePlayers.removePlayer`)
keeps its existing splice-and-reindex behavior unchanged — a player removed before the game
starts was never part of a session and has no history to retain. Live-game removal (this
feature) instead sets `status: 'removed'` on the player, leaving them in the array — satisfying
FR-010 (participation history retained, marked "vroegtijdig gestopt") without needing a
separate history structure.

**Rationale**: `usePlayers.removePlayer`'s existing splice+reindex behavior is pinned by
`usePlayers.test.ts` and used by the pre-game setup screen where "remove" genuinely means
"delete" — reusing it unmodified for live removal would lose the history FR-010 requires.
A status field is the minimal change (Constitution III) that lets one array continue serving as
both "who's still playing" (filtered view) and "who's ever been part of this session" (full
array), and reuses the existing single storage key (`badzwanzen:players`) rather than adding a
second persisted structure.

**Alternatives considered**:
- *Separate "removed player log" array/storage key*: rejected — duplicates state that's a
  simple derived filter away, adds a second thing to keep in sync and persist (violates
  Simplicity & YAGNI).
- *Splice removed players out and drop history entirely*: rejected — directly contradicts
  FR-010, which was a deliberate (non-clarification) requirement in spec.md.

## Decision: duplicate-name and max-20 validation scope to active players only

**Decision**: `usePlayers.addPlayer`'s duplicate check (`current.some((p) => p.name === trimmed)`)
and the 20-player cap must be updated to consider only players with `status !== 'removed'`.

**Rationale**: FR-013 explicitly requires that a new player may reuse a name freed up by an
earlier removal within the same session. Since removed players now stay in the array (previous
decision), the existing all-players duplicate/cap checks would incorrectly block this unless
scoped to active players.

**Alternatives considered**: none meaningfully different — this is a direct, required
consequence of the status-field decision above, not an independent design choice.

## Decision: reuse `usePlayers`/`AddPlayerControl` as-is; extend, don't duplicate, `PlayerList`

**Decision**: `AddPlayerControl` (the "+" input flow) and `usePlayers().addPlayer` are reused
unmodified for live-game adds (FR-001 explicitly requires the same flow). `PlayerList` is not
reused unmodified — its single-click, no-confirmation delete button doesn't satisfy FR-008
(explicit confirmation before removal) or FR-009 (disabling removal at the 2-player floor). A
new component, `LivePlayerList`, is added alongside it for the live-game context, sharing
`PlayerList`'s row layout/styling but adding a per-row "pending confirmation" state
(tap delete → row shows "Verwijder {name}? Ja/Nee" inline, per the approved DESIGN.md mockup)
and a `disabled` state on the delete affordance once only 2 active players remain.

**Rationale**: Constitution III (Simplicity & YAGNI) argues against forking a component for a
single differing behavior, but the confirmation-state requirement (FR-008) is a genuinely
different interaction contract (`onRequestRemove`/`onConfirmRemove`/`onCancelRemove` vs. a bare
`onRemove`), not a styling tweak — extending `PlayerList`'s props to awkwardly serve both the
instant-delete pre-game case and the confirm-then-delete live case would make one component do
two distinct jobs. A small new component that reuses the same row markup/classes is the
smaller net change.

**Alternatives considered**:
- *Add a `requireConfirmation` prop to `PlayerList` itself*: rejected — forces every consumer
  (including the pre-game screen, whose tests pin the current instant-delete behavior) to
  reason about a mode it doesn't use, and doubles the component's test surface for one feature.

## Decision: entry point into the live player-management view from `GameScreen`

**Decision**: Add a small header button/icon to `GameScreen` (next to the existing "Badzwanzen"
title) that toggles a local `view: 'card' | 'players'` state. When `'players'`, `GameScreen`
renders the new live player-management screen (title "Spelers", per DESIGN.md) instead of the
card-draw UI; a close/back action returns `view` to `'card'`. No routing library, no new
top-level `App` state, no persistent bottom navigation bar (the DESIGN.md mockup's "Play /
Players / Rules" tab bar is accepted as a mockup detail, not a requirement to build — this
feature has no "Rules" screen and adding a persistent bottom nav for a single toggle is out of
scope).

**Rationale**: `App.tsx` has no router/state-machine today — screens are plain conditional
renders. A local toggle inside `GameScreen` is the smallest change consistent with that
existing pattern (Constitution III) and satisfies FR-011 (player list visible/reachable at any
time during the game) without introducing new architecture.

**Alternatives considered**:
- *Modal/overlay on top of the card view*: rejected — the approved design shows a full
  replacement screen, not an overlay; a full-screen swap is also simpler to implement/test with
  existing conditional-render patterns.
- *New persistent bottom nav bar (Play/Players/Rules) as shown in the mockup*: rejected as
  scope creep — no "Rules" screen exists or is specified by any current feature; DESIGN.md's
  addendum already flags this mockup as approved "as-is" with accepted cosmetic gaps (see its
  Review history), not a literal build spec for chrome outside this feature's own screen.

## Decision: persistence wiring

**Decision**: The live roster (with `status`) is persisted via the existing
`setPlayers()`/`getPlayers()` pair in `src/lib/storage.ts` (same `badzwanzen:players` key used
pre-game) — no new storage key. Because `GameScreen` currently receives `players` as a
read-only prop from `App`'s own `useState<Player[] | null>` (not itself backed by
`usePlayers`/storage after the initial hand-off from `PlayerSetupScreen`), `App` needs a setter
threaded down to `GameScreen` so live add/remove calls can both update the in-memory array (for
`useDrawPile`/`resolveTargets` on subsequent draws) and call `setPlayers()` to persist it.

**Rationale**: Reusing the single existing storage key satisfies FR-012 with no new persistence
mechanism (Constitution III/IV — client-side `localStorage` only, no new infra). Threading a
setter down is the minimal wiring change; introducing `usePlayers()` directly inside
`GameScreen` instead was considered but rejected below.

**Alternatives considered**:
- *Mount a second `usePlayers()` instance inside `GameScreen`*: rejected — would read the same
  storage key into a second, independently-mutable React state, risking the two copies (App's
  and GameScreen's) drifting out of sync in the same page session. A single lifted setter keeps
  one source of truth.

## Out of scope / explicitly deferred (per spec.md Assumptions)

- **Page-refresh mid-game recovery**: spec.md raises this as an edge case but does not require
  a fix; the codebase today already loses all `GameScreen` state (draw pool, virus effects) on
  refresh regardless of this feature. FR-012 only requires that the *player list* changes
  survive a refresh (they will, via `localStorage`) — a refreshed page still restarts at
  `PlayerSetupScreen` today, that gap is pre-existing and not this feature's to close.
- **Scoring / end-of-game display of "vroegtijdig gestopt" players**: explicitly out of scope
  per spec.md Assumptions — a separate, not-yet-specified scoring feature owns how removed
  players are reflected in results.
