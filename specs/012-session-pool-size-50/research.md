# Phase 0 Research: Kleinere sessie-kaartpoel (50-55 kaarten)

No `NEEDS CLARIFICATION` markers remain in `spec.md`, and no new technology/dependency choices
are involved — this feature edits two existing constants and their existing test's boundary
assertions. Research is limited to confirming the change is safe against existing invariants.

## Decision: New range is 50-55 (inclusive), replacing 60-80

**Rationale**: Directly requested by the feature description ("maximum aantal kaarten tussen
50-55 kaarten") and confirmed unambiguous in spec.md FR-001 — no reasonable alternative
interpretation exists (the existing code already implements a min/max random range in exactly
this shape, at `MIN_POOL_SIZE`/`MAX_POOL_SIZE` in `buildSessionCardPool.ts`).

**Alternatives considered**: None — this is a parameter change to an existing, already-designed
mechanism (feature 004), not a new mechanism requiring a design choice.

## Decision: Leave `MIN_VIRUS_IN_POOL` (4) and `validateCardSet.ts`'s `MIN_CARDS` (80) unchanged

**Rationale**: spec.md's Assumptions section explicitly scopes this feature to the *session
draw-pool* range only, not the card-set-level validity minimums. 4 guaranteed virus cards fit
comfortably within a 50-55 card pool (as they did within 60-80), and a card set that must have
≥80 cards to be valid has more than enough headroom to always satisfy a 50-55 pool — so no
knock-on adjustment is needed for either constant.

**Alternatives considered**: Lowering `MIN_CARDS` in step with the smaller pool ceiling was
considered but rejected — it's not something the feature description or spec asked for, would
touch a second file/behavior (card-set validity, not session pool size) outside this feature's
stated scope, and 80 already satisfies the new ceiling with margin, so there's no correctness
reason to touch it (YAGNI, Constitution Principle III).

## Contracts

This feature has no external API/CLI/service surface — `buildSessionCardPool` is an internal
function called only from within `src/features/cards/` and its consuming hook. No `contracts/`
directory is generated (consistent with features 001, 004, and 008, which made the same call
for the same reason).

## Testing approach

`buildSessionCardPool.test.ts`'s first test (`'produces a pool sized between 60 and 80 cards,
inclusive'`) asserts the old boundary. Per Constitution Principle II (TDD), the task sequence
must: (1) update this test's assertions and description to 50/55, (2) run it and observe it fail
against the unchanged implementation (pool sizes still land in 60-80, outside the new 50-55
assertion window), (3) only then edit the two constants in `buildSessionCardPool.ts`, (4) observe
the full suite pass. The other five tests in the same file (virus guarantee, id validity, no
duplicates, `remainingCardIds`/`hasEnded` init, cross-call variance) require no changes — they
already assert range-independent properties.
