# Data Model: Add to Home Screen (PWA)

Neither entity below is application/game state (no player/session data is involved). Both are
documented here because they drive this feature's behavior and are referenced by
`contracts/`.

## App Manifest

A static JSON document (`public/manifest.webmanifest`), not runtime state. Describes the
installable app to the OS/browser (FR-001).

| Field | Value | Notes |
|---|---|---|
| `name` | `"Badzwanzen"` | Full app name, shown during install and on some home-screen long-press menus. |
| `short_name` | `"Badzwanzen"` | Shown under the home-screen icon (kept equal to `name` — it's already short). |
| `start_url` | `"/"` | Launches at the app root, same entry point as the browser version. |
| `display` | `"standalone"` | No browser chrome on launch (FR-008). |
| `background_color` | `#0b1326` | Matches the Vivid Social design system's `surface`/`background` token — shown as the splash-screen background before the app's own CSS paints. |
| `theme_color` | `#0b1326` | Same token — colors the OS status bar/task-switcher chrome. |
| `icons` | see below | Sizes required by Android/Chrome + iOS/Safari (FR-002). |

`icons` array (all `type: "image/png"`, `src` under `/icons/`):

| `sizes` | `src` | `purpose` | Why |
|---|---|---|---|
| `192x192` | `/icons/icon-192.png` | `any` | Minimum Chrome/Android install-eligibility size. |
| `512x512` | `/icons/icon-512.png` | `any` | Splash-screen / high-res Android size. |
| `512x512` | `/icons/icon-512-maskable.png` | `maskable` | Android adaptive-icon masking (safe-zone padding around the mark). |

The iOS home-screen icon (`apple-touch-icon.png`, 180×180) is **not** part of the manifest's
`icons` array — iOS Safari ignores the manifest for its icon and instead reads a
`<link rel="apple-touch-icon">` tag directly from `index.html` (see
`contracts/manifest-contract.md`).

## Install Availability State

In-memory UI state (not persisted), owned by the `useInstallPrompt` hook. Drives whether/what
`InstallButton` renders (FR-003, FR-005, FR-006, FR-007).

```
type InstallAvailabilityState =
  | 'unknown'      // initial, before mount effects run
  | 'promptable'   // beforeinstallprompt fired — tapping triggers the native prompt
  | 'ios-manual'   // iOS Safari, not standalone — tapping shows manual instructions
  | 'installed'    // appinstalled fired, or already running standalone
  | 'unsupported'  // no install signal available and not iOS — button stays hidden
```

**Transitions**:

| From | Event | To | Notes |
|---|---|---|---|
| `unknown` | mount: `matchMedia('(display-mode: standalone)').matches` or `navigator.standalone` is true | `installed` | Covers "opened directly from the home-screen icon" (spec Edge Cases). |
| `unknown` | mount: iOS UA detected, not standalone | `ios-manual` | iOS Safari never fires `beforeinstallprompt`. |
| `unknown` | mount: neither of the above | `unsupported` | Resting default; may still transition below if the event arrives late. |
| `unknown` / `unsupported` | `beforeinstallprompt` fires | `promptable` | The event can fire after mount, not only before it. |
| `promptable` | user accepts the native prompt | `installed` | Followed by the browser's own `appinstalled` event, which is also handled directly. |
| `promptable` | user dismisses the native prompt | `promptable` | Stays available per FR-009 — no state change, button remains. |
| `promptable` / `ios-manual` / `unsupported` | `appinstalled` fires | `installed` | Catches installs triggered outside this hook's own button too. |

**Rendering rule** (`InstallButton`): render nothing when state is `unknown`, `installed`, or
`unsupported`; render the button in `promptable` (tap → native `prompt()`) and `ios-manual` (tap
→ opens `IosInstallInstructions`).
