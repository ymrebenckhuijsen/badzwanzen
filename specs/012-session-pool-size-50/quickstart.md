# Quickstart: Kleinere sessie-kaartpoel (50-55 kaarten)

Validates spec.md's User Story 1 (SC-001/SC-002) end-to-end: every newly built session draw pool
contains 50-55 cards, still with at least 4 virus cards.

## Prerequisites

- Repo dependencies installed (`npm install`)
- On branch `012-session-pool-size-50`, with the implementation task(s) from `tasks.md`
  completed (constants edited in `buildSessionCardPool.ts`)

## Automated check (primary validation)

```bash
npm test -- buildSessionCardPool
```

Expected: all tests in `src/features/cards/buildSessionCardPool.test.ts` pass, including the
updated boundary test asserting every generated pool's `poolCardIds.length` is `>= 50` and
`<= 55` across repeated random draws — see data-model.md's validation rule. This alone proves
FR-001 through FR-004.

## Manual/browser check (optional, confirms end-to-end wiring)

1. `npm run dev`, open the app
2. Set up a session (add players, pick a card set — seed or "Badzwanzen")
3. Start the game and draw cards one at a time until the end-of-game screen (feature 008)
   appears
4. Count the cards drawn during that session: expect a number between 50 and 55 (previously
   60-80)

Expected: the session ends within that smaller range, with normal end-of-game behavior
otherwise unchanged (feature 008 screen, "play again" produces a new session with its own
independently-random 50-55 count per spec.md Acceptance Scenario 3).

## Out of scope for this quickstart

- Card-set-level validity (`validateCardSet.ts`'s `MIN_CARDS = 80`) is unchanged and not
  re-verified here — see research.md's rationale for why it's untouched.
