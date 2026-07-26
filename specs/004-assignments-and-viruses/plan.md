# Implementation Plan: Assignment, Game and Virus Card Loop

**Branch**: `004-assignments-and-viruses` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-assignments-and-viruses/spec.md`

## Summary

Once players exist (feature 001), a game session first builds a bounded draw pool by randomly
selecting 60-80 cards (guaranteeing at least 4 virus cards) from the session's card set. The
group then repeatedly draws one card at a time from that pool without replacement, in no
predetermined order, until it's exhausted — at which point the session ends. Each draw resolves
a type (assignment, game, or virus) and a target (all players, or N randomly chosen players).
Assignment/game draws are resolved success/fail with penalty points on failure. Virus draws
instead start an independent, ongoing "active virus effect" per targeted player, which the group
can report violations against (repeatable penalty) until it lifts — either automatically after a
randomized (≥10) number of subsequent assignment/game draws, or forcibly when the session ends
— each lift shown as its own card using text authored specifically for that purpose. The
approach reuses the existing Vite/React/TypeScript/Tailwind stack and player list from feature
001, adding a card-draw feature (pool building + draw + targeting), a virus-effect feature
(lifecycle + violations + lift display), and a small scoring layer that tracks penalty points
per player without modifying the existing `Player` entity.

**Cross-feature dependency**: This feature's spec assumes an existing player-management feature
(001-add-players). As of this planning session, 001 has only its `spec.md`/`plan.md` merged to
`main` — its actual implementation exists solely as uncommitted work in the `001-add-players`
worktree. This plan documents the intended integration point (a `players` list with stable
`id`s), but implementation of 004 cannot be fully wired end-to-end until 001's `src/features/players`
code is merged. This is a sequencing note, not a constitutional violation.

## Technical Context

**Language/Version**: TypeScript (Vite `react-ts` template) — same as established in feature 001

**Primary Dependencies**: React, Vite, TailwindCSS (`@tailwindcss/vite`) — no new dependencies
needed; shuffling and random target/threshold/pool selection use built-in `Math.random`

**Storage**: In-memory React state for the active session (session card pool + remaining ids,
active virus effects, per-player penalty totals). Not persisted to `localStorage` — nothing in
the spec requires session state to survive a refresh mid-game (unlike feature 001's pre-game
player list, which explicitly must). Card set content (instruction text, lift text, penalty
values, target counts) is static seed data bundled as a TypeScript module, not user-editable
(FR-016), and is validated at test/build time rather than at runtime (FR-017, FR-018, FR-019).

**Testing**: Vitest + React Testing Library, same as feature 001

**Target Platform**: Mobile-first responsive web browser (phone or laptop), static site. The
active-virus-effects display specifically must stay usable on a single mobile phone screen with
several concurrent effects (FR-011, SC-006).

**Project Type**: Single-page web application (frontend only, client-side) — extends the
existing single-project structure from feature 001

**Performance Goals**: Card draw, pool building, target resolution, and virus state updates feel
instant (all local state, no network round-trip) — supports SC-001 (<10s reading time is a
UX/content concern, not a performance one)

**Constraints**: Must run entirely client-side and deploy on Vercel's free tier (Constitution
Principle IV); no paid services; depends on feature 001's `Player` entity (id, name) existing at
integration time

**Scale/Scope**: One shared session, up to 20 players (per feature 001's cap), a card set of at
least 80 cards (≥4 virus, per FR-019) from which each session samples a bounded 60-80 card pool
(FR-020) and therefore always ends after a finite, bounded number of draws — zero drift in
virus-effect tracking across that whole session (SC-003)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Spec-Driven Development | Plan derives directly from approved `spec.md`; no application code written yet | PASS |
| II. Test-First (TDD) | Testing stack fixed to Vitest + RTL; `tasks.md` (next phase) must order failing tests before implementation for every behavior (pool building, drawing, targeting, scoring, virus lifecycle, lift display) | PASS (enforced at task level) |
| III. Simplicity & YAGNI | No new state-management library; pool/draw/virus/scoring logic as plain hooks + local component state; no persistence layer added beyond what's required; reuses one validator function and one lift-card component for both the normal and forced-end lift cases | PASS |
| IV. Zero-Cost, Client-Side Architecture | No server/database/accounts; all state in-memory or (where reused) `localStorage`; static site on Vercel free tier | PASS |
| V. Quality Gates (CI + Review) | Built on its own branch (`004-assignments-and-viruses`); reuses CI (lint + test) already established by feature 001's Setup tasks; FR-017/018/019's build-time validation runs as part of that same `npm test` | PASS |

No violations — Complexity Tracking table is empty (see below).

## Project Structure

### Documentation (this feature)

```text
specs/004-assignments-and-viruses/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
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
│   │   │   ├── seed-card-set.ts        # static seed content: assignment/game/virus definitions (FR-016)
│   │   │   └── seed-card-set.test.ts   # runs validateCardSet against the real seed data (FR-017, FR-018, FR-019)
│   │   ├── card.types.ts               # Card, CardSet, TargetingRule types
│   │   ├── validateCardSet.ts          # per-card token checks + set-level size/virus-count check (FR-017, FR-018, FR-019)
│   │   ├── validateCardSet.test.ts     # unit tests for the validator itself (using fixture data, not the real seed set)
│   │   ├── buildSessionCardPool.ts     # guarantee-then-fill random pool selection, 60-80 cards, ≥4 virus (FR-020)
│   │   ├── buildSessionCardPool.test.ts
│   │   ├── useDrawPile.ts              # draw-without-replacement from the pool; discards+redraws when a specific card's targets can't be resolved; ends session when exhausted (FR-001, FR-003, FR-021)
│   │   ├── useDrawPile.test.ts
│   │   ├── resolveTargets.ts           # general vs. specific random target selection; signals "unresolvable" if targeting.count exceeds the player set so useDrawPile can discard and redraw (FR-002, FR-003)
│   │   ├── resolveTargets.test.ts
│   │   ├── renderCardText.ts           # {player} token substitution, shared by instruction and lift text (FR-005, FR-018)
│   │   ├── renderCardText.test.ts
│   │   ├── DrawnCardView.tsx           # shows card type + rendered instruction text only; no separate target-name list (FR-004)
│   │   └── DrawnCardView.test.tsx
│   ├── virus/
│   │   ├── virus.types.ts              # ActiveVirusEffect type (incl. liftReason)
│   │   ├── useVirusEffects.ts          # start, advance progress, lift (threshold or forced-end), report violation (FR-008..FR-015, FR-022)
│   │   ├── useVirusEffects.test.ts
│   │   ├── ActiveVirusList.tsx         # per-player grouped summary of active effects, mobile-friendly (FR-011, SC-006)
│   │   ├── ActiveVirusList.test.tsx
│   │   ├── VirusLiftCard.tsx           # single lift-card component reused for both threshold and forced-end lifts (FR-010, FR-022)
│   │   └── VirusLiftCard.test.tsx
│   └── scoring/
│       ├── usePenaltyPoints.ts         # playerId -> running penalty total (FR-007, FR-013)
│       └── usePenaltyPoints.test.ts
├── App.tsx                             # wires players + pool + draw loop + virus state together; renders session-end state
└── main.tsx
```

**Structure Decision**: Continues the single-project structure established by feature 001
(`src/features/<feature>/`, tests colocated with source). Three new feature folders are added
(`cards`, `virus`, `scoring`); the existing `players` feature is reused as-is and not modified,
per the Assumptions in spec.md ("existing player list and penalty point totals... reused as-is").
`useDrawPile` no longer needs a discard/reshuffle path (removed from this plan's earlier draft)
since the session's pool is fixed-size and non-replenishing (FR-021); exhausting it is now a
first-class "session ended" state that `App.tsx` must render, rather than an internal detail.

FR-017/018/019's build/test-time validation is implemented as a plain Vitest test
(`seed-card-set.test.ts`) that imports the real seed data and asserts `validateCardSet` reports
no errors. No new build tooling, CLI, or CI step is introduced — the existing `npm test` run,
already gated in CI per Constitution Principle V, is the "build-time" check.

`VirusLiftCard` is a single component used both for a normal threshold-triggered lift and for
the forced lifts at session end (FR-022) — the only difference is which `ActiveVirusEffect`
triggers it and in what sequence, not how it's rendered (research.md).

## Complexity Tracking

*No entries — Constitution Check reported no violations.*
