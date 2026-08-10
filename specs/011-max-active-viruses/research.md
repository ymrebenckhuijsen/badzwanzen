# Phase 0 Research: Max Active Viruses

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this feature extends
well-understood existing mechanics (feature 004's draw pile and virus effects) with no new
dependencies or architecture. The two design decisions below were the only open questions, both
resolved by reading the current implementation rather than needing external research.

## Decision 1: Where and how to enforce the 4-virus cap

**Decision**: Extend `useDrawPile.draw()`'s existing scan loop with one more skip condition —
skip a candidate card if it's a virus card and the number of *distinct* currently-active virus
`cardId`s is already 4. Rewrite the loop to remove only the successfully-drawn card's id from
the persisted `remainingCardIds`, so any card skipped during the scan (for this reason or the
pre-existing "targeting can't resolve" reason) stays in the pool for a later draw. The active
count is computed in `GameScreen` from `useVirusEffects`'s existing `effects` state
(`new Set(effects.filter(e => e.status === 'active').map(e => e.cardId)).size`) and passed into
`useDrawPile` as a new parameter.

**Rationale**:
- Matches FR-002 through FR-005 directly, including the clarified behavior (spec.md
  Clarifications, 2026-08-10): drawing skips over virus cards while at capacity rather than
  force-lifting an existing one or blocking the draw outright.
- Reuses the draw pile's existing "keep scanning past cards that don't currently apply" pattern
  (already used when `resolveTargets` fails, e.g. a `specific`-targeting card needs more
  players than are in the session) instead of introducing a second, parallel skip mechanism —
  keeps the change minimal per Constitution III (Simplicity & YAGNI).
- Counting distinct `cardId`s (not effect instances) directly satisfies FR-005: a virus
  targeting every player produces one effect per player in `useVirusEffects`, but must still
  count as one virus toward the cap.
- No duplicate state: `useVirusEffects` already owns the authoritative list of active effects;
  `useDrawPile` only needs a derived count, not its own copy of virus state.

**Alternatives considered**:
- *Force-lift the oldest active virus to make room* (clarification option B) — rejected; the
  developer explicitly chose the skip-and-defer behavior instead (spec.md Clarifications).
- *Give `useDrawPile` its own tracking of "active virus card ids"* — rejected as duplicate state
  that could drift from `useVirusEffects`'s tracking; passing a derived count as a prop is
  simpler and keeps a single source of truth.
- *Remove the drawn card from the pool by recomputing the tail from where the scan loop ended*
  (the current pre-feature approach, which happens to also permanently discard any card whose
  targeting fails to resolve) — rejected because it cannot satisfy FR-004 (a cap-skipped virus
  card must remain drawable later); switching to index-based removal of only the drawn card is
  required, and correctly fixes the same latent issue for resolution-failures as a direct
  consequence, not a separate change.

## Decision 2: How to make every virus's end message unique

**Decision**: Add a validation rule to `validateCardSet.ts` that flags any two virus cards in
the same `CardSet` sharing identical `liftText`. Satisfy it for the shipped content by
hand-authoring a unique `liftText` for each of the 59 virus cards in `badzwanzen-card-set.ts`
(currently all 59 share the literal string `'Het virus bij {player} is opgeheven.'`), matching
each card's specific `instructionText` effect. `seed-card-set.ts`'s 8 virus cards already have
unique, effect-specific `liftText` values and need no changes — confirmed by reading the file.

**Rationale**:
- Matches FR-006 through FR-009 directly.
- Consistent with the existing validation pattern in the same file (`validateCardSet` already
  checks `{player}` token counts per virus card's `liftText`), so this is one more rule of the
  same shape rather than a new validation mechanism.
- Hand-authored content matches how `instructionText` is already authored for every card in this
  project — no precedent for generated/templated card text, and templating off
  `instructionText` would produce awkward Dutch phrasing for a "this rule no longer applies"
  message compared to purpose-written text.

**Alternatives considered**:
- *Derive the end message at runtime from `instructionText` (e.g. string templating/prefixing)*
  — rejected: adds a runtime mechanism for something a static content edit already solves more
  simply and with better phrasing (Constitution III).
- *Only enforce uniqueness among currently-active viruses at runtime, not across the whole card
  set* — rejected: FR-009 explicitly requires whole-card-set uniqueness, which is also strictly
  easier to guarantee (a fixed content invariant, checkable once, rather than a runtime
  invariant that would depend on which viruses happen to be active).
