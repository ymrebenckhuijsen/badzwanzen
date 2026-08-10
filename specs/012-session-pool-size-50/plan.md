# Implementation Plan: Kleinere sessie-kaartpoel (50-55 kaarten)

**Branch**: `012-session-pool-size-50` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-session-pool-size-50/spec.md`

## Summary

`buildSessionCardPool` (feature 004) currently picks a random session draw-pool size between 60
and 80 cards (inclusive), always guaranteeing at least 4 virus cards, then fills the rest
randomly from the chosen card set. This feature narrows that random range to 50-55 (inclusive).
The change is a two-constant edit (`MIN_POOL_SIZE`/`MAX_POOL_SIZE` in
`src/features/cards/buildSessionCardPool.ts`) plus updating the existing test's boundary
assertions in `buildSessionCardPool.test.ts` — no new files, no new UI (confirmed "No UI Impact"
in this feature's `DESIGN.md`), no change to the virus-card guarantee or to card-set-level
validation minimums (`validateCardSet.ts`'s `MIN_CARDS = 80`, which stays comfortably above the
new pool ceiling).

## Technical Context

**Language/Version**: TypeScript (Vite `react-ts` template) — unchanged from features 001/004

**Primary Dependencies**: React, Vite, TailwindCSS (`@tailwindcss/vite`) — no new dependencies

**Storage**: N/A — the session draw pool is built fresh in memory at session start and is never
persisted (see spec.md Assumptions); only the card *set* selection is persisted via
`localStorage` (feature 010), and this feature doesn't touch that.

**Testing**: Vitest, same as feature 004's `buildSessionCardPool.test.ts`

**Target Platform**: Mobile-first responsive web browser, static site. No UI surface for this
feature (`DESIGN.md`: `Status: No UI Impact`, confirmed by developer at feature-start).

**Project Type**: Single-page web application (frontend only, client-side) — extends the
existing `src/features/cards/` module from feature 004, no new modules

**Performance Goals**: N/A — pure in-memory random selection over an already-loaded array,
same cost profile as the existing 60-80 range; no measurable change

**Constraints**: Must run entirely client-side and deploy on Vercel's free tier (Constitution
Principle IV) — unchanged, no new dependency or service introduced. New range (50-55) must stay
comfortably below every existing/future card set's minimum size (`MIN_CARDS = 80` in
`validateCardSet.ts`), which it does with margin to spare.

**Scale/Scope**: One constant range change, affecting every card set (seed test set and the
real "Badzwanzen" set alike, per spec.md Assumptions) — no per-set special-casing

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Spec-Driven Development | Plan derives directly from approved `spec.md` and this feature's `DESIGN.md` (`No UI Impact`, confirmed by developer); no application code written yet | PASS |
| II. Test-First (TDD) | The existing `buildSessionCardPool.test.ts` boundary assertions (currently asserting 60/80) must be updated to assert 50/55 and observed failing against the *unchanged* implementation before the constants are edited (`tasks.md`, next phase, must order this red step first) | PASS (enforced at task level) |
| III. Simplicity & YAGNI | Two-constant edit in existing code; no new abstraction, no new module, no configurability introduced beyond what the spec asks for | PASS |
| IV. Zero-Cost, Client-Side Architecture | No server/database/accounts touched; pool remains in-memory only; static site on Vercel free tier, unchanged | PASS |
| V. Quality Gates (CI + Review) | Built on its own branch (`012-session-pool-size-50`); reuses existing CI (lint + test) from feature 001's Setup tasks | PASS |

No violations — Complexity Tracking table is empty (see below).

## Project Structure

### Documentation (this feature)

```text
specs/012-session-pool-size-50/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── DESIGN.md            # /speckit-design output ("No UI Impact")
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: like features 001/004/008, this feature exposes no external
API/CLI/service interface — it's an internal constant change in existing client-side logic (see
research.md → "Contracts").

### Source Code (repository root)

```text
src/
└── features/
    └── cards/                          # from feature 004 (modified, not new)
        ├── buildSessionCardPool.ts     # MIN_POOL_SIZE 60→50, MAX_POOL_SIZE 80→55 (only change)
        ├── buildSessionCardPool.test.ts  # boundary assertions updated 60/80 → 50/55
        ├── validateCardSet.ts          # unchanged (MIN_CARDS stays 80, out of scope per spec.md)
        └── data/                       # unchanged (seed-card-set.ts, badzwanzen-card-set.ts)
```

**Structure Decision**: Single-project web app structure (unchanged from features 001/004/008).
This feature touches exactly one existing file's two constants
(`src/features/cards/buildSessionCardPool.ts`) and its co-located test file; no new
files, modules, or directories are introduced.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — table intentionally empty.
