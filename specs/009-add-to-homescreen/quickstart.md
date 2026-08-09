# Quickstart: Add to Home Screen (PWA)

Validation guide for this feature — run these after `/speckit-implement`, not as part of it.

## Prerequisites

- `npm install` already run.
- Icons generated once (see "Generating icons" below) and committed under `public/icons/`.

## Generating icons (one-time, macOS)

`favicon.svg`'s artwork sits on a transparent, non-square (48×46) canvas — unsuitable to
rasterize directly, since iOS flattens transparency unpredictably and a non-square source
distorts under `-s`. Instead, wrap the existing artwork in a square, opaque source SVG once,
then rasterize that at each required size:

```bash
mkdir -p public/icons
python3 - <<'PY'
import re
src = open('public/favicon.svg').read()
inner = re.match(r'^<svg[^>]*>(.*)</svg>\s*$', src, re.S).group(1)
# Centers the 48x46 mark at 60% width inside a 512x512 square on the Vivid Social
# background token (#0b1326) — the same padding also satisfies Android's maskable
# safe zone, so one square source covers icon-512, icon-512-maskable, and (at
# smaller -s values) icon-192/apple-touch-icon without a separate maskable variant.
square = f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0b1326"/><g transform="translate(102.4 108.8) scale(6.4)">{inner}</g></svg>'
open('public/icons/icon-source-square.svg', 'w').write(square)
PY

qlmanage -t -s 192 -o public/icons public/icons/icon-source-square.svg && mv public/icons/icon-source-square.svg.png public/icons/icon-192.png
qlmanage -t -s 512 -o public/icons public/icons/icon-source-square.svg && mv public/icons/icon-source-square.svg.png public/icons/icon-512.png
cp public/icons/icon-512.png public/icons/icon-512-maskable.png
qlmanage -t -s 180 -o public/icons public/icons/icon-source-square.svg && mv public/icons/icon-source-square.svg.png public/icons/apple-touch-icon.png
rm public/icons/icon-source-square.svg
```

See research.md Decision 2 for why this manual, documented step replaces an npm-based
generator. Re-run this whole block if `favicon.svg`'s artwork ever changes — the four PNGs are
the committed source of truth, not the (deleted) intermediate square SVG.

## Automated checks

```bash
npm run test    # useInstallPrompt / InstallButton / IosInstallInstructions unit + component tests
npm run lint
npm run build
```

Expected: all green, no new failures.

## Manual verification (installability)

1. `npm run build && npm run preview` (manifest/icons only work over the built output or a
   deployed HTTPS URL — `beforeinstallprompt` requires a valid manifest + reachable icons).
2. Open the preview URL in Chrome desktop. DevTools → **Application** → **Manifest**: confirm
   name, icons, and `display: standalone` all resolve with no errors listed.
3. Still in DevTools, run a Lighthouse **PWA** audit (or the "Installability" section) —
   confirm no missing-manifest/missing-icon errors (SC-001, SC-003 groundwork).
4. Trigger install via the omnibox install icon (desktop) or DevTools' manual
   `beforeinstallprompt` simulation — confirm the in-app "Zet op beginscherm" button also
   appears and its tap opens the same native prompt (FR-003, FR-004).
5. Accept the prompt — confirm the button disappears afterward (FR-005) and the launched window
   has no address bar (FR-008, SC-003).

## Manual verification (Android, real device or emulator, if available)

1. Load the deployed URL in Chrome for Android.
2. Start a timer, then tap the in-app "Zet op beginscherm" button → confirm the native install
   sheet appears → accept → stop the timer once a Badzwanzen icon appears on the home screen.
   **Must be under 10 seconds** (SC-001 as literally defined — not just "a few seconds").
   Confirm the icon also launches the app standalone.
3. Reload the app in a regular browser tab post-install → confirm the button no longer appears
   (FR-005).

## Manual verification (iOS Safari)

1. Load the deployed URL in Safari on iPhone (or Safari's iOS simulator/responsive mode with
   the iOS user-agent).
2. Tap "Zet op beginscherm" → confirm the manual bottom-sheet instructions appear (not a native
   prompt) — share icon → "Zet op beginscherm" → "Voeg toe" (FR-007, SC-004).
3. Follow the real Safari share-sheet flow → confirm the icon appears on the home screen and
   launches standalone.

## Manual verification (unsupported / dismiss paths)

1. Load the app in a browser without install support (e.g. desktop Firefox) → confirm no
   install button appears anywhere (FR-006, SC-002).
2. On a supported browser, trigger the prompt and dismiss/cancel it → confirm the app remains
   fully usable and the button is still present for a retry (FR-009).
3. Open the app directly from an already-installed home-screen icon → confirm the button does
   not appear, regardless of entry point (spec Edge Cases).
