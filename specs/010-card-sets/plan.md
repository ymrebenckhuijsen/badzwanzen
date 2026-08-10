# Implementation Plan: Kaartensets

**Branch**: `010-card-sets` | **Date**: 2026-08-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-card-sets/spec.md`

## Summary

The game currently plays exactly one hardcoded card set (`seedCardSet`, from feature 004). This
feature generalizes that to a static catalog of one-or-more named `CardSet`s — always including
the existing seed set — and adds a new session-setup step, between the existing player screen
and the game screen, where the user picks which set the session uses (auto-skipped when only
one set exists). The choice is locked for the session and persisted in `localStorage` the same
way the player list already is, defaulting back to the seed set if the remembered choice no
longer exists. No new dependencies, no runtime content-authoring, no changes to feature 004's
draw/targeting/virus mechanics — only which `CardSet` they're fed.

**Update (2026-08-09, post-merge)**: feature 008 (end-of-game screen) merged to `main` after
this plan was first drafted, adding `sessionKey`/`onPlayAgain`/`onChangePlayers` state to
`App.tsx` and a new `src/App.test.tsx` integration-test precedent. This plan's card-set state
now explicitly follows the same lifecycle as `players`: preserved across "Speel opnieuw"
(`onPlayAgain`), reset alongside `players` on "Spelers wijzigen" (`onChangePlayers`) — see
research.md's new decision and data-model.md's updated "Session lock" section. `App.test.tsx`'s
existing `vi.mock('./features/cards/buildSessionCardPool')` pattern is reused for this
feature's own `App`-level tests rather than introduced fresh.

## Technical Context

**Language/Version**: TypeScript (Vite `react-ts` template) — same as established in features
001 and 004

**Primary Dependencies**: React, Vite, TailwindCSS (`@tailwindcss/vite`) — no new dependencies;
the catalog is a plain statically-imported array (research.md), not a new library/mechanism

**Storage**: `localStorage`, extending the existing `src/lib/storage.ts` module used by feature
001's player list with one new key (`badzwanzen:selected-card-set-id`) storing just the chosen
set's id (research.md). Card set content itself remains static seed data bundled as TypeScript
modules (unchanged from feature 004), validated at test time, not runtime (FR-006, FR-008).

**Testing**: Vitest + React Testing Library, same as features 001 and 004

**Target Platform**: Mobile-first responsive web browser (phone or laptop), static site. The new
selection screen follows the shared design system at [`/DESIGN.md`](../../DESIGN.md) (Tailwind
v4 tokens at `design/tailwind-theme.css`), with this feature's own addendum at
[`DESIGN.md`](./DESIGN.md) (Approved 2026-08-09).

**Project Type**: Single-page web application (frontend only, client-side) — extends the
existing single-project structure from features 001/004

**Performance Goals**: Selecting a set and building the session pool from it feel instant (all
local state/data, no network) — supports SC-001 (<10s is a UX/reading-the-list concern, not a
performance one)

**Constraints**: Must run entirely client-side and deploy on Vercel's free tier (Constitution
Principle IV); no paid services; reuses feature 004's `validateCardSet` rules unchanged (spec.md
Assumptions — minimum 80 cards, minimum 4 virus cards, correct `{player}` tokens); no in-app
content-authoring UI (spec.md Assumptions — new "real" sets are added by a developer as code,
same as `seedCardSet` today); one shared device, no cross-device sync of the selection

**Scale/Scope**: A catalog of one (today) to a handful of named `CardSet`s; the selection UI and
persistence logic are the only new runtime code — feature 004's pool-building/draw/virus
machinery is reused unmodified, just parameterized by the selected set instead of always
`seedCardSet`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Spec-Driven Development | Plan derives directly from approved `spec.md` and an approved `DESIGN.md` addendum; no application code written yet | PASS |
| II. Test-First (TDD) | Testing stack fixed to Vitest + RTL; `tasks.md` (next phase) must order failing tests before implementation for every behavior (catalog validation, selection/auto-skip, persistence + fallback, session lock) | PASS (enforced at task level) |
| III. Simplicity & YAGNI | No runtime registry/plugin system for sets — a plain static array (research.md); no in-app content-authoring UI (explicitly out of scope, spec Assumptions); no new storage abstraction — extends the existing `src/lib/storage.ts` with one key instead of introducing a second mechanism; validity/uniqueness enforced by one build-time test, not duplicated runtime filtering logic | PASS |
| IV. Zero-Cost, Client-Side Architecture | No server/database/accounts; selection persisted in `localStorage` only; static site on Vercel free tier; no new paid service | PASS |
| V. Quality Gates (CI + Review) | Built on its own branch (`010-card-sets`); reuses CI (lint + test) already established; the new catalog validity/uniqueness check runs as part of the same `npm test` | PASS |

No violations — Complexity Tracking table is empty (see below).

## Project Structure

### Documentation (this feature)

```text
specs/010-card-sets/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── DESIGN.md            # /speckit-design output (UI design addendum) — Approved
├── design/               # /speckit-design output (screenshot + HTML mockup)
├── checklists/
│   └── requirements.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: like features 001 and 004, this feature exposes no external
API/CLI/service interface — it's internal client-side selection state and one new screen
component, reusing the existing card/storage modules (research.md → "Contracts").

