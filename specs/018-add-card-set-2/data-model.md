# Data Model: Tweede batch nieuwe vragen toevoegen aan de Badzwanzen-set

No new entities or fields are introduced. This feature adds new instances of one existing entity.

## `Card` (existing — `src/features/cards/card.types.ts`)

No shape change. This feature adds new rows of existing shape to
`src/features/cards/data/badzwanzen-card-set.ts`, converted from `raw-input.md`:

| Field | Source of new values |
|---|---|
| `id` | New unique ids following the existing naming scheme in `badzwanzen-card-set.ts` (continuing past `bz-opdracht-383`, `bz-spel-143`, `bz-virus-102`) |
| `type` | Derived from the raw line's leading word/shape: `Spel` → `'game'`, `Virus` → `'virus'`, otherwise (`Naam`, `Iedereen`, "De speler met...", "Wie ooit...") → `'assignment'` |
| `instructionText` | The raw line's text, with player-name placeholders (e.g. `naam`) rendered as `{player}` tokens where the raw text names a specific targeted player |
| `liftText` | Required only for `type: 'virus'` cards — bespoke, content-specific per Decision 4 in research.md; must be unique across the whole set (enforced by `validateCardSet`) |
| `targeting` | `{ kind: 'general' }` for iedereen-effects (e.g. "Virus iedereen moet...", "Iedereen die ooit...", "De speler met de meeste... neemt N strafpunten" — a group-wide check, not one pre-chosen player); `{ kind: 'specific', count: N }` when the raw text names N specific player(s) to choose at draw time (usually 1, occasionally 2) |

**New for this batch**: a raw line is only converted into a `Card` if it is not, in substance, a
duplicate of (a) another line already converted from this same batch, or (b) an existing card
already in `badzwanzenCardSet` — see research.md Decision 3. This is a filter applied during
conversion, not a new field or new runtime check.

## `CardSet` (existing — `src/features/cards/data/badzwanzen-card-set.ts`)

No shape change; `cards` array grows by the converted, deduplicated entries above. Existing
`validateCardSet` constraints (≥80 cards, ≥4 virus cards, `{player}` token counts, unique virus
`liftText`) continue to gate the set — see `contracts/new-cards-format.md` for the authoring
contract new entries must satisfy.

## Out of scope

- `card-set-catalog.ts` (which sets exist, their names) — unchanged (FR-007).
- `seed-card-set.ts` (test fixture set) — unchanged (FR-007).
- Any game logic (`useVirusEffects`, `useDrawPile`, session/UI components) — unchanged; this
  feature is data-only.
