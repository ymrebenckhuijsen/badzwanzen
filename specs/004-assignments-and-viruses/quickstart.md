# Quickstart: Assignment, Game and Virus Card Loop

Validation guide for this feature once implemented. Assumes feature 001 (player setup) is
merged and a session already has a player list. See [data-model.md](./data-model.md) for entity
shapes and [research.md](./research.md) for design decisions referenced below.

## Prerequisites

- `npm install`
- `npm run dev` (or `npm test` for the scenarios below, run non-interactively via Vitest)
- A session with at least 2 players (from feature 001) and a seeded card set containing at
  least 80 cards, of which at least 4 are type "virus" (FR-019), including: one "general"
  assignment card, one "specific" (count 1) game card with a `{player}` token in its text, at
  least one "specific" (count 1) virus card with a `{player}` token in both its
  `instructionText` and its `liftText`, and one "specific, count: 3" card (of any type) to
  exercise Scenario 3 below — each with a distinct `penaltyPoints` value.

## Scenario 1 — Build the session's card pool (User Story 5, FR-019, FR-020)

1. Start a new game session from the seeded card set.
2. **Expect**: a draw pool is created containing a randomly chosen number of cards between 60
   and 80 (inclusive), all drawn from the seeded set, with at least 4 of them being virus cards
   (SC-007).
3. Start a second session from the same card set.
4. **Expect**: the new pool's size and/or specific composition may differ from the first
   session's — each session's pool is independently randomized (research.md "guarantee then
   fill" decision).

## Scenario 2 — Draw and resolve an assignment card (User Story 1, FR-001–FR-007)

1. Trigger a draw from the session's pool.
2. **Expect**: the card's type and instruction text are shown (SC-001, SC-002). For a "general"
   card, a general/all-players indicator is shown. For a "specific" card, its `{player}` tokens
   are shown replaced by the resolved target players' names, in order (FR-005) — and that
   rendered text is the *only* place target names appear; no separate "Targets: ..." list or
   badge is additionally shown (FR-004).
3. Mark the card **failed**.
4. **Expect**: the card's `penaltyPoints` are added to every targeted player's total exactly
   once (FR-007).
5. Draw again, resolve as **success**.
6. **Expect**: no penalty points are added.

## Scenario 3 — A specific card requiring too many targets is discarded and redrawn (FR-003, clarified 2026-07-26)

1. Use a session with exactly 2 players and a pool containing a "specific, count: 3" card.
2. Draw until that card comes up.
3. **Expect**: it is never shown to the group — no instruction text, no penalty, no virus
   effect starts, and it does not advance any active virus effect's
   `assignmentGameDrawsSinceStart`. The system immediately draws and shows the next card
   instead, with no manual action needed to skip past it.
4. **Expect**: the discarded card's id is still removed from the pool's remaining cards (it
   counts toward exhausting the pool, same as an ordinarily-resolved draw) — it is never
   revisited later in the same session (data-model.md "Discarded draws").

## Scenario 4 — Exhaust the pool and end the game (User Story 6, FR-021)

1. Draw every card in the session's pool (built in Scenario 1) exactly once (including any
   discarded per Scenario 3).
2. Attempt to draw one more time.
3. **Expect**: the system refuses — no card is produced, and the session is shown as ended.
   Unlike an earlier draft of this feature, there is **no** reshuffle; the pool is not
   replenished.

## Scenario 5 — Start and track an active virus effect (User Story 2, FR-008–FR-012)

1. Draw the virus card.
2. **Expect**: no success/fail prompt is shown; instead an active virus effect appears for its
   resolved target player(s), with no penalty points applied yet (FR-008).
3. Draw several more assignment/game cards.
4. **Expect**: the active effect remains visible throughout, and (per data-model.md) its
   internal `assignmentGameDrawsSinceStart` advances with each one.
5. Draw the same virus card again (or another virus card) targeting the same player.
6. **Expect**: a second, independent active effect appears for that player — the first effect
   is untouched (FR-012; research.md "one effect per targeted player" decision).

