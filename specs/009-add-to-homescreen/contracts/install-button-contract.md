# Contract: `useInstallPrompt` hook + `InstallButton`/`IosInstallInstructions` components

## `useInstallPrompt()` hook

```ts
function useInstallPrompt(): {
  state: InstallAvailabilityState // see data-model.md
  promptInstall: () => Promise<void> // no-op unless state === 'promptable'
}
```

**Contract**:
- Registers `beforeinstallprompt` and `appinstalled` listeners on `window` in a `useEffect` on
  mount, cleans them up on unmount.
- On mount, also synchronously checks `matchMedia('(display-mode: standalone)')`/
  `navigator.standalone` and `navigator.userAgent` to set the initial state per the transition
  table in data-model.md — the hook must not flash a button that a synchronous check would have
  already ruled out (e.g. never render `promptable` for one frame when already `installed`).
- `promptInstall()` calls `.prompt()` on the captured `beforeinstallprompt` event and awaits
  `.userChoice`; on `'accepted'` it does not need to force a state change itself — the
  browser's own `appinstalled` event (already listened for) drives the transition to
  `installed`. On `'dismissed'`, state stays `promptable` (FR-009) — no action needed since no
  state change was made.
- Never throws on missing/unsupported APIs (e.g. `navigator.standalone` is undefined outside
  Safari) — all checks use optional chaining / existence checks first.

## `<InstallButton />`

**Contract**:
- Takes no required props; reads state from `useInstallPrompt()` internally.
- Renders nothing (`null`) when state is `unknown`, `installed`, or `unsupported` (FR-005,
  FR-006).
- Renders a single tactile pill button (Vivid Social component style — see
  `specs/009-add-to-homescreen/DESIGN.md`) when state is `promptable` or `ios-manual`.
- On tap: if `promptable`, calls `promptInstall()`. If `ios-manual`, opens
  `<IosInstallInstructions />` (local `useState` boolean is sufficient — no global state
  needed).
- Must not duplicate or flicker across re-renders/navigations within the app (spec Edge Cases) —
  guaranteed by the hook owning a single set of `window` listeners rather than the button
  re-subscribing.

## `<IosInstallInstructions onClose={() => void} />`

**Contract**:
- A dismissible bottom-sheet/modal (Level-3 elevation per DESIGN.md) shown only while open;
  parent (`InstallButton`) controls open/close via local state.
- Static content: title + 3 numbered steps (share icon → "Zet op beginscherm" → "Voeg toe"), per
  DESIGN.md and spec.md User Story 3.
- Closing (via close button or backdrop tap) calls `onClose` and does not itself change
  `InstallAvailabilityState` — the button remains available for a later attempt (FR-009), since
  there is no "native prompt" being dismissed here, only an instructional overlay.
