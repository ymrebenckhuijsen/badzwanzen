# Phase 1 Data Model: Max Active Viruses

This feature introduces no new entities and no new persisted fields. It adds one validation
constraint on an existing field, and one derived (computed, not stored) value.

## Existing entities touched

### `Card` (`src/features/cards/card.types.ts`) — constraint added, shape unchanged

| Field | Type | Change |
|---|---|---|
| `liftText` | `string \| undefined` | **New constraint**: for cards where `type === 'virus'`, `liftText` MUST be unique across every other virus card in the same `CardSet`. (The existing rule — exactly one `{player}` token — is unchanged and still applies.) |

No new field is added; this is a cross-card uniqueness constraint over the card set as a whole,
not a per-card shape change. Enforced by `validateCardSet` (see Contracts/behavior below), not
by the TypeScript type (uniqueness across a collection isn't expressible in a single record's
type).

### `ActiveVirusEffect` (`src/features/virus/virus.types.ts`) — unchanged

No fields change. Referenced here only because the new derived value below is computed from it.

## New derived value (not persisted)

### Active virus count

- **Definition**: the number of *distinct* `cardId`s among `ActiveVirusEffect` entries whose
  `status` is `'active'`.
- **Computed as**: `new Set(effects.filter(e => e.status === 'active').map(e => e.cardId)).size`
- **Owner**: computed in `GameScreen` (`src/App.tsx`) from `useVirusEffects`'s existing
  `effects` state; passed into `useDrawPile` as a plain number parameter.
- **Why distinct-by-`cardId`, not effect count**: a single virus card targeting every player
  produces one `ActiveVirusEffect` per player, but FR-005 requires it to count as exactly one
  virus toward the 4-virus cap.
- **Lifecycle**: recomputed on every render from `effects`; nothing new to initialize, migrate,
  or reset between sessions — it naturally returns to 0 when `GameScreen` remounts for a new
  session (same as `effects` itself today).

## Validation rule addition

### `validateCardSet` (`src/features/cards/validateCardSet.ts`)

Alongside the existing per-card checks, add a whole-set check:

- For all cards where `type === 'virus'`, group by `liftText`. Any group with more than one
  card produces one `ValidationError` per duplicate (or one error listing all offending card
  ids — implementation detail for `/speckit-tasks`/implementation, not the data model), so a
  card set with duplicate virus end messages fails validation the same way it already fails for
  a too-small pool or too few virus cards.

## State transitions

None introduced. The existing `ActiveVirusEffect.status` transition (`'active' → 'lifted'`) and
`useDrawPile`'s draw/exhaust lifecycle are unchanged; this feature only adds a *precondition* to
one existing transition (a virus card can only start a new active effect if the active virus
count is currently below 4) and adds a *deferral* behavior (a virus card that fails that
precondition remains in the pool rather than being consumed).
