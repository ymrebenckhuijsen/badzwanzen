# Quickstart: Verifying Landscape-modus ondersteuning

Automated tests (Vitest + RTL) only assert that the right Tailwind classes are present (see
[research.md](./research.md) Decision 5) — they cannot verify real rendered layout. This
walkthrough is the actual verification that the requirements in `spec.md` hold, using browser
DevTools device emulation.

## Prerequisites

```bash
npm install   # if not already done
npm run dev   # starts Vite dev server, note the printed local URL
```

Open the printed URL in Chrome (or any browser with responsive/device-emulation DevTools), then
open DevTools → toggle device toolbar → set a custom viewport so you can freely change both
orientation and height (rather than picking a fixed device preset).

## Scenario A — User Story 1: full game loop in landscape (P1)

1. Set viewport to phone landscape, e.g. **740×360**.
2. Add 2+ players, pick a card set, start the game.
3. Draw cards repeatedly until a virus card appears; confirm **"volgende kaart"** stays visible
   and clickable after each draw, with no horizontal scroll and no clipped text.
4. Let the virus reach its end condition; confirm the end-of-virus message and its confirm
   button are fully visible/clickable.
5. Trigger enough viruses to reach the 4-active cap; confirm `ActiveVirusList` shows all 4 (or
   scrolls to reveal all 4) without clipping.
6. **Expected**: every control reachable, no clipped text, at 740×360 and also at the lower
   bound **~640×320** (FR-008's minimum).

## Scenario B — User Story 2: setup screens in landscape (P2)

1. Set viewport to phone landscape (e.g. 740×360).
2. On the player setup screen, add several player names; confirm the input and "start" button
   stay reachable, including with DevTools' on-screen-keyboard simulation active if available.
3. On the card-set selection screen, scroll through sets and confirm the continue action stays
   reachable.
4. Start a game, open the live player-management screen (mid-game), add and remove a player;
   confirm the list and close button remain visible/reachable.
5. **Expected**: all three screens fully usable without rotating back to portrait.

## Scenario C — User Story 3: rotate mid-session without losing state (P3)

1. Start in portrait (e.g. 390×844). Add players, start a game, draw a few cards including at
   least one virus so a virus is active.
2. Switch the viewport to landscape (e.g. 844×390) without reloading the page.
3. **Expected**: the same current card, same active players, and same active virus effects are
   still shown — now laid out for landscape — with no reset, no reload, no lost state (SC-002).
4. Rotate back to portrait; confirm the portrait layout is pixel-identical to how it looked
   before rotating away (FR-007, SC-004) — no regression from this feature's changes.

## Edge cases to spot-check

- **Very low landscape height** (~320–360px, e.g. 640×320): confirm content that doesn't fit
  becomes scrollable, never clipped (FR-003/FR-008).
- **Tablet landscape** (e.g. 1024×768 or wider): confirm the layout doesn't stretch edge-to-edge
  or look mostly empty — the column should be wider than portrait's `max-w-md` but still bounded
  (FR-005, tablet edge case).
- **Portrait regression check**: with the DevTools viewport back to a standard portrait phone
  size, compare each screen against its pre-feature appearance (screenshots in
  `specs/*/design/*.png` from prior features where available) to confirm zero visual change
  (FR-007, SC-004).
