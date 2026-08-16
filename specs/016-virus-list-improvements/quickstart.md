# Quickstart: Actieve-virussenlijst verbeteren

Manual validation guide for the three user stories, run against the real app (`npm run dev`) on
a mobile-width viewport, after implementation. No contracts/ dir — this feature has no external
interface and no data-authoring task (see plan.md's Project Structure; precedent: feature
011-max-active-viruses, same area, also skipped contracts/).

## Setup

```bash
npm install   # if not already done in this worktree
npm run dev
```

Open the app, add ≥2 players, pick a card set that includes both `general` (targets everyone)
and `specific` (targets named players) virus cards — the existing `badzwanzen` card set has
both.

## Scenario 1 — Shared "Iedereen" row (User Story 1, SC-001)

1. Draw cards until a `general`-targeting virus card is drawn (instruction text addresses
   everyone, e.g. "Iedereen die...").
2. Check the "ACTIEVE VIRUSSEN" section: **expect exactly one row**, labeled "Iedereen"
   (group icon), not one row per player.
3. Keep drawing until a `specific`-targeting virus also becomes active (different card).
   **Expect**: the "Iedereen" row and the specific-player row(s) both visible, clearly separate,
   neither duplicated (Acceptance Scenario 3).

## Scenario 2 — Max 3 concurrent viruses (User Story 2, SC-002)

1. Draw cards until 3 distinct virus cards are simultaneously active (check "ACTIEVE VIRUSSEN"
   count of distinct virus rows/cardIds — general + specific mixed counts toward the same cap).
2. Keep drawing (non-virus cards will draw normally). **Expect**: no 4th distinct virus ever
   becomes active — any 4th virus card drawn is skipped/deferred (existing behavior, unchanged
   plumbing) until one of the 3 active viruses lifts.
3. Let one virus lift (via its existing threshold mechanic). **Expect**: a 4th virus can now
   become active on a subsequent draw.

## Scenario 3 — Tap a row to reveal virus text (User Story 3, SC-003)

1. With at least one specific-player virus row and the shared "Iedereen" row both visible, tap
   the specific-player row. **Expect**: the row expands to show that virus's original
   `instructionText` (not the `liftText`/end-message wording).
2. Tap the "Iedereen" row. **Expect**: same reveal behavior, showing that general virus's
   `instructionText`.
3. Get one player to accumulate 2 simultaneous specific-targeting virus effects (existing ×N
   badge case). Tap that player's row. **Expect**: instruction texts for **both** active virus
   effects are shown, not just one (FR-005).
4. Tap an already-expanded row again. **Expect**: it collapses back (toggle behavior).

## Automated checks

```bash
npm test        # Vitest — extend ActiveVirusList.test.tsx + useDrawPile.test.ts per tasks.md
npm run lint
npm run build    # tsc -b && vite build — confirms no type errors from the new cardSet prop
```

All three must pass green before the feature is considered done, per Constitution Principle II
(TDD) and V (Quality Gates).
