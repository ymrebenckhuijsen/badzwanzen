---
Status: Approved
---

# Design Addendum: Add to Home Screen (PWA)

Extends [/DESIGN.md](../../DESIGN.md).

## Screens

No Stitch screen was generated for this feature — `generate_screen_from_text` timed out twice
(and no new screen appeared after ~4 minutes of `list_screens` polling across both attempts),
so this addendum was written manually per the FR-009 fallback path (developer choice: "Manual
design notes"). No screenshot/HTML mockup exists; the notes below use the existing "Vivid
Social" tokens from the root `/DESIGN.md` directly.

## What this feature adds or changes

Two small additions to the existing player-setup screen (`specs/001-add-players/DESIGN.md`),
not a new screen:

1. **"Zet op beginscherm" install button** — placed near the top of the player-setup screen,
   above or alongside the existing player-list content, so it's visible without scrolling on
   first load.
   - Uses the **Tactile Button** component style already defined in root `/DESIGN.md`: full
     pill shape (`rounded-full`), 4px offset bottom border for the "pressed" 3D look, high-
     diffusion drop shadow (`0px 10px 30px rgba(0,0,0,0.3)`).
   - Color: `primary` background (`#b4c5ff` / Electric Blue token) with `on-primary` text
     (`#002a78`), matching the existing primary-action button treatment used elsewhere in the
     app (e.g. the player-setup "add player" control) rather than inventing a new color.
   - Label: `label-bold` typography, plus a small home/download icon to the left of the text.
   - Hidden entirely per FR-005/FR-006 (already installed, standalone mode, or unsupported
     platform) — no disabled/greyed-out state is needed since the button simply isn't rendered.

2. **iOS "Installeren op iPhone" instructions** — a bottom-sheet/modal overlay, shown only when
   the button is tapped on iOS Safari (FR-007).
   - Uses the **Level 3 (Modals/Popups)** elevation treatment from root `/DESIGN.md`: heavy
     20px backdrop blur over the app content, `surface-container` background.
   - Content: a short title ("Installeren op iPhone") plus 3 numbered steps, each a small
     icon + one line of `body-md` text:
     1. Tik op het deel-icoon onderin Safari (Share icon)
     2. Kies "Zet op beginscherm" (Add-to-Home-Screen icon)
     3. Tik op "Voeg toe" (checkmark/Add icon)
   - Dismissible via a close (×) affordance in the corner or a tap outside the sheet — tapping
     away must not count as an install attempt, matching FR-009 (dismissal keeps the button
     available to try again).
   - No native install prompt exists on this path — this modal *is* the entire "install flow"
     for iOS Safari, so it doesn't need a confirm/cancel pair, just a way to close it.

No new colors, typography, or spacing tokens are introduced — both elements are assembled
entirely from the existing Vivid Social token set (see root `/DESIGN.md` frontmatter).

## Review history

- 2026-08-09: Stitch generation attempted twice (`generate_screen_from_text`), both timed out
  with no screen surfacing after polling `list_screens`. Developer chose the manual fallback.
- 2026-08-09: Manual design notes written and Approved by developer (no separate review round
  needed — notes derived directly from already-approved root design system component styles).
