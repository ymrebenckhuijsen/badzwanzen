# Phase 1 Data Model: Kortere, begrensde virusduur

No new entities. This feature narrows the valid-value constraint on one existing field.

## `ActiveVirusEffect.liftThreshold` (`src/features/virus/virus.types.ts`)

| Field | Type | Constraint before | Constraint after (this feature) |
|---|---|---|---|
| `liftThreshold` | `number` | integer in `[10, 50]` | integer in `[15, 20]` |

- **Set once**, at effect creation (`startEffects`), via `randomLiftThreshold()` — never
  mutated afterward.
- **Shared across effects from the same activation**: all `ActiveVirusEffect` records created
  by one `startEffects(...)` call (i.e. one virus card activation, including "iedereen" targets)
  get the identical `liftThreshold` value — one roll per activation, not per player
  (unchanged by this feature; see FR-004).
- **Compared against** `assignmentGameDrawsSinceStart` in `advanceOnAssignmentGameDraw` to
  decide when an effect naturally lifts. Unaffected by this feature — only the range
  `liftThreshold` is drawn from changes, not how it's used.
- No relationship to card content/data — the threshold is pure session state, not stored on or
  derived from the virus card itself (per spec.md Assumptions).
