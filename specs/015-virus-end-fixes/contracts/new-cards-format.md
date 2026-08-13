# Contract: converting `new-questions-raw.txt` into `Card` entries

This is the authoring contract the `/speckit-tasks` → `/speckit-implement` conversion work (User
Story 3/4) must satisfy when turning each paragraph of `new-questions-raw.txt` into an entry
appended to `badzwanzenCards` in `src/features/cards/data/badzwanzen-card-set.ts`. It documents
the existing, already-in-use format (features 010/014) — no new schema is introduced.

## Shape (from `src/features/cards/card.types.ts`, unchanged)

```ts
interface Card {
  id: string
  type: 'assignment' | 'game' | 'virus'
  instructionText: string
  liftText?: string // required, and only meaningful, for type: 'virus'
  targeting: { kind: 'general' } | { kind: 'specific'; count: number }
}
```

## Field rules

- **`id`**: continue the existing per-type, zero-padded counters found at the end of
  `badzwanzenCards` today: `bz-opdracht-317`, `bz-opdracht-318`, … ; `bz-spel-095`, `bz-spel-096`,
  … ; `bz-virus-072`, `bz-virus-073`, … (current max ids at plan time: `bz-opdracht-316`,
  `bz-spel-094`, `bz-virus-071` — confirm the actual max at implementation time in case other
  work landed first).
- **`type`**: derived from the raw line's leading word, matching the existing convention:
  - Starts with `Spel` (case-insensitive) → `'game'`.
  - Starts with `Virus` (case-insensitive) → `'virus'`.
  - Everything else (including lines starting with `Naam`, `Als je ooit...`, or a bare
    statement) → `'assignment'`.
- **`targeting`**:
  - `{ kind: 'general' }` when the raw text addresses everyone at once (e.g. "Iedereen die
    ooit...", "Virus iedereen moet...", "De speler met de meeste apps...", "Virus naam mag
    vanaf nu...ieder woord meer is X strafpunten" where "naam" clearly refers to whichever
    player is speaking at the time rather than one fixed target — judge from context the same
    way existing cards like `bz-opdracht-002`/`bz-opdracht-003` do).
  - `{ kind: 'specific', count: N }` when the raw text names N specific player(s) to be chosen
    at draw time (e.g. "Naam geef 3 strafpunten aan..." → `count: 1`; "kies 2 spelers..." →
    `count: 2`).
- **`instructionText`**: the raw line's text, cleaned up (trimmed whitespace, normal Dutch
  punctuation/capitalization), with `{player}` tokens substituted in for each specifically
  targeted player mention — exactly `targeting.count` tokens for `specific` cards, exactly `0`
  for `general` cards (enforced by `validateCardSet`).
- **`liftText`** (virus cards only): a **bespoke, content-specific** end message referencing the
  concrete effect that is ending (per research.md Decision 4) — never a generic "het virus is
  voorbij" — containing **exactly one** `{player}` token, and **not equal to any other card's
  `liftText`** in the set (both enforced by `validateCardSet`).

## Acceptance check

A conversion batch is done when, after appending it to `badzwanzenCards`:

1. `npm test` passes, including `badzwanzen-card-set.test.ts` and `validateCardSet.test.ts`.
2. `validateCardSet(badzwanzenCardSet)` returns an empty array (no errors) — this is already
   asserted by the existing test suite, not a new check.
3. Every original line from `new-questions-raw.txt` maps to exactly one new `Card` (no line
   silently dropped; if a line is truly unusable as a card, that must be a deliberate, documented
   exception, not a silent omission).
