# Quickstart: validating Virus-eindegedrag repareren + nieuwe kaarten

## Prerequisites

- Node/npm installed (see repo root `package.json` for tooling versions).
- Dependencies installed: `npm install` (once per worktree).

## Automated validation (primary)

```bash
npm test
```

Expected, once implementation is complete:

- `src/features/virus/useVirusEffects.test.ts` — includes a case asserting that when
  `startEffects` is called with `targetPlayerIds.length > 1` (a "general"/iedereen virus), all
  resulting `ActiveVirusEffect`s share the same `liftThreshold`, and that
  `advanceOnAssignmentGameDraw` transitions them all from `active` to `lifted` on the same call
  (same draw turn) — proving FR-001/SC-001.
- `src/features/cards/useDrawPile.test.ts` — includes a regression case asserting
  `remainingCount` is unaffected by virus-lift events (`advanceOnAssignmentGameDraw` /
  `forceLiftAll`), only by `draw()` calls — proving FR-003/SC-002.
- `src/features/cards/data/badzwanzen-card-set.test.ts` — asserts the extended
  `badzwanzenCardSet` still passes `validateCardSet` with zero errors (card count ≥80, virus
  count ≥4, correct `{player}` token counts, unique virus `liftText`s) — proving
  FR-004/005/006/SC-003/SC-004.

```bash
npm run lint
```

Expected: no new lint errors from the changed/added files.

## Manual validation (play-through, mirrors "playtest live before declaring done")

1. `npm run dev`, open the app locally.
2. Set up a session with 3+ players and choose the Badzwanzen card set.
3. Play forward, drawing cards, until a viruskaart with "iedereen" targeting is drawn (an
   `instructionText` addressing everyone, e.g. one of the "Virus iedereen moet..." cards).
4. Keep drawing assignment/game cards and confirm in the "Actieve virussen" list
   (`ActiveVirusList`) that **all** affected players disappear from the active list on the
   **same** draw — not staggered across several draws.
5. Confirm the app still shows one `VirusLiftCard` end message per affected player in the lift
   queue (acknowledging each in turn is expected UI behavior per spec Assumptions — this is not
   a bug), and that each end message text clearly refers to the virus's specific effect.
6. Keep playing until the draw pile empties naturally; confirm the number of cards you visibly
   drew (assignments + games + viruses) matches the expected session pool size (feature 012:
   50–55), i.e. the virus-lift screens you acknowledged along the way were not counted as extra
   draws.
7. Spot-check a handful of the newly added cards (from `new-questions-raw.txt`) appear during
   play with correctly substituted `{player}` names and sensible Dutch text.
