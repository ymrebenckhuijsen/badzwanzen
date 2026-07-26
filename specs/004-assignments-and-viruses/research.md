# Research: Assignment, Game and Virus Card Loop

The feature spec has zero `NEEDS CLARIFICATION` markers, but it deliberately leaves several
implementation-level questions open (its "Edge Cases" section, and the internal shape of
"Active Virus Effect" when a virus card targets more than one player). This document makes
those decisions so `data-model.md` and `tasks.md` have a single, consistent design to build
from. None of these decisions contradict an acceptance scenario or functional requirement;
they fill gaps the spec left to planning.

## Decision: one Active Virus Effect per targeted player, not per draw

**Decision**: When a virus card's targeting rule is "specific" with a count > 1, the draw
creates **one independent Active Virus Effect per resolved target player**, each with its own
independently randomized lift threshold, its own progress counter, and its own violation
history — rather than one shared effect object referencing multiple players.

**Rationale**: The spec's language is consistently player-centric, not draw-centric:
Assumptions state effects are "tracked, scored, and lifted completely independently of the
others" even when duplicated on the same player; US2 AC4 requires showing "every currently
affected player and their active effect(s)"; the Edge Cases section explicitly expects the same
virus definition to produce two independent concurrent effects on the same player. Modeling one
effect per player is the simplest structure that satisfies all of this without a secondary
"which of the effect's several targets does this violation apply to" resolution step that the
spec never describes. It's also what makes a single, always-one-player lift text (FR-018)
well-defined regardless of the original card's targeting count.

**Alternatives considered**: A single effect object holding a list of target players was
considered, but it would require an extra UI step (picking which target violated) that no
acceptance scenario mentions, and would complicate independent per-player lifting (US4) since a
shared threshold/progress would have to somehow apply to multiple players who may have joined
the game session at different penalty totals.

## Decision: specific-card target count exceeding available players discards the card and redraws

