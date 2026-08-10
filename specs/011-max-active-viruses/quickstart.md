# Quickstart: Max Active Viruses

Validation guide for this feature once implemented. Two parts: the automated test suite
(primary, per Constitution II's TDD requirement) and a manual playtest scenario to feel the cap
in real gameplay.

## Prerequisites

- Dependencies installed (`npm install`, already done in this worktree)
- On branch `011-max-active-viruses`

## 1. Automated verification (primary)

```bash
npm test
```

Expected, once implementation is complete:

- `src/features/cards/useDrawPile.test.ts` — new cases pass:
  - drawing a virus card while fewer than 4 different viruses are active starts it normally
  - drawing a virus card while exactly 4 different viruses are already active skips it and
    returns the next eligible card instead, without removing the skipped card from the pool
  - a virus card skipped this way can still be drawn successfully once one of the 4 active
    viruses ends (active count drops below 4)
  - a virus targeting every player still only counts as one toward the 4-virus cap
- `src/features/cards/validateCardSet.test.ts` — new cases pass:
  - a card set where two virus cards share the same `liftText` fails validation with a
    descriptive error
  - a card set where every virus card has a unique `liftText` passes
- Full existing suite (74+ tests as of feature 004) stays green — no regressions.

Per Constitution II, these test cases must exist and be observed failing (red) before the
corresponding implementation is written, then pass (green).

```bash
npm run lint
```

Expected: no new lint errors.

## 2. Manual playtest (secondary, real-gameplay feel)

1. `npm run dev`, open the app, add 3+ players, select the Badzwanzen card set.
2. Draw cards repeatedly (VOLGENDE KAART) until 4 different viruses show as active in the
   active-virus list.
3. Keep drawing. Confirm:
   - No 5th different virus ever becomes active while those 4 remain active.
   - Play continues smoothly to the next card each time — no error, pause, or visibly "dead"
     draw.
4. Keep drawing until one of the 4 active viruses reaches its natural end.
5. Confirm the end-of-virus card shown names/describes that specific virus's effect, and that
   its wording is visibly different from what any of the other 3 active viruses' end cards
   would say (spot-check against `badzwanzen-card-set.ts`'s `liftText` values for those cards).
6. Continue drawing; confirm a virus card can now become the 4th active virus again (cap
   re-opened after step 4's natural end).

Expected outcome: at every point in the session, the active-virus list shows at most 4 distinct
viruses, and every end-of-virus message you see during the session reads as specific to that
virus rather than a generic "a virus ended" notice.
