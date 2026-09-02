# Contract: converting `raw-input.md` into `Card` entries

This is the authoring contract the `/speckit-tasks` → `/speckit-implement` conversion work (User
Stories 1-3) must satisfy when turning each line of `raw-input.md` into an entry appended to
`badzwanzenCards` in `src/features/cards/data/badzwanzen-card-set.ts`. It documents the existing,
already-in-use format (features 010/014/015) plus one new rule specific to this batch
(deduplication) — no new schema is introduced.

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
  `badzwanzenCards` today: `bz-opdracht-384`, `bz-opdracht-385`, … ; `bz-spel-144`, `bz-spel-145`,
  … ; `bz-virus-103`, `bz-virus-104`, … (current max ids at plan time: `bz-opdracht-383`,
  `bz-spel-143`, `bz-virus-102` — confirm the actual max at implementation time in case other
  work landed first).
- **`type`**: derived from the raw line's leading word, matching the existing convention:
  - Starts with `Spel` (case-insensitive) → `'game'`.
  - Starts with `Virus` (case-insensitive) → `'virus'`.
  - Everything else (including lines starting with `Naam`, `Iedereen`, "De speler met...", "Wie
    ooit...", or a bare statement) → `'assignment'`.
- **`targeting`**:
  - `{ kind: 'general' }` when the raw text addresses everyone at once or resolves to a
    group-wide check rather than one pre-chosen player (e.g. "Iedereen die ooit...", "Virus
    iedereen moet...", "De speler met de meeste... neemt N strafpunten", "Virus naam mag vanaf
    nu..." where "naam" clearly refers to whichever player is speaking/targeted at draw time
    rather than being a second, separately-chosen player — judge from context the same way
    existing cards do).
  - `{ kind: 'specific', count: N }` when the raw text names N specific player(s) to be chosen at
    draw time (e.g. "Naam geef 3 strafpunten aan..." → `count: 1`; "kies twee spelers..." →
    `count: 2`).
- **`instructionText`**: the raw line's text, cleaned up (trimmed whitespace, normal Dutch
  punctuation/capitalization), with `{player}` tokens substituted in for each specifically
  targeted player mention — exactly `targeting.count` tokens for `specific` cards, exactly `0`
  for `general` cards (enforced by `validateCardSet`).
- **`liftText`** (virus cards only): a **bespoke, content-specific** end message referencing the
  concrete effect that is ending (per research.md Decision 4) — never a generic "het virus is
  voorbij" — containing **exactly one** `{player}` token for `specific`-targeted virus cards, or
  **zero** `{player}` tokens for `general`-targeted virus cards, and **not equal to any other
  card's `liftText`** in the set (both enforced by `validateCardSet`).

## New rule for this batch: deduplication (FR-006)

A raw line is **not** converted into a new `Card` (i.e. is skipped) when it is, in substance, a
duplicate of either:

1. Another raw line already converted from this same batch (the three numbered lists in
   `raw-input.md` overlap heavily), or
2. An existing card already present in `badzwanzenCardSet` (from features 010/014/015 or earlier
   in this same batch's conversion).

Judge duplication by meaning, not exact string match — see research.md Decision 3 for the
category-vs-template distinction (same fill-in-the-blank template with a different category or
number, e.g. "5 dingen uit een rugzak" vs. "5 dingen uit een apotheek", is **not** a duplicate).
The very last raw line ("Doe met zn allen een ronde Maxen... als er dubbele zijn voeg ze dan niet
toe") is itself the meta-instruction behind this rule, not a card to convert.

## Acceptance check

A conversion batch is done when, after appending it to `badzwanzenCards`:

1. `npm test` passes, including `badzwanzen-card-set.test.ts` and `validateCardSet.test.ts`.
2. `validateCardSet(badzwanzenCardSet)` returns an empty array (no errors) — this is already
   asserted by the existing test suite, not a new check.
3. Every raw line from `raw-input.md` either maps to exactly one new `Card`, or was deliberately
   skipped as a duplicate (per the rule above) or as the closing meta-instruction line — no line
   silently dropped for any other reason.
4. No two cards in the final `badzwanzenCardSet.cards` array have byte-identical
   `instructionText` (a cheap automated floor check on top of the substantive, manually-judged
   dedup pass).
