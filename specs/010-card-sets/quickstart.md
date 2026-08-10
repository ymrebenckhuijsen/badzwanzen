# Quickstart: Kaartensets

Validation guide for this feature once implemented. Assumes features 001 (player setup) and 004
(card draw loop) are merged and functioning. See [data-model.md](./data-model.md) for entity
shapes and [research.md](./research.md) for design decisions referenced below.

## Prerequisites

- `npm install`
- `npm run dev` (or `npm test` for the automated scenarios below, run non-interactively via
  Vitest)
- The default `cardSetCatalog` as shipped by this feature: the existing seed test set plus at
  least one additional "real" `CardSet` with a different `name` and its own ≥80 cards / ≥4
  virus cards, added purely for exercising these scenarios (a throwaway fixture set is fine —
  it does not need to be real question content).

## Scenario 1 — Choose a card set at session setup (User Story 1, FR-001, FR-002, FR-004)

1. Add at least 2 players and proceed past `PlayerSetupScreen`.
2. **Expect**: a "Kaartenset kiezen" screen appears, listing the name of every set in
   `cardSetCatalog` (SC-001 — this should take well under 10 seconds to complete).
3. Choose a set other than the pre-selected default, then start the game.
4. **Expect**: throughout the session, every drawn card comes from the chosen set only — draw
   until the pool is exhausted (or draw a representative sample) and confirm no card id from any
   other catalog entry ever appears (SC-002).

## Scenario 2 — The seed test set is always available (User Story 2, FR-003)

1. With the catalog containing the seed set plus one or more "real" sets, view the selection
   screen.
2. **Expect**: the seed test set's name is present in the list regardless of how many other
   sets exist (SC-003).
3. Select it and start a session.
4. **Expect**: the session behaves exactly as feature 004 already specifies/tests — same
   seed content, same rules, no behavioral difference from before this feature existed.

## Scenario 3 — A single available set skips the choice step (FR-007)

1. Temporarily reduce `cardSetCatalog` to just one entry (e.g. only the seed set).
2. Proceed past `PlayerSetupScreen`.
3. **Expect**: no selection screen is shown — the one available set is used automatically, and
   the flow goes straight to the game screen.

## Scenario 4 — Only valid, uniquely-named sets are offered (FR-006, FR-008)

This one runs as an automated test, not a manual play session — it's the build/test-time gate
(research.md "validity/uniqueness enforced at build time" decision), not a runtime filter.

1. Run `npm test` (`card-set-catalog.test.ts`).
2. **Expect**: it passes only when every entry in `cardSetCatalog` independently passes
   `validateCardSet` with no errors, and no two entries share a `name`.
3. As a negative check during development: temporarily add a second catalog entry that reuses
   an existing set's `name`, or that has fewer than 80 cards.
4. **Expect**: the test fails, naming the offending set — confirming a broken/duplicate set
   could never reach `main` (Constitution Principle V), which is what makes FR-006/FR-008 true
   for whatever ships.

## Scenario 5 — The last chosen set is remembered (User Story 3, FR-010)

1. On the selection screen, choose a specific non-default set and start a session.
2. **Reload the browser page** (a genuinely fresh app session — not the in-app "SPEEL OPNIEUW"
   button, see Scenario 7b below, which is a different, non-reloading path).
3. Proceed past `PlayerSetupScreen` again (`localStorage` still has the player list from before).
4. **Expect**: the selection screen shows the previously chosen set already selected (SC-005),
   with every other set still tappable to switch.

## Scenario 6 — Falls back to the seed set if the remembered set no longer exists (FR-011)

1. Repeat Scenario 5 steps 1–2 (a non-default set is remembered).
2. Before reloading, remove that set from `cardSetCatalog` (simulating an app update that
   dropped it) and rebuild/reload.
3. **Expect**: the selection screen defaults to the seed test set instead of erroring or leaving
   nothing selected.

## Scenario 7 — Set choice is locked for the session, including across "Speel opnieuw" (Edge Cases, FR-012)

### 7a — No mid-session switch

1. Choose a set and start a game session.
2. **Expect**: there is no control anywhere in `GameScreen` to change the active card set — the
   only way to play with a different set is to end the current session and set up a new one.

### 7b — "SPEEL OPNIEUW" keeps the same set; "Spelers wijzigen" re-prompts

Feature 008's end-of-game screen offers two ways out of a finished session — they behave
differently with respect to the card-set choice (research.md "Speel opnieuw reuses the locked
card set" decision):

1. Choose a non-default set, play a session to the end-of-game screen.
2. Tap **"SPEEL OPNIEUW"**.
3. **Expect**: a new session starts immediately with the same players — the "Kaartenset kiezen"
   screen does **not** reappear, and the new session's cards still come exclusively from the
   same previously-chosen set.
4. Play that session to the end-of-game screen again, this time tap **"Spelers wijzigen"**.
5. **Expect**: this returns to `PlayerSetupScreen`. After confirming players again, the
   "Kaartenset kiezen" screen **does** reappear (pre-selected per Scenario 5, but changeable) —
   this is the "setting up a new session" path FR-012 refers to.

## Notes

- These scenarios are the acceptance criteria already stated in `spec.md`; this file is a
  running order to validate them together, not a replacement for the automated Vitest/RTL tests
  written per Constitution Principle II. Each scenario above should correspond to one or more
  automated tests written **before** the implementing code (Red-Green-Refactor).
- None of these scenarios touch feature 004's draw-loop mechanics (pool building, targeting,
  virus lifecycle) beyond confirming they still receive the *selected* set instead of always
  the seed set — that mechanics themselves are unchanged and already covered by feature 004's
  own quickstart.
