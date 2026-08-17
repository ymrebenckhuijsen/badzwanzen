# Quickstart: Kortere, begrensde virusduur

Validates SC-001 / SC-002 and the acceptance scenarios in [spec.md](./spec.md).

## Prerequisites

- Dependencies installed: `npm install`
- On branch `017-virus-duration`

## Automated validation (primary)

```bash
npm run test -- src/features/virus/useVirusEffects.test.ts
```

Expected, after implementation:
- Every `liftThreshold` assertion passes with bounds `[15, 20]` inclusive (not `[10, 50]`).
- The "same `liftThreshold` for every effect in one `startEffects` call" test still passes
  (shared "iedereen" duration, FR-004, unchanged).
- The forced-end-on-empty-deck test still passes unchanged (lifts regardless of
  `liftThreshold`).

Statistical spot-check for SC-001/SC-002 (run range distribution over many rolls — remove
after confirming manually, this is not a permanent test):

```ts
const seen = new Set<number>()
for (let i = 0; i < 2000; i++) seen.add(randomLiftThreshold())
// seen should be a subset of {15,16,17,18,19,20}, and typically cover most/all of them
```

## Manual validation (secondary — end-to-end feel)

1. `npm run dev`, open the app, start a session, add players.
2. Draw cards until a virus activates on a player.
3. Keep drawing opdracht-/spelkaarten (not other virus cards) and count how many are drawn
   for that specific player before the virus lifts.
4. Confirm the count is between 15 and 20 inclusive (acceptance scenarios 1-3).
5. Repeat a few times across different sessions/virus activations to see the count vary within
   that range (SC-002) — it should not be the same number every time.
6. (Optional, feature 016 regression) Trigger an "iedereen" virus and confirm all affected
   players' rows lift together, at the same shared draw count within [15, 20] (edge case in
   spec.md).
