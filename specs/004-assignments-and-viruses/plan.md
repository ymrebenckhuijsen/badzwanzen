# Implementation Plan: Assignment, Game and Virus Card Loop

**Branch**: `004-assignments-and-viruses` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-assignments-and-viruses/spec.md`

## Summary

Once players exist (feature 001), a game session first builds a bounded draw pool by randomly
selecting 60-80 cards (guaranteeing at least 4 virus cards) from the session's card set. The
group then repeatedly draws one card at a time from that pool without replacement, in no
predetermined order, until it's exhausted — at which point the session ends. Each draw resolves
a type (assignment, game, or virus) and a target (all players, or N randomly chosen players),
and its instruction text is shown (with `{player}` tokens substituted for specific cards). Virus
draws start an independent, ongoing "active virus effect" per targeted player, which lifts —
either automatically after a randomized (≥10) number of subsequent assignment/game draws, or
forcibly when the session ends — each lift shown as its own card using text authored
specifically for that purpose. **This feature has no scoring**: recording assignment/game
success/failure and reporting virus rule violations (with any resulting penalty points) are
explicitly out of scope, deferred to a future feature (see spec.md Clarifications, 2026-07-27).
The approach reuses the existing Vite/React/TypeScript/Tailwind stack and player list from
feature 001, adding a card-draw feature (pool building + draw + targeting) and a virus-effect
feature (lifecycle + lift display) — no scoring layer.

**Cross-feature dependency**: This feature's spec assumes an existing player-management feature
(001-add-players). `001-add-players` has since been merged to `main`, including a UI design
pass (`001-add-players-design`) applying the shared "Vivid Social" design system. This feature
reuses that real `src/features/players` code as-is.

## Technical Context

**Language/Version**: TypeScript (Vite `react-ts` template) — same as established in feature 001

**Primary Dependencies**: React, Vite, TailwindCSS (`@tailwindcss/vite`) — no new dependencies
needed; shuffling and random target/threshold/pool selection use built-in `Math.random`

**Storage**: In-memory React state for the active session (session card pool + remaining ids,
active virus effects). Not persisted to `localStorage` — nothing in the spec requires session
state to survive a refresh mid-game (unlike feature 001's pre-game player list, which explicitly
must). Card set content (instruction text, lift text, target counts) is static seed data bundled
as a TypeScript module, not user-editable (FR-012), and is validated at test/build time rather
than at runtime (FR-013, FR-014, FR-015).

**Testing**: Vitest + React Testing Library, same as feature 001

**Target Platform**: Mobile-first responsive web browser (phone or laptop), static site. The
active-virus-effects display specifically must stay usable on a single mobile phone screen with
several concurrent effects (FR-010, SC-005). UI follows the shared design system at
[`/DESIGN.md`](../../DESIGN.md) (Tailwind v4 tokens at `design/tailwind-theme.css`), with this
feature's own addendum at [`DESIGN.md`](./DESIGN.md).

**Project Type**: Single-page web application (frontend only, client-side) — extends the
existing single-project structure from feature 001

**Performance Goals**: Card draw, pool building, target resolution, and virus state updates feel
instant (all local state, no network round-trip) — supports SC-001 (<10s reading time is a
UX/content concern, not a performance one)

**Constraints**: Must run entirely client-side and deploy on Vercel's free tier (Constitution
Principle IV); no paid services; depends on feature 001's `Player` entity (id, name) existing at
integration time; no scoring/points mechanism (see spec.md Clarifications, 2026-07-27)

**Scale/Scope**: One shared session, up to 20 players (per feature 001's cap), a card set of at
least 80 cards (≥4 virus, per FR-015) from which each session samples a bounded 60-80 card pool
(FR-016) and therefore always ends after a finite, bounded number of draws — zero drift in
virus-effect tracking across that whole session (SC-003)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Spec-Driven Development | Plan derives directly from approved `spec.md`; no application code written yet | PASS |
| II. Test-First (TDD) | Testing stack fixed to Vitest + RTL; `tasks.md` (next phase) must order failing tests before implementation for every behavior (pool building, drawing, targeting, virus lifecycle, lift display) | PASS (enforced at task level) |
| III. Simplicity & YAGNI | No new state-management library; pool/draw/virus logic as plain hooks + local component state; no persistence layer added beyond what's required; no scoring layer built ahead of the feature that actually needs it; reuses one validator function and one lift-card component for both the normal and forced-end lift cases | PASS |
| IV. Zero-Cost, Client-Side Architecture | No server/database/accounts; all state in-memory or (where reused) `localStorage`; static site on Vercel free tier | PASS |
| V. Quality Gates (CI + Review) | Built on its own branch (`004-assignments-and-viruses`); reuses CI (lint + test) already established by feature 001's Setup tasks; FR-013/014/015's build-time validation runs as part of that same `npm test` | PASS |

No violations — Complexity Tracking table is empty (see below).

## Project Structure

### Documentation (this feature)

```text
specs/004-assignments-and-viruses/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── DESIGN.md            # /speckit-design output (UI design addendum)
├── design/               # /speckit-design output (screenshots + HTML mockups)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: like feature 001, this feature exposes no external API/CLI/service
interface — it's internal client-side game logic and components (see research.md → "Contracts").

