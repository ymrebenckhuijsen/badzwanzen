# Phase 1 Data Model: Actieve-virussenlijst verbeteren

No new persisted entities and no changes to existing entity shapes (`ActiveVirusEffect`,
`Card`, `CardSet` all stay as defined in `virus.types.ts` / `card.types.ts`). This feature adds
one derived, render-only grouping and one piece of local UI state inside `ActiveVirusList`.

## Existing entities used (unchanged)

- **`ActiveVirusEffect`** (`src/features/virus/virus.types.ts`) — `id`, `cardId`,
  `targetPlayerId`, `status: 'active' | 'lifted'`, etc. Already carries everything needed:
  `cardId` to look up the originating `Card`, `targetPlayerId` for per-player grouping.
- **`Card`** (`src/features/cards/card.types.ts`) — `targeting.kind: 'general' | 'specific'`
  (distinguishes "iedereen" virus cards) and `instructionText` (the text User Story 3 reveals).
- **`CardSet`** (`src/features/cards/card.types.ts`) — `cards: Card[]`, the lookup source for
  the above; becomes a new prop on `ActiveVirusList` (see research.md).
- **`Player`** (`src/features/players/types.ts`) — unchanged, still used for per-player row
  names/avatars.

## Derived view model (computed inside `ActiveVirusList`, not persisted)

```text
ActiveVirusRow =
  | { kind: 'group'; cardIds: string[]; instructionTexts: string[] }
  | { kind: 'player'; player: Player; cardIds: string[]; instructionTexts: string[] }
```

- One `ActiveVirusRow` per rendered `<li>`. Built each render from `effects` (filtered to
  `status === 'active'`) + `cardSet.cards` (for `targeting.kind` and `instructionText`) +
  `players` (for per-player rows' names).
- `kind: 'group'` rows: one per distinct general-virus `cardId` currently active — NOT one row
  for "all general virus effects combined." Two different simultaneous "iedereen" viruses (e.g.
  under the raised cap, up to 3 total active viruses) still render as two separate shared rows,
  each labeled "Iedereen," per spec.md Acceptance Scenario 3's "naast elkaar, zonder door elkaar
  te lopen" requirement — grouping only collapses per-player duplication of the *same* virus,
  never merges *different* viruses together.
- `kind: 'player'` rows: unchanged grouping from today — one per player with ≥1 active
  `specific`-targeting effect, `cardIds`/`instructionTexts` covering all of that player's
  simultaneous effects (existing ×N badge case, FR-005).
- `instructionTexts` is plain `string[]`, not deduplicated — if the same virus text should ever
  appear twice for one row (not currently possible given `liftText`/`cardId` uniqueness
  constraints in `validateCardSet.ts`) it would still show once per distinct `cardId`, matching
  the "instructietekst van elk van die virussen" wording in FR-005.

## Local UI state (not derived from props, resets on remount)

```text
expandedRowKeys: Set<string>   // row key = `group:${cardId}` or `player:${player.id}`
```

- Toggled on row tap; controls whether that row's `instructionTexts` render beneath it.
- No persistence, no lifting to `App.tsx` — scoped entirely to `ActiveVirusList`'s own state
  (see research.md's Tap-to-reveal decision).

## Validation rules

None new — `Card.targeting.kind` and `instructionText` are already required, non-optional fields
validated at card-set load time by `validateCardSet.ts` (unchanged by this feature, per spec.md
Edge Cases' note that the 4-card virus minimum is a separate, unaffected rule).

## State transitions

None new. Row presence/absence still follows `ActiveVirusEffect.status` exactly as today (a row
disappears the next render after its effect(s) all transition to `'lifted'`, per spec.md's Edge
Cases note on this feature not requiring a live-disappearing text view).
