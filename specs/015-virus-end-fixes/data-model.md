# Data Model: Virus-eindegedrag repareren + nieuwe kaarten

No new entities or fields are introduced. This feature changes the *semantics* of one existing
field and adds new instances of two existing entities.

## `ActiveVirusEffect` (existing — `src/features/virus/virus.types.ts`)

| Field | Type | Change |
|---|---|---|
| `id` | `string` | Unchanged |
| `cardId` | `string` | Unchanged |
| `targetPlayerId` | `string` | Unchanged — still one effect per targeted player |
| `startedAtDraw` | `number` | Unchanged |
| `liftThreshold` | `number` | **Semantic change only, no shape change**: previously rolled independently per `ActiveVirusEffect` (per targeted player); now rolled once per `startEffects` call (per virus-card activation) and copied onto every effect created in that call. All effects from the same activation always carry the same `liftThreshold` value. |
| `assignmentGameDrawsSinceStart` | `number` | Unchanged |
| `status` | `'active' \| 'lifted'` | Unchanged |
| `liftReason` | `LiftReason \| null` | Unchanged |

**Invariant added by this feature**: for any set of `ActiveVirusEffect` records created by the
same `startEffects(cardId, targetPlayerIds, startedAtDraw)` call, `liftThreshold` is identical
across all of them. Combined with the existing invariant that `assignmentGameDrawsSinceStart`
advances in lockstep for all active effects on every assignment/game draw (see
`advanceOnAssignmentGameDraw`), this guarantees they transition `active` → `lifted` on the same
draw turn (FR-001).

## `Card` (existing — `src/features/cards/card.types.ts`)

No shape change. This feature adds new rows of existing shape to
`src/features/cards/data/badzwanzen-card-set.ts`, converted from `new-questions-raw.txt`:

| Field | Source of new values |
|---|---|
| `id` | New unique ids following the existing naming scheme in `badzwanzen-card-set.ts` |
| `type` | Derived from the raw line's prefix: `Spel` → `'game'`, `Virus` → `'virus'`, otherwise → `'assignment'` |
| `instructionText` | The raw line's text, with player-name placeholders (e.g. `naam`) rendered as `{player}` tokens where the raw text names a specific targeted player |
| `liftText` | Required only for `type: 'virus'` cards — bespoke, content-specific per Decision 4 in research.md; must be unique across the whole set (enforced by `validateCardSet`) |
| `targeting` | `{ kind: 'general' }` for iedereen-effects (e.g. "Virus iedereen moet..."); `{ kind: 'specific', count: N }` when the raw text names N specific player(s) (usually 1, occasionally 2, per lines like "kies 2 spelers") |

## `CardSet` (existing — `src/features/cards/data/badzwanzen-card-set.ts`)

No shape change; `cards` array grows by the converted entries above. Existing
`validateCardSet` constraints (≥80 cards, ≥4 virus cards, `{player}` token counts, unique virus
`liftText`) continue to gate the set — see `contracts/new-cards-format.md` for the authoring
contract new entries must satisfy.

## Out of scope

- `card-set-catalog.ts` (which sets exist, their names) — unchanged (FR-007).
- `seed-card-set.ts` (test fixture set) — unchanged (FR-007).
- `SessionCardPool` / `useDrawPile` state shape — unchanged; FR-003 is protected by a new test,
  not a new field.
