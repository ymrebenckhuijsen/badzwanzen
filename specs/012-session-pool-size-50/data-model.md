# Phase 1 Data Model: Kleinere sessie-kaartpoel (50-55 kaarten)

No new entities, fields, or state transitions are introduced by this feature. It changes the
*bounds* of an existing derived value; the entity itself (from feature 004) is unchanged.

## Sessie-trekstapel (Session Draw Pool) — existing entity, bounds updated

Defined in `src/features/cards/card.types.ts` (`SessionCardPool`) and produced by
`buildSessionCardPool.ts`:

| Field | Type | Change in this feature |
|---|---|---|
| `poolCardIds` | `string[]` | Length now randomly drawn from `[50, 55]` inclusive (previously `[60, 80]`); no change to element type or how ids are chosen within that count |
| `remainingCardIds` | `string[]` | Unchanged — initialized as a copy of `poolCardIds` |
| `hasEnded` | `boolean` | Unchanged — initialized `false` |

**Validation rule, updated**: `poolCardIds.length` MUST be `>= 50 && <= 55` (was `>= 60 && <=
80`), and MUST still contain `>= 4` ids whose card is `type === 'virus'` (unchanged, `spec.md`
FR-002).

**Relationships**: unchanged — still built from exactly one `CardSet` (feature 010's selected
set), still consumed one id at a time by the existing draw hook until exhausted (feature 004/008).

No other entity (`Card`, `CardSet`, `Player`, session/game state) is read, written, or
restructured by this feature.
