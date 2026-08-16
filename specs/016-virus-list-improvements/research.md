# Phase 0 Research: Actieve-virussenlijst verbeteren

No `NEEDS CLARIFICATION` markers remain in the Technical Context (see plan.md) or spec.md — this
feature reuses the existing stack, component, and patterns end to end. The items below are the
concrete implementation-approach decisions worth recording, not unresolved unknowns.

## Grouping "iedereen" rows

- **Decision**: Group `ActiveVirusEffect`s by `cardId` first. For each `cardId` group, look up
  the originating `Card.targeting.kind` (via the `cardSet` passed into `ActiveVirusList`). If
  `kind === 'general'`, render exactly one shared row (label "Iedereen", stacked-people icon,
  the effect count if >1 concurrent general viruses — not ×N of players). If `kind ===
  'specific'`, keep today's per-player grouping (one row per `targetPlayerId`, ×N badge when a
  player has multiple simultaneous effects).
- **Rationale**: `Card.targeting.kind` is already the authoritative signal for "this virus hits
  everyone" — `App.tsx` already uses the identical check (`currentLiftCard?.targeting.kind ===
  'general'`) to decide `isGroupLift` for the end-of-virus message (feature 015). Reusing the
  same signal keeps the "currently active" list and "just ended" message consistent, and avoids
  inferring "targets everyone" indirectly from counting `targetPlayerIds.length ===
  players.length`, which would break as soon as a player is added/removed mid-session (feature
  007) while a general virus is active — a case spec.md's Edge Cases section already carves out
  as "does not retroactively change who's counted."
- **Alternatives considered**: Inferring group-ness from `targetPlayerIds.length ===
  activePlayers.length` — rejected because it's fragile under the live add/remove-player edge
  case and duplicates logic that `Card.targeting.kind` already encodes once, at the source.

## Tap-to-reveal state

- **Decision**: `ActiveVirusList` holds a local `useState<Set<string>>` (or similar) of
  "expanded" row keys (player id, or the synthetic `cardId` key for the shared "iedereen" row).
  Toggling a row's expansion looks up all `instructionText` values for that row's underlying
  effect(s)' `cardId`(s) via the `cardSet` prop and renders them inline beneath the row.
- **Rationale**: Matches spec.md's Assumptions ("simple show/hide interaction... no new
  navigation, modal-system, or screen") and the approved design mockup (chevron + inline
  expansion, not a dialog). Local component state is sufficient — no lifting to `App.tsx`, no
  new hook, since nothing outside this component needs to know which rows are expanded.
- **Alternatives considered**: A single "currently expanded row" (not a Set) — rejected because
  spec.md doesn't require accordion-style single-open behavior, and a Set is no more complex to
  implement while allowing multiple rows open at once, matching the mockup's implicit
  independence between rows.

## `ActiveVirusList` needs `instructionText`/`targeting` lookups → needs `cardSet`

- **Decision**: Add a `cardSet: CardSet` prop to `ActiveVirusList`, passed from both call sites
  in `App.tsx` (already has `cardSet` in scope in both places `ActiveVirusList` is rendered).
- **Rationale**: `ActiveVirusEffect` only stores `cardId`; the instruction text and targeting
  kind live on `Card` inside `CardSet.cards`. `App.tsx` already threads `cardSet` through to
  `DrawnCardView` and uses `cardSet.cards.find(...)` for the lift card, so this is the
  established pattern for resolving a `cardId` back to its `Card`, not a new one.
- **Alternatives considered**: Passing a pre-resolved `Map<string, Card>` instead of the whole
  `CardSet` — rejected as an unrequested abstraction (YAGNI, Principle III); `cardSet.cards.find`
  is already how the rest of the codebase does this lookup, and the list size (dozens of cards)
  makes a `Map` premature optimization.

## Lowering `MAX_ACTIVE_VIRUSES`

- **Decision**: Change the constant in `useDrawPile.ts` from `4` to `3`. No other logic changes
  — the existing defer-until-space-opens behavior (FR-003, unchanged since feature 011) already
  does the right thing for any cap value.
- **Rationale**: Explicit, unambiguous requirement (FR-003); the existing cap-check
  (`card.type === 'virus' && activeVirusCount >= MAX_ACTIVE_VIRUSES`) is cap-value-agnostic.
- **Alternatives considered**: None — this is a pure constant change with no design space.
