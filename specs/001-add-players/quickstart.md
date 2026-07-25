# Quickstart: Spelers toevoegen

Validates that the "add players" screen works end-to-end, per the acceptance scenarios in
[spec.md](./spec.md). Assumes the project has already been scaffolded and this feature has
been implemented (see `tasks.md` for the setup steps if not).

## Prerequisites

- Node.js and npm installed.
- Dependencies installed: `npm install`.

## Run automated checks

```bash
npm run lint
npm test
```

Expected: lint passes with no errors; all tests pass, including the ones covering
`Player` add/remove/duplicate/max-20 behavior and `localStorage` persistence (see
[data-model.md](./data-model.md)).

## Manual validation

```bash
npm run dev
```

Open the printed local URL (works on a phone via the same Wi-Fi using the "Network" URL Vite
prints, or in a desktop browser at a mobile viewport width).

Walk through each scenario and confirm the expected outcome:

1. **Add a player** (US1): tap "+", type a name, confirm → name appears in the list.
2. **Add a second player** (US1): repeat → both names are visible together.
3. **Reject empty name** (US1, FR-007): tap "+", confirm without typing anything → no player
   is added.
4. **Reject duplicate name** (US1, FR-011): add a name that's already in the list → rejected,
   with a message that the name is already in use.
5. **See the full list** (US2): add 3+ players → all of them stay visible at once.
6. **Remove a player** (FR-008): remove one previously-added player → it disappears from the
   list, the rest remain.
7. **Max players** (FR-012): add 20 players → the 21st add attempt is rejected / the "+"
   control is disabled, with a message that the maximum is reached.
8. **Persistence across refresh** (FR-013): add a few players, refresh the page (before
   starting the game) → the same players are still listed.
9. **Play button gating** (US3, FR-010): with 0 or 1 players, the play button is disabled or
   hidden; add a 2nd player → it becomes available.
10. **Start the game** (US3): with ≥2 players, press the play button → the app proceeds past
    this screen with the current player list (hand-off point to the — separately specified —
    game itself).

If all ten checks behave as described, the feature meets its spec.
