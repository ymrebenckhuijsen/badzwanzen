# Implementation Plan: Add to Home Screen (PWA)

**Branch**: `009-add-to-homescreen` | **Date**: 2026-08-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-add-to-homescreen/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Make Badzwanzen installable as a Progressive Web App: add a web app manifest and a generated
icon set, then show an "Add to home screen" button on the player-setup screen that (a) triggers
the browser's native install prompt where supported (Chrome/Android, desktop Chrome), (b) shows
short manual instructions on iOS Safari (no native prompt API there), and (c) hides itself once
the app is already installed/standalone or the platform doesn't support installation at all.
No service worker or offline caching is introduced (FR-010) — installability and standalone
launch only, achieved with two static files (manifest + icons) plus one small React
feature (`src/features/pwa-install/`), not a PWA build-tool plugin.

## Technical Context

**Language/Version**: TypeScript 6.0 / React 19 (existing project stack, unchanged)

**Primary Dependencies**: None new at runtime. Icon PNGs are generated once, at implementation
time, using macOS's built-in `qlmanage` QuickLook renderer (already on the developer's machine)
rather than adding an npm dependency for a one-off asset-generation task — see research.md.

**Storage**: N/A — no new persistence. Install state is derived live from browser events/APIs
(`beforeinstallprompt`, `appinstalled`, `matchMedia('(display-mode: standalone)')`), not stored.

**Testing**: Vitest + React Testing Library (existing stack), per Constitution Principle II.
Hook/component tests mock `window.matchMedia` and dispatch synthetic `beforeinstallprompt`/
`appinstalled` events, following the existing hook-testing convention in
`src/features/players/usePlayers.test.ts`.

**Target Platform**: Mobile-first responsive web (existing). This feature's install mechanism
specifically covers Chrome/Android (native prompt), iOS Safari (manual instructions), and
desktop Chrome (bonus, same native-prompt mechanism per spec Edge Cases).

**Project Type**: Single Vite/React web app — this repo's actual layout is feature-folder based
(`src/features/<name>/`), not the generic `src/models|services|cli` template; the Project
Structure section below reflects the real layout.

**Performance Goals**: N/A — no new performance-sensitive code path.

**Constraints**: FR-010 — this feature MUST NOT introduce a service worker or offline caching
strategy; only the manifest + icons + standalone launch behavior are in scope.

**Scale/Scope**: One new feature folder (~4 files + tests), two new static assets (manifest +
icon set), no new screens — an addition to the existing player-setup screen only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec-Driven Development**: Followed — spec.md and this plan.md both exist under
  `specs/009-add-to-homescreen/`, `/speckit-tasks` and `/speckit-implement` come next. Pass.
- **II. Test-First (TDD)**: Applies in full — this is application code (a hook + two
  components), no tooling exemption needed. `useInstallPrompt`, `InstallButton`, and
  `IosInstallInstructions` each get failing Vitest/RTL tests before implementation. Pass.
- **III. Simplicity & YAGNI**: Hand-written manifest + one small feature folder was chosen over
  adding `vite-plugin-pwa` specifically to avoid pulling in Workbox/service-worker machinery
  this feature explicitly must not use (FR-010) — see research.md decision 1. Pass.
- **IV. Zero-Cost, Client-Side Architecture**: Manifest + icons are static files served from
  `public/`; no server, backend, or paid service is introduced. Pass.
- **V. Quality Gates**: Standard feature branch + PR + CI flow applies, unchanged.

No violations — Complexity Tracking table below is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/009-add-to-homescreen/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
├── DESIGN.md            # Design addendum (manual, Stitch was unreachable — see file)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This repo uses a single Vite/React app with a feature-folder layout (not the generic
`src/models|services|cli` template) — see `src/features/players/`, `src/features/cards/`,
`src/features/virus/` for the existing convention this feature follows.

```text
public/
├── favicon.svg                    # existing — source artwork for generated icons
├── icons.svg                      # existing, unrelated (social-share icon sprite sheet)
├── manifest.webmanifest           # NEW — web app manifest (FR-001)
└── icons/                         # NEW — generated PNG icon set (FR-002)
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-512-maskable.png
    └── apple-touch-icon.png       # 180x180, for iOS home screen

src/features/pwa-install/          # NEW feature folder
├── types.ts                       # InstallAvailabilityState union (data-model.md)
├── useInstallPrompt.ts            # beforeinstallprompt/appinstalled + platform detection
├── useInstallPrompt.test.ts
├── InstallButton.tsx              # renders button; wires native prompt() or iOS modal
├── InstallButton.test.tsx
├── IosInstallInstructions.tsx     # bottom-sheet modal for iOS Safari manual steps (FR-007)
└── IosInstallInstructions.test.tsx

index.html                         # add <link rel="manifest">, theme-color meta,
                                    # apple-touch-icon link (FR-001, FR-002)
src/features/players/PlayerSetupScreen.tsx  # mount <InstallButton /> near the top (FR-003)
```

**Structure Decision**: Single existing Vite/React app, extended with one new feature folder
(`src/features/pwa-install/`) following the project's established per-feature convention, plus
two new static asset groups under `public/` (manifest + icons). No new screen, no new routing,
no backend — consistent with Constitution Principle IV.

## Complexity Tracking

No Constitution violations — this section is intentionally empty.