**Decision**: If a "specific" card's required target count exceeds the number of players
currently in the session, the card is discarded unresolved — not shown, no penalty, no virus
effect started, and it does not count toward FR-009's lift-threshold progress — and the system
immediately draws the next card from the pool in its place. The discarded card is still
permanently removed from `SessionCardPool.remainingCardIds` (its single draw is consumed); it is
never revisited, since the player set is fixed for the whole session (no addition, and removal
isn't possible mid-game — see spec Edge Cases), so a card that can't resolve now never could
later in the same session.

**Rationale**: This was an open Edge Case in the spec (no FR governed it) and was resolved
directly with the user via `/speckit-clarify` on 2026-07-26, superseding this document's earlier
draft decision (clamping target count down to the available players). Clamping is no longer
used: the user explicitly chose "skip this card entirely and draw the next one" over clamping,
an error state, or a build-time validation error.

**Why "infinite-skip" isn't a real risk here**: since FR-019 guarantees the underlying card set
has at least 80 cards and the player set only ever shrinks toward feature 001's 2-player
minimum, at most a bounded number of cards in the set can exceed 2 required targets — discarding
them still terminates in at most `pool size` steps (the pool itself is finite, 60-80 cards, and
strictly shrinks by one per discard same as per normal draw).

## Decision: virus lift threshold has no fixed maximum (confirmed, not an oversight)

**Decision**: `liftThreshold` remains a randomly chosen integer that is only bounded below (≥10
subsequent assignment/game draws); no maximum is imposed.

**Rationale**: Confirmed directly with the user via `/speckit-clarify` on 2026-07-26 (one of two
candidate ambiguities raised at that point) rather than assumed — the user explicitly preferred
leaving this unbounded over introducing a cap (e.g. 10-30). The accepted consequence, also
recorded in the spec's Assumptions, is that a meaningful share of active virus effects —
especially ones drawn later in a session — may end up force-lifted at session end (FR-022)
rather than reaching their own threshold naturally within a 60-80 card session. This is treated
as intentional game balance, not something this feature needs to guard against.

## Decision: player removal mid-game — no code now, but the lift operation stays reason-agnostic

**Decision**: No special handling is added for a player being removed while they have active
virus effects, since feature 001 doesn't allow removal after a game starts. However, the
"lift an effect" operation (see data-model.md `ActiveVirusEffect`) is modeled as a single
function taking a *reason* (`"threshold"` or `"forced-end"` today), rather than being hardcoded
into the threshold-check code path — so that a future player-removal feature can call the same
"lift" operation with a new reason without restructuring this feature's code.

**Rationale**: Per the spec's Edge Cases, mid-game removal cannot occur given feature 001's own
lifecycle, so no runtime handling is needed today (YAGNI, Constitution Principle III). But the
spec explicitly flags the intended future behavior ("the expected behavior is... automatically
lifted"), so keeping the lift operation's trigger generic costs nothing now and avoids a
rewrite later.

## Decision: `{player}` placeholder syntax, one token per target, joined in order

**Decision**: A "specific" card's `instructionText` may contain `{player}` tokens — one per
required target. At display time, each token is replaced, in the order it appears in the text,
with the name of the corresponding resolved target player (targets themselves have no
inherent order beyond the order they were randomly resolved in). "General" cards contain no
tokens and are shown verbatim. This was confirmed directly with the user rather than assumed.

**Rationale**: Chosen over a single shared placeholder with name-joining (e.g. "Alice en Bob")
because it composes better with cards that need to reference the *same* target more than once
in different grammatical positions within one sentence, and it keeps substitution a simple
positional replace with no locale-specific joining logic (no "en"/comma-then-"en" rules to
maintain).

**Content-authoring implication**: the number of `{player}` tokens in a "specific" card's text
must equal that card's own `targeting.count`. Since card sets are fixed, static data authored at
build time, this is checked automatically before it ever reaches a session — see the build-time
validation decision below.

## Decision: a virus's lift text always has exactly one `{player}` token

**Decision**: Regardless of a virus card's `targeting` (general or specific with any count),
its separate `liftText` field is authored with exactly one `{player}` token, because lifting
happens per `ActiveVirusEffect` instance — and, per the "one effect per targeted player"
decision above, every instance concerns exactly one player at lift time.

**Rationale**: Directly requested by the user ("this text... has two texts, where an
opdracht/spel has one"). Keeping the lift text's arity fixed at 1 (independent of the
instruction text's arity) keeps `renderCardText`'s substitution logic identical for both texts
— it's always "replace N tokens with N resolved names in order," just with N=1 guaranteed for
lift text specifically.

## Decision: placeholder/target-count mismatches are caught by build/test-time validators, not handled at runtime

**Decision**: A pure function `validateCardSet(cardSet: CardSet): ValidationError[]` checks,
for every card in the set:

- if `type !== "virus"`: `instructionText`'s `{player}` token count matches `targeting.count`
  (0 for general, `count` for specific) — FR-017.
- if `type === "virus"`: the same check on `instructionText` (FR-017), **and** `liftText`
  contains exactly one `{player}` token (FR-018).
- across the whole set: at least 80 cards total and at least 4 of type `"virus"` (FR-019).

A Vitest test (`seed-card-set.test.ts`) runs this validator against the actual seed data and
fails (listing the offending card id(s) or set-level shortfall) if any check doesn't pass. No
runtime defense is added anywhere these checks apply — by the time a session runs, the seed
data has already passed as part of the normal `npm test` run gated in CI (Constitution
Principle V).

**Rationale**: The user explicitly asked for build-time validation of the placeholder/target
mismatch, and separately introduced a hard numeric requirement (60-80 pool size, ≥4 virus) that
only makes sense if the underlying set can actually supply it — checking that boundary at the
same build/test-time gate is the natural extension, not a new mechanism (Constitution Principle
III: reuse, don't add a second validation pathway).

## Decision: specific-card targets are named only through the rendered text, no separate list

**Decision**: `DrawnCardView` renders exactly one thing for a specific card: its instruction
text with `{player}` tokens substituted. It does not additionally render a "Targets: Alice, Bob"
style list or badge naming the players. General cards get a category-level indicator (e.g. an
"iedereen"/general label) instead of any per-player naming, since there's nothing card-specific
to name. The same principle applies to a lift card: it shows only the rendered `liftText`, no
separate "who was cured" label.

**Rationale**: Explicit user instruction — names must only ever appear where the card's own
text puts them, avoiding redundant/duplicate name display. This also means a card that forgets a
`{player}` token for one of its resolved targets will visibly fail to name that target on
screen, which is precisely the authoring mistake FR-017/FR-018's validators exist to catch
before it ships.

## Decision: session card pool is built by guaranteeing viruses first, then filling randomly

**Decision**: Building a session's draw pool (FR-020) works in two steps: (1) randomly choose
the pool's total size, an integer in `[60, 80]`; (2) randomly select at least 4 virus cards from
the card set's virus cards, then fill the remaining slots by randomly selecting from the rest of
the card set's cards (any type, which may include more virus cards than the guaranteed 4),
without duplicates. The resulting pool is then shuffled as a whole before play (though since
FR-021 draws fully at random anyway, pre-shuffling is an implementation convenience, not a
correctness requirement).

**Rationale**: "Guarantee then fill" always succeeds in one pass given FR-019's build-time
guarantee (≥80 cards, ≥4 virus cards exist), unlike a "sample N cards uniformly, then check if
≥4 are virus, retry if not" approach, which could in theory retry indefinitely on a
pathologically virus-sparse set and adds complexity (a retry loop) for no benefit given FR-019
already guarantees the simpler approach always works.

**Alternatives considered**: Uniform sampling with a post-hoc virus-count check and retry was
rejected for the reason above (unnecessary retry logic, since the guarantee-then-fill approach
is both simpler and always terminates in one pass).

## Decision: pool exhaustion ends the session; virus progress is never reshuffled away

**Decision**: There is no reshuffle. The session's pool (FR-020) is drawn from without
replacement (FR-021); once empty, the game session ends (FR-021) and any still-active virus
effects are force-lifted as part of ending it (FR-022), each showing its lift card. This
supersedes an earlier draft of this plan, which had the pool reshuffle indefinitely — the user
subsequently clarified that a session has a bounded card pool and ends when it runs out.

**Rationale**: Directly requested by the user. It also resolves the two related edge cases from
the previous draft cleanly: "does reshuffling reset virus progress" is now moot (no reshuffle
exists), and "virus drawn with no assignment/game cards left to count toward its threshold" now
simply means that effect will be among those force-lifted at session end if the pool runs out
first.

## Decision: multiple effects force-lifted at session end are shown one at a time, oldest first

**Decision**: When several `ActiveVirusEffect`s are still active at session end, each is lifted
and its lift card shown sequentially (not all at once in a combined message), ordered by
`startedAtDraw` ascending (the effect that started earliest is shown first).

**Rationale**: Reuses the exact same single-effect lift-card UI as a normal threshold-triggered
lift (Constitution Principle III — no new "multi-lift" UI component needed). The spec doesn't
specify an order for this rare end-of-session case, so the simplest deterministic
tie-breaker (creation order) was chosen over inventing a priority scheme.

## Decision: active virus effects are shown as a per-player summary, not one row per effect

**Decision**: `ActiveVirusList` groups effects by player — one compact row per affected player
(name + a count badge if they have more than one active effect), rather than one row per raw
`ActiveVirusEffect`. Full per-effect detail (which virus, remaining progress) is available by
expanding a player's row, not shown by default.

**Rationale**: The user asked explicitly for the active-virus display to "fit the intended
screen size... in a nice way." With multiple concurrent effects (SC-006 requires legibility
with 5+), one full-detail block per effect would overflow a phone screen quickly; grouping by
player caps the default list length at the number of *affected players* (≤ player count, ≤ 20)
rather than the number of *effects* (unbounded in principle), and matches how the group
actually cares about this information during play ("who currently has a virus" first,
"which one(s) exactly" second).

**Alternatives considered**: A flat scrollable list of all effects was considered simpler to
build, but rejected against SC-006's explicit legibility requirement — an unbounded flat list is
the exact failure mode SC-006 exists to prevent.

## Contracts

No `contracts/` directory is produced. This feature has no external API, CLI, or service
boundary — it is internal client-side state and React components consumed only by this app's
own `App.tsx`, consistent with how feature 001 was planned.

## Summary of resolved unknowns

All Technical Context fields were already known from feature 001's established stack; the
open questions were the design decisions above (spanning both the original planning pass and
this round of refinements), all now resolved.