## Scenario 6 — Report a virus violation (User Story 3, FR-013–FR-015)

1. With an active virus effect from Scenario 5, report a rule violation against it.
2. **Expect**: that effect's `penaltyPoints` are added to its target player's total.
3. Report a second violation against the same still-active effect.
4. **Expect**: the points are added again (FR-014).
5. Drive the effect to lift (Scenario 7), then attempt to report a violation against it.
6. **Expect**: the system refuses — no violation is recorded (FR-015).

## Scenario 7 — Automatic virus lift shows a lift card (User Story 4, FR-009–FR-010)

1. Start a fresh virus effect and note its randomly assigned `liftThreshold` (≥10). There is no
   upper bound on this value (confirmed 2026-07-26) — a large threshold is valid and simply
   means that effect will likely be force-lifted at session end instead (Scenario 8).
2. Draw exactly that many subsequent assignment/game cards (virus draws in between do not
   count, per spec Assumptions).
3. **Expect**: on reaching the threshold, a lift card is shown using that virus's own defined
   `liftText`, with its one `{player}` token replaced by the affected player's name (SC-004),
   and the effect no longer appears among that player's active effects (other active effects on
   the same player, if any, remain shown).
4. Attempt to report a violation against the just-lifted effect.
5. **Expect**: refused, same as Scenario 6 step 6.

## Scenario 8 — Viruses are force-lifted when the game ends (User Story 6, FR-022)

1. Start one or more virus effects that are still well short of their `liftThreshold`.
2. Continue drawing until the session's pool is exhausted (Scenario 4).
3. **Expect**: every still-active effect is automatically lifted as the session ends, each
   showing its own lift card (same mechanism as Scenario 7), regardless of how little progress
   it had made toward its threshold (SC-008).
4. If more than one effect was force-lifted, **expect** their lift cards to appear one at a
   time, ordered oldest-started-first (research.md decision) — not as a single combined message.

## Scenario 9 — Multiple concurrent effects fit a mobile screen (FR-011, SC-006)

1. Start virus effects targeting at least two different players, plus a second effect on one
   of those same players (three effects total, per Scenario 5 step 6).
2. View the active-effects display on a mobile-phone-sized viewport (~360-430px wide).
3. **Expect**: the display stays legible and usable — e.g. one row per affected player with a
   count badge for players with multiple effects, rather than one full-detail block per raw
   effect (research.md "per-player summary" decision) — even as more effects are added.

## Scenario 10 — Card set validation (User Story 5 support, FR-017, FR-018, FR-019)

This one runs as an automated test, not a manual play session — it's the build/test-time gate,
not a runtime behavior.

1. Run `npm test` (`seed-card-set.test.ts`, which calls `validateCardSet` against the real seed
   `CardSet`).
2. **Expect**: the test passes when every "specific" card's `{player}` token count in
   `instructionText` matches its `targeting.count`, every "general" card has zero tokens, every
   virus card's `liftText` has exactly one token, and the set has ≥80 cards total with ≥4 virus
   cards.
3. As negative checks during development of the validator itself (`validateCardSet.test.ts`,
   using fixture data, not the real seed set): construct (a) a "specific, count: 2" card with
   only one `{player}` token in `instructionText`, (b) a virus card whose `liftText` has zero or
   two `{player}` tokens, and (c) a card set with only 70 cards or only 2 virus cards.
4. **Expect**: `validateCardSet` returns a `ValidationError` for each case, naming the offending
   card id or the set-level shortfall — this is the mechanism that would have caught each
   mismatch before it reached players.

## Notes

- These scenarios are the acceptance criteria already stated in `spec.md`; this file is a
  running order to validate them together, not a replacement for the automated Vitest/RTL tests
  written per Constitution Principle II. Each scenario above should correspond to one or more
  automated tests written **before** the implementing code (Red-Green-Refactor).
