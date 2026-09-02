# Quickstart: validating Tweede batch nieuwe vragen toevoegen aan de Badzwanzen-set

## Prerequisites

- Node/npm installed (see repo root `package.json` for tooling versions).
- Dependencies installed: `npm install` (once per worktree).

## Automated validation (primary)

```bash
npm test
```

Expected, once implementation is complete:

- `src/features/cards/data/badzwanzen-card-set.test.ts` — asserts the extended
  `badzwanzenCardSet` still passes `validateCardSet` with zero errors (card count ≥80, virus
  count ≥4, correct `{player}` token counts, unique virus `liftText`s) — proving
  FR-001/002/003/005/008/SC-001/SC-003; a card-count floor assertion proving the batch actually
  landed (mirroring the feature-015 precedent); spot-checks of a handful of specific converted
  lines from `raw-input.md`; non-generic, content-specific `liftText` checks for the new virus
  cards (feature-015 pattern) — proving FR-004; and a new no-byte-identical-`instructionText`
  assertion across the whole set — a cheap automated floor check for FR-006/SC-005 (the
  substantive, meaning-based dedup judgment itself happens during conversion, not at test time —
  see research.md Decision 3).

```bash
npm run lint
```

Expected: no new lint errors from the changed/added files.

## Manual validation (play-through, mirrors "playtest live before declaring done")

1. `npm run dev`, open the app locally.
2. Set up a session with 3+ players and choose the Badzwanzen card set.
3. Play forward, drawing cards, until several of the newly added cards are drawn (spot-check
   against `raw-input.md`) — confirm `{player}` names substitute correctly and the Dutch text
   reads naturally.
4. Keep drawing until a newly added viruskaart is drawn; keep playing until it lifts, and confirm
   the end message (`VirusLiftCard`) clearly refers to that virus's specific effect, not a
   generic "virus voorbij" text.
5. Confirm the card set selection screen (feature 010) still shows exactly the same list of sets
   as before this feature — no new set added, only "Badzwanzen" grew.
6. Spot-check for obvious duplicate questions across a few sessions — two different sessions
   should not repeatedly surface what is clearly the same question worded two different ways
   (qualitative check on SC-005; the automated test only catches byte-identical duplicates).
