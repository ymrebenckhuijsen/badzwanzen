# Phase 0 Research: Kortere, begrensde virusduur

No `NEEDS CLARIFICATION` markers remained in the Technical Context — the feature is fully
scoped to two known constants in an existing, already-tested hook. Research below documents
the decision, not an open unknown.

## Decision: cap the existing random-roll range to [15, 20]

**Current implementation** (`src/features/virus/useVirusEffects.ts`):

```ts
const MIN_LIFT_THRESHOLD = 10
const LIFT_THRESHOLD_RANDOM_SPREAD = 41 // yields liftThreshold in [10, 50]

function randomLiftThreshold(): number {
  return MIN_LIFT_THRESHOLD + Math.floor(Math.random() * LIFT_THRESHOLD_RANDOM_SPREAD)
}
```

`Math.floor(Math.random() * N)` yields an integer uniformly distributed over `[0, N-1]`. Adding
`MIN_LIFT_THRESHOLD` shifts that to `[MIN, MIN + N - 1]`. To get inclusive `[15, 20]` (6
possible values: 15, 16, 17, 18, 19, 20):

- `MIN_LIFT_THRESHOLD = 15`
- `LIFT_THRESHOLD_RANDOM_SPREAD = 6` (so `MIN + N - 1 = 15 + 6 - 1 = 20`)

**Rationale**: Preserves the existing, already-tested `randomLiftThreshold()` formula and
call sites exactly — no new function, no new abstraction (Constitution III). The formula's
shape (`MIN + floor(random * SPREAD)`) already generalizes to any inclusive integer range, so
the fix is a pure constant substitution.

**Alternatives considered**:
- *Introduce a `MAX_LIFT_THRESHOLD` constant and derive spread from it* (e.g.
  `MAX_LIFT_THRESHOLD - MIN_LIFT_THRESHOLD + 1`): rejected as unnecessary indirection for two
  call sites — the existing single-spread-constant pattern is simpler and was already in place
  (YAGNI, Constitution III). The inline comment on `LIFT_THRESHOLD_RANDOM_SPREAD` continues to
  document the resulting range, same as today.
- *Add a separate "iedereen"-specific threshold range*: rejected — spec's edge cases (FR-004)
  explicitly state the same 15-20 range applies uniformly regardless of target count; the
  existing one-roll-per-activation call site in `startEffects` already provides this for free.

## Existing behavior confirmed unaffected

- **Shared roll per "iedereen" activation** (feature 015/016): `startEffects` calls
  `randomLiftThreshold()` once per activation and applies the same `liftThreshold` to every
  `ActiveVirusEffect` created from that call (`src/features/virus/useVirusEffects.ts`,
  `startEffects`). Untouched by this change — only the value range the single roll draws from
  changes.
- **Forced end on empty draw pile**: a separate code path (confirmed by existing test `'sets
  every still-active effect to lifted with liftReason "forced-end", ignoring liftThreshold'`)
  that lifts all active effects regardless of `liftThreshold`. Untouched by this change.
