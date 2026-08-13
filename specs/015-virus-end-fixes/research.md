# Research: Virus-eindegedrag repareren + nieuwe kaarten

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this codebase is small and
already well understood from prior features (010, 011, 012, 014). This document records the
concrete decisions made from reading the existing implementation, not open unknowns.

## Decision 1: How to make an "iedereen" virus end simultaneously for everyone

**Decision**: In `useVirusEffects.ts`'s `startEffects`, roll `randomLiftThreshold()` **once per
call** (i.e. once per virus card activation) and apply that single value to every
`ActiveVirusEffect` created in that call, instead of calling `randomLiftThreshold()` inside the
per-player `.map()`.

**Rationale**: Read `useVirusEffects.ts` (lines 15–33) and `resolveTargets.ts`. A "general"
(iedereen) virus card resolves to `targetPlayerIds = players.map(p => p.id)` — all active
players. `startEffects` currently creates one `ActiveVirusEffect` per target player, and today
**each** effect independently calls `randomLiftThreshold()`, so each player's virus ends after a
different number of assignment/game draws. But `advanceOnAssignmentGameDraw` already increments
`assignmentGameDrawsSinceStart` for **every** active effect on every assignment/game draw call,
in lockstep, since they all share the same `startedAtDraw`. The only source of divergence is the
independently-randomized `liftThreshold`. Making that one shared random roll per activation call
is sufficient and minimal — no new state, no new field, no signature change to
`ActiveVirusEffect`.

**Alternatives considered**:
- *Add a `groupId`/`activationId` field and lift by group in `advanceOnAssignmentGameDraw`* —
  more explicit, but strictly more code for the same outcome; the existing "same
  `startedAtDraw`, shared threshold" already guarantees lockstep advancement, so a group key
  would be redundant complexity (rejected per Constitution Principle III, Simplicity & YAGNI).
- *Special-case "general" targeting only* (share the threshold only when
  `targetPlayerIds.length > 1`) — unnecessary special case; a virus with a single specific
  target already behaves identically whether the threshold is "shared" or "per player" because
  there's only one effect either way, so applying the same one-roll-per-call logic
  unconditionally is simpler and has no observable difference for `specific` targeting (this is
  User Story 1's Acceptance Scenario 2: existing single/small-target behavior is unchanged).

## Decision 2: Confirming virus-lift events don't count as drawn cards

**Decision**: No production code change needed for FR-003 itself — add a regression test
instead.

**Rationale**: Read `useDrawPile.ts` (lines 18–44) and `App.tsx`'s `handleDraw`. `remainingCardIds`
is only ever mutated inside `draw()`, and only for the id of the card actually drawn from the
pile. Virus-lift events (`advanceOnAssignmentGameDraw`, `forceLiftAll`) are computed entirely
inside `useVirusEffects`'s own state and never touch `useDrawPile`'s state or call `draw()`
again. This means FR-003 already holds today. Because User Story 1's change (Decision 1) touches
the same lift-timing code path, the risk is a future regression silently breaking this
invariant — so it is protected with an explicit test rather than left implicit.

**Alternatives considered**:
- *Do nothing* — rejected: the spec explicitly calls this out as a requirement (FR-003) that
  must stay true after Decision 1's change lands; an explicit regression test is cheap insurance
  and satisfies Constitution Principle II (TDD) by proving current+future correctness.

## Decision 3: Where and how to add the new content

**Decision**: Convert `new-questions-raw.txt` into `Card` objects appended to the existing
`cards` array in `badzwanzen-card-set.ts`, following the exact classification convention used
in features 010/014: a leading `Spel`/`Virus` prefix determines `type: 'game'` / `type: 'virus'`
respectively; anything else (including the `Naam ...` / `Als je ooit ...` / bare-statement
lines) is `type: 'assignment'`. Player-name placeholders become `{player}` tokens per the
existing convention, with the token count matching `targeting.count` for `specific`-targeted
cards (0 tokens for `general`-targeted cards, exactly 1 in `liftText` for every virus card).

**Rationale**: This matches FR-004 (append to the existing set, not a new catalog entry) and
FR-005 (must keep passing `validateCardSet`'s existing thresholds — already comfortably cleared
today per feature 014's 95-card addition). It reuses a conversion pattern the project has
already validated twice (010, 014), so there is no new process to design.

**Alternatives considered**:
- *New separate card set* — explicitly rejected by FR-007 (catalog and seed set stay unchanged;
  this is purely additive content within the existing Badzwanzen set).

## Decision 4: Unique, content-specific `liftText` per virus card

**Decision**: Every new virus card gets a bespoke `liftText` that names the specific behavior
that is ending (e.g. "het 3-woorden-virus is voorbij, je mag weer normaal antwoorden" rather
than a generic "het virus is voorbij"), and a set-wide check (existing `validateCardSet`
uniqueness rule) guards against accidental duplicates across the whole set, old and new cards
combined.

**Rationale**: Directly required by FR-006 and already enforced by an existing validation rule
(`validateCardSet.ts` lines 43–58) that fails the build/tests on any duplicate `liftText` among
virus cards — no new validation logic needed, only correctly authored content.

**Alternatives considered**: None — this is a content-authoring task constrained by an existing,
adequate validation rule, not a design decision with real alternatives.
