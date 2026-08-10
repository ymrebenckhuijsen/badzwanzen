# Feature Specification: Add to Home Screen (PWA)

**Feature Branch**: `009-add-to-homescreen`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Knop om de app als PWA op het beginscherm van je mobiele telefoon te zetten, inclusief app-icon"

## Clarifications

### Session 2026-07-27

- Q: Should the feature include offline support (a service worker caching the app so it works without network after install), or is it purely about installability? → A: Installable only — no offline support; the app still requires network like today, it just launches from a home-screen icon in standalone mode.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install via in-app button (Priority: P1)

A player opens Badzwanzen on their phone and sees a clear "Add to home screen" button. They tap it, confirm the install prompt, and the app icon appears on their phone's home screen so they can launch the game directly next time without opening a browser and typing the URL.

**Why this priority**: This is the entire feature — without a working install trigger there is nothing to test or ship.

**Independent Test**: On a supported mobile browser, load the app, tap the "Add to home screen" button, complete the native install flow, and verify the app icon appears on the home screen and launches the app in a standalone window.

**Acceptance Scenarios**:

1. **Given** a player has the app open in a supported mobile browser (e.g. Chrome on Android) and the app is installable, **When** they tap the "Add to home screen" button, **Then** the browser's native install prompt appears.
2. **Given** the player accepts the native install prompt, **Then** an icon for the app is added to their phone's home screen, using the app's icon and name.
3. **Given** the app icon has been added to the home screen, **When** the player taps it, **Then** the app opens in a standalone (browser-chrome-free) window, not a regular browser tab.

---

### User Story 2 - Button reflects install state (Priority: P2)

A player who has already installed the app, or whose browser doesn't support installation, doesn't see a confusing or dead button. The button only appears when installing is actually possible, and disappears (or changes) once the app is already installed.

**Why this priority**: Prevents confusion and dead-end taps; important for a polished experience but the app is still fully usable without it.

**Independent Test**: Open the app in a browser that does not support PWA installation (or after the app is already installed) and verify the install button is hidden or replaced with confirmation that the app is installed.

**Acceptance Scenarios**:

1. **Given** the current browser/platform does not support installing the app as a PWA, **Then** the "Add to home screen" button is not shown.
2. **Given** the app is already installed and running standalone, **Then** the "Add to home screen" button is not shown.
3. **Given** the player dismisses the native install prompt without confirming, **Then** the button remains available so they can try again later.

---

### User Story 3 - Manual instructions on iOS Safari (Priority: P3)

A player on an iPhone using Safari doesn't get an automatic install prompt (iOS Safari does not support the standard install-prompt API), so instead they see brief in-app instructions explaining how to add the app to their home screen using Safari's built-in "Share > Add to Home Screen" action.

**Why this priority**: A meaningful share of players will be on iOS Safari; without this they'd have no path to install at all. Ranked P3 because it's a fallback path, not the primary flow.

**Independent Test**: Open the app in iOS Safari, tap the "Add to home screen" button, and verify short instructions are shown for the manual Safari share-sheet method instead of a native prompt.

**Acceptance Scenarios**:

1. **Given** a player opens the app in iOS Safari, **When** they tap the "Add to home screen" button, **Then** they see short step-by-step instructions for using Safari's share sheet to add the app to their home screen.

---

### Edge Cases

- What happens when the player's browser fires the install-availability signal more than once (e.g. after navigating between pages in the app)? The button should not duplicate or flicker.
- What happens if the player denies/cancels the OS-level "Add" confirmation after tapping the button? The app should remain usable and the button should still be available to try again.
- What happens on desktop browsers that also support installable PWAs? The button may be shown there too, using the same behavior, since the feature is not mobile-exclusive in mechanism, only mobile-primary in intent.
- What happens if the app is opened directly from the installed home-screen icon vs. from a browser tab? The install button must not appear when already running standalone, regardless of entry point.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST be installable as a Progressive Web App, including a web app manifest declaring the app's name, short name, start URL, display mode, theme color, and background color.
- **FR-002**: The app MUST provide an app icon suitable for a mobile home screen, available in the sizes required by major mobile platforms (Android/Chrome and iOS/Safari).
- **FR-003**: The app MUST show an "Add to home screen" button when the platform reports the app is available for installation.
- **FR-004**: Tapping the "Add to home screen" button MUST trigger the platform's native install flow on platforms that support it (e.g. Android/Chrome).
- **FR-005**: The app MUST hide the "Add to home screen" button once the app has been installed or is already running in standalone mode.
- **FR-006**: The app MUST hide the "Add to home screen" button on platforms/browsers that do not report install support and do not fall under the manual-instructions case (FR-007).
- **FR-007**: On iOS Safari, where no native install prompt is available, tapping the button MUST show manual instructions for adding the app to the home screen via the share sheet.
- **FR-008**: The installed app MUST launch in a standalone display mode (no browser address bar/navigation chrome) when opened from the home screen icon.
- **FR-009**: If the player dismisses or cancels the install flow, the app MUST remain fully usable and the button MUST remain available for a later attempt.
- **FR-010**: This feature covers installability only — it MUST NOT introduce offline caching (e.g. a service worker cache strategy). The installed app continues to require the same network connectivity as the browser version; only the home-screen icon and standalone launch behavior are new.

### Key Entities

- **App Manifest**: Describes the installable app to the operating system — name, short name, icons, start URL, display mode, and theme colors. Not user-facing data, but a required artifact of this feature.
- **Install Availability State**: The current in-app knowledge of whether installation is possible, already done, or unsupported — drives whether the button is shown and what it does when tapped.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player on a supported Android mobile browser can go from tapping "Add to home screen" to having a launchable app icon on their home screen in under 10 seconds.
- **SC-002**: 100% of players on unsupported platforms, or who have already installed the app, see no dead or non-functional install button.
- **SC-003**: The installed app opens without any browser address bar or tab UI, visually indistinguishable from a native app shell, on first launch after install.
- **SC-004**: iOS Safari players attempting to install are shown actionable instructions rather than a non-functional button, on their first tap.

## Assumptions

- "PWA" (Progressive Web App) is the intended technical approach for making the game installable to a phone's home screen, as named directly in the feature request.
- The primary target platforms are mobile browsers that support PWA installation (notably Chrome on Android) plus iOS Safari via its manual share-sheet path; desktop support is a secondary bonus, not a requirement.
- A single app icon design (in multiple required sizes) is sufficient for this feature; commissioning new brand artwork is out of scope — an existing or placeholder icon may be adapted to the required icon sizes.
- This feature is installability-only: no offline caching/service worker behavior is introduced, and the app continues to require normal network connectivity after being installed.
- The app already runs over HTTPS in production (required for PWA installability); no new hosting/deployment work is needed for this feature.
- Only one installable app identity is needed (the whole Badzwanzen app), not per-game or per-session install variants.