### Source Code (repository root)

```text
src/
├── features/
│   ├── players/                        # from feature 001 (reused, not modified)
│   ├── cards/
│   │   ├── data/
│   │   │   ├── seed-card-set.ts        # existing seed content (unchanged)
│   │   │   ├── seed-card-set.test.ts   # existing (unchanged)
│   │   │   ├── card-set-catalog.ts     # NEW: cardSetCatalog: CardSet[] — lists every bundled set, starting with [seedCardSet] (FR-001, FR-003, FR-009)
│   │   │   └── card-set-catalog.test.ts # NEW: every entry passes validateCardSet + all names unique (FR-006, FR-008)
│   │   ├── card.types.ts               # existing (unchanged) — CardSet shape already fits a catalog entry
│   │   ├── validateCardSet.ts          # existing (unchanged, reused as-is per spec Assumptions)
│   │   ├── buildSessionCardPool.ts     # existing (unchanged) — now called with the *selected* CardSet instead of always seedCardSet
│   │   ├── useCardSetSelection.ts      # NEW: resolves default (stored id → catalog lookup → seed-set fallback, FR-010/FR-011), exposes select(id), persists on change
│   │   ├── useCardSetSelection.test.ts # NEW
│   │   ├── CardSetSelectionScreen.tsx  # NEW: renders the catalog list (or auto-skips if length===1, FR-007) per DESIGN.md; "Start spel" hands the resolved CardSet up
│   │   └── CardSetSelectionScreen.test.tsx # NEW
│   ├── virus/                          # from feature 004 (reused, not modified)
│   └── end-of-game/                    # from feature 008 (reused, not modified) — EndOfGameScreen
├── lib/
│   ├── storage.ts                      # EXTENDED: + getSelectedCardSetId/setSelectedCardSetId (new `badzwanzen:selected-card-set-id` key), existing player functions unchanged
│   └── storage.test.ts                 # EXTENDED (or new, if not already present) for the new functions
├── App.tsx                             # EXTENDED: adds a `cardSet: CardSet | null` state stage between players and GameScreen, alongside the existing `sessionKey`/`onPlayAgain`/`onChangePlayers` state from feature 008; `onPlayAgain` preserves `cardSet`, `onChangePlayers` resets it (research.md, data-model.md); GameScreen now takes `cardSet` as a prop instead of importing seedCardSet directly
├── App.test.tsx                        # EXTENDED (feature 008 precedent — mocks buildSessionCardPool): new assertions for set selection, single-set auto-skip, and cardSet persisting across "Speel opnieuw" / resetting on "Spelers wijzigen"
└── main.tsx
```

**Structure Decision**: Continues the single-project structure established by features 001/004
(`src/features/<feature>/`, tests colocated with source). No new top-level feature folder — the
new module and screen live inside the existing `cards` feature, since a card set catalog and its
selection are conceptually part of "cards," not a separate domain. `players` and `virus` are
reused as-is and not modified. `storage.ts` is extended in place (one new key) rather than
duplicated, per FR-010's explicit "same mechanism as the player list" requirement
(research.md).

`buildSessionCardPool`, `useDrawPile`, `resolveTargets`, `renderCardText`, and the whole `virus`
feature are unchanged — this feature only changes *which* `CardSet` reaches
`buildSessionCardPool` (`App.tsx`'s wiring), not how a set is turned into a session or played.

`CardSetSelectionScreen` owns the FR-007 auto-skip behavior itself (rendering nothing and
calling its "continue" callback immediately when `cardSetCatalog.length === 1`) rather than
`App.tsx` deciding whether to render the screen at all — keeping exactly one place that decides
"which set is active" (research.md).

`end-of-game` (feature 008, merged post-plan) is reused as-is and not modified — this feature
only changes what `App.tsx` does with its existing `onPlayAgain`/`onChangePlayers` callbacks
with respect to the new `cardSet` state, not `EndOfGameScreen` itself. Since feature 008 already
established `src/App.test.tsx` as the place integration behavior spanning multiple screens is
tested (mocking `buildSessionCardPool`), this feature's own cross-screen assertions (selection
screen appears, chosen set's cards are exclusively drawn, replay-vs-change-players lock
behavior) extend that same file rather than introducing a parallel integration-test location.

## Complexity Tracking

*No entries — Constitution Check reported no violations.*
