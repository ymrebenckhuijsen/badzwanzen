# Research: Add to Home Screen (PWA)

## Decision 1: Hand-written manifest, no PWA build-tool plugin

**Decision**: Author `public/manifest.webmanifest` by hand and link it from `index.html` with a
plain `<link rel="manifest">` tag. Do not add `vite-plugin-pwa` or any similar build-tool
plugin.

**Rationale**: `vite-plugin-pwa`'s main value is automating service-worker generation and
registration via Workbox. FR-010 explicitly forbids introducing a service worker or offline
caching for this feature — using the plugin only for its manifest-generation side (with SW
generation disabled) would add a dependency, a config surface, and an upgrade-maintenance
burden for something two static files already accomplish. This matches Constitution Principle
III (Simplicity & YAGNI): don't add a framework-within-a-framework for a problem that doesn't
need one.

**Alternatives considered**:
- `vite-plugin-pwa` with `strategies: 'injectManifest'` and a near-empty custom service worker
  — rejected: still registers *a* service worker (even a no-op one changes the app's caching
  behavior and adds an update-lifecycle concern FR-010 says to avoid), and adds a dependency for
  marginal benefit over a static file.
- `vite-plugin-pwa` in its default `generateSW` mode — rejected outright: generates a full
  precache-everything service worker, which is exactly the offline behavior FR-010 excludes.

## Decision 2: Icon generation via macOS `qlmanage`, not an npm package

**Decision**: Generate the required PNG icon sizes from the existing `public/favicon.svg` using
macOS's built-in QuickLook renderer (`qlmanage -t -s <size> -o <dir> public/favicon.svg`), as a
one-time, documented step at implementation time. The resulting PNGs are committed as static
files under `public/icons/`; no image-processing library becomes a project dependency.

**Rationale**: This is a one-off asset-generation task, not a repeated build step — the app
never needs to regenerate icons at build or runtime. Verified working: `qlmanage -t -s 512 -o
<dir> public/favicon.svg` produces a correctly rendered `favicon.svg.png` at the requested
resolution. Using a tool already present on the (macOS) developer machine avoids adding `sharp`,
`pwa-asset-generator`, or similar as a `devDependency` (or a transient `npx` fetch) purely to
run once. Consistent with Principle III.

**Alternatives considered**:
- `sharp` as a `devDependency` — rejected: a permanent dependency for a task performed once.
- `npx pwa-asset-generator` / `npx @vite-pwa/assets-generator` — rejected: pulls a large
  transient dependency tree (including a headless browser, in some of these tools) for a task
  `qlmanage` already solves locally with zero install.
- Commissioning new artwork — out of scope per spec.md's own Assumptions section.

**Caveat for tasks.md**: `qlmanage` is macOS-specific. Since this is a two-person hobby project
developing on macOS (per project context), that's acceptable; if a future contributor is on a
different OS, any SVG rasterizer (e.g. opening the SVG in a browser and exporting, or Inkscape)
produces the same static output — the generation *method* isn't part of the shipped app, only
its *output* (the committed PNGs) is.

## Decision 3: Install-availability detection — native browser signals only

**Decision**: Derive `InstallAvailabilityState` (see data-model.md) purely from browser-native
signals, captured in a single `useInstallPrompt` hook:
- `beforeinstallprompt` event → capture with `event.preventDefault()`, store the event (it
  exposes a `.prompt()` method used later when the button is tapped) → state becomes
  `promptable`.
- `appinstalled` event → state becomes `installed`.
- `window.matchMedia('(display-mode: standalone)').matches` (checked on mount, and also
  `navigator.standalone` for iOS Safari's older non-standard equivalent) → state becomes
  `installed` immediately, covering "opened directly from the home-screen icon" (spec Edge
  Cases).
- `navigator.userAgent` matching `/iPad|iPhone|iPod/` (and not already `installed`) → state
  becomes `ios-manual` on mount, since iOS Safari never fires `beforeinstallprompt`.
- Otherwise, once mounted with none of the above true, state rests at `unsupported` (button
  hidden) unless/until a `beforeinstallprompt` event arrives later.

**Rationale**: These are the only reliable, standard(ish) signals a web app has for install
state — no permissions or heavier API is needed. YAGNI: a dedicated "PWA detection" library
would wrap the same three checks with more surface area than this feature needs.

**Alternatives considered**: Polling `getInstalledRelatedApps()` — rejected, it's a
Chrome-only, differently-scoped API (checks Play Store/related native apps, not this PWA's own
install state) and doesn't help with the iOS or "just installed" cases this feature needs.

## Decision 4: Testing approach

**Decision**: Test `useInstallPrompt` and the two components with Vitest + React Testing
Library, following the existing hook-testing convention already used in
`src/features/players/usePlayers.test.ts`. Simulate browser signals by:
- Dispatching a real `Event` (or `CustomEvent`, since `BeforeInstallPromptEvent` isn't a
  JSDOM-native type) named `'beforeinstallprompt'` on `window`, with a stubbed `.prompt()` and
  `.userChoice` for the "user accepted/dismissed" assertions.
- Dispatching a plain `Event('appinstalled')`.
- Mocking `window.matchMedia` (JSDOM doesn't implement it) to control the standalone-detection
  branch per test case, and stubbing `navigator.userAgent`/`navigator.standalone` for the iOS
  branch.

**Rationale**: No new testing dependency needed — everything above is achievable with
Vitest/RTL primitives already in the project (per Constitution Principle II, which is
NON-NEGOTIABLE for application code; this feature has a natural Vitest/RTL target, so no
tooling exemption applies).
