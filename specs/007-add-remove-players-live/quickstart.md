# Quickstart: Spelers tijdens het lopende spel toevoegen en verwijderen

Validates all three user stories end-to-end against real app state (not mocked).

## Prerequisites

```bash
npm install
```

## Automated validation

```bash
npm test    # Vitest + RTL — usePlayers.test.ts, LivePlayerList.test.tsx,
            # LivePlayerManagementScreen.test.tsx, updated App.test.tsx coverage
npm run lint
npm run build
```

Expected: all pass, no new failures relative to `main`.

## Manual run-through (US1 — add a late player during the game)

```bash
npm run dev
```

1. Add 3 players, pick a card set, and start a session.
2. Draw a card or two so the session is clearly "in progress."
3. Tap the new "Spelers" entry point in `GameScreen`'s header — confirm the "Spelers Beheer"
   view opens, showing the 3 existing players (FR-011).
4. Tap "+", enter a new name, confirm — confirm the new player appears in the list immediately,
   with no reset of the draw pool or existing progress (US1 AC1).
5. Try adding a name that duplicates an existing active player — confirm it's rejected with the
   same "Deze naam bestaat al." message used pre-game (US1 AC2, FR-002).
6. Close the "Spelers Beheer" view and keep drawing cards — confirm the newly added player can
   now be selected as a target on a future draw (US1 AC4; not guaranteed on the very next draw,
   since target selection is random — draw a few times if needed).

## Manual run-through (US2 — remove a player mid-game)

From the "Spelers Beheer" view (4+ active players, following on from US1):

7. Tap a player's delete icon — confirm the row switches to an inline "Verwijder {name}?
   Ja／Nee" state rather than removing immediately (US2 AC2, FR-008).
8. Tap "Nee" — confirm the player is still listed, unchanged.
9. Tap the delete icon again, then "Ja" — confirm the player disappears from the active list
   immediately (US2 AC1).
10. Close the view and keep drawing — confirm the removed player is never selected as a target
    again for the rest of the session (US2 AC3 / SC-003).
11. Repeat removal until only 2 active players remain — confirm both remaining players' delete
    icons are now disabled, and no further removal is possible (FR-009).

## Manual run-through (US3 — live-updating visible list)

12. With the view open, add and remove players a few times in a row (staying at/above the
    2-player floor) — confirm the visible list and the "SPELERS (n/20)" count update
    immediately after each action, with no page reload needed (US3 AC1).

## Notes

- No new `localStorage` key — this feature reuses the existing `badzwanzen:players` key
  (`src/lib/storage.ts`), now including any `status: 'removed'` players from the current
  session (see data-model.md). Reload mid-game after an add/remove: the player list itself
  persists correctly, but reloading still drops back to the setup screen today — that gap
  pre-dates this feature and is out of scope (see research.md's "out of scope" section).
- FR-013 (name reuse after removal) is covered by step 4 if you reuse a name from step 9/10 —
  add it as a follow-up manual check if not already exercised.
- Scoring / how a "vroegtijdig gestopt" player is shown at end-of-game is explicitly out of
  scope (separate scoring feature) — not part of this quickstart.
