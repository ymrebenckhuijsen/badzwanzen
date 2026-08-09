# Quickstart: End of Game Screen

Validates the two user stories end-to-end against real app state (not mocked).

## Prerequisites

```bash
npm install
```

## Automated validation

```bash
npm test    # Vitest + RTL — EndOfGameScreen.test.tsx and updated App.tsx coverage
npm run lint
npm run build
```

Expected: all pass, no new failures relative to `main` (features 001/004's existing 74 tests
still green).

## Manual run-through (US1 — see the end screen)

```bash
npm run dev
```

1. Add 2-3 players and start a session.
2. Keep pressing "VOLGENDE KAART →" until exactly one card remains, then draw it — confirm it is
   shown and resolved like any other card (no early end screen).
3. Press the draw button one more time — confirm the end-of-game screen now appears, listing
   every player added in step 1 (FR-001, FR-002).

Expected outcome: the transition from last-card to end-screen takes one extra tap, matching
SC-001/SC-002 (perceptibly instant, well under 2s since it's a local state change).

## Manual run-through (US2 — restart / change players)

From the end-of-game screen reached above:

4. Tap "Speel opnieuw" — confirm a new session starts immediately with the *same* players and a
   full fresh draw pool (draw count/remaining cards reset), satisfying SC-003 (one tap).
5. Repeat steps 2-3 to reach the end screen again, then tap "Spelers wijzigen" instead — confirm
   the app returns to the player setup screen, pre-filled with the same players from step 1,
   editable (add/remove) before starting again (FR-004).

## Notes

- No new `localStorage` keys or schema — step 5's pre-fill is feature 001's existing
  `badzwanzen:players` persistence, unchanged (see research.md).
- Reload/refresh mid-session or on the end screen is explicitly out of scope (spec.md
  Assumptions) — not part of this quickstart.