### Source Code (repository root)

```text
src/
├── features/
│   ├── players/                        # from feature 001 (reused, not modified)
│   │   └── usePlayers.ts               # existing player list + ids
│   ├── cards/
│   │   ├── data/
│   │   │   ├── seed-card-set.ts        # static seed content: assignment/game/virus definitions (FR-012)
│   │   │   └── seed-card-set.test.ts   # runs validateCardSet against the real seed data (FR-013, FR-014, FR-015)
│   │   ├── card.types.ts               # Card, CardSet, TargetingRule types
│   │   ├── validateCardSet.ts          # per-card token checks + set-level size/virus-count check (FR-013, FR-014, FR-015)
│   │   ├── validateCardSet.test.ts     # unit tests for the validator itself (using fixture data, not the real seed set)
│   │   ├── buildSessionCardPool.ts     # guarantee-then-fill random pool selection, 60-80 cards, ≥4 virus (FR-016)
│   │   ├── buildSessionCardPool.test.ts
│   │   ├── useDrawPile.ts              # draw-without-replacement from the pool; discards+redraws when a specific card's targets can't be resolved; ends session when exhausted (FR-001, FR-003, FR-017)
│   │   ├── useDrawPile.test.ts
│   │   ├── resolveTargets.ts           # general vs. specific random target selection; signals "unresolvable" if targeting.count exceeds the player set so useDrawPile can discard and redraw (FR-002, FR-003)
│   │   ├── resolveTargets.test.ts
│   │   ├── renderCardText.ts           # {player} token substitution, shared by instruction and lift text (FR-005, FR-014)
│   │   ├── renderCardText.test.ts
│   │   ├── DrawnCardView.tsx           # shows card type + rendered instruction text only; no success/fail controls, no separate target-name list (FR-004)
│   │   └── DrawnCardView.test.tsx
│   └── virus/
│       ├── virus.types.ts              # ActiveVirusEffect type (incl. liftReason)
│       ├── useVirusEffects.ts          # start, advance progress, lift (threshold or forced-end) (FR-007..FR-011, FR-018)
│       ├── useVirusEffects.test.ts
│       ├── ActiveVirusList.tsx         # per-player grouped summary of active effects, mobile-friendly (FR-010, SC-005); avatar+name+subtext+badge row style per DESIGN.md (approved 2026-07-27)
│       ├── ActiveVirusList.test.tsx
│       ├── VirusLiftCard.tsx           # single lift-card component reused for both threshold and forced-end lifts (FR-009, FR-018)
│       └── VirusLiftCard.test.tsx
├── App.tsx                             # wires players + pool + draw loop + virus state together; renders session-end state
└── main.tsx
```

**Structure Decision**: Continues the single-project structure established by feature 001
(`src/features/<feature>/`, tests colocated with source). Two new feature folders are added
(`cards`, `virus`); the existing `players` feature is reused as-is and not modified. There is no
`scoring` feature folder — an earlier draft of this plan included one (`usePenaltyPoints.ts`),
removed after the `/speckit-design` review confirmed scoring is out of scope entirely (see
spec.md Clarifications, 2026-07-27; research.md).

`useDrawPile` has no discard/reshuffle path for pool exhaustion (the session's pool is
fixed-size and non-replenishing, FR-017) — exhausting it is a first-class "session ended" state
that `App.tsx` must render. It does have a discard-and-redraw path for the FR-003 insufficient-
players case, which is a different concept (skipping one unresolvable card, not repopulating the
pool).

FR-013/014/015's build/test-time validation is implemented as a plain Vitest test
(`seed-card-set.test.ts`) that imports the real seed data and asserts `validateCardSet` reports
no errors. No new build tooling, CLI, or CI step is introduced — the existing `npm test` run,
already gated in CI per Constitution Principle V, is the "build-time" check.

`VirusLiftCard` is a single component used both for a normal threshold-triggered lift and for
the forced lifts at session end (FR-018) — the only difference is which `ActiveVirusEffect`
triggers it and in what sequence, not how it's rendered (research.md).

## Complexity Tracking

*No entries — Constitution Check reported no violations.*
