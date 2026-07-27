# Feature Specification: Assignment, Game and Virus Card Loop

**Feature Branch**: `004-assignments-and-viruses`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Players play the game by drawing and completing \"opdracht\" (assignment/dare/mini-game) cards and \"virus\" cards. Assignment cards give the current player a task or mini-game to perform, with penalty points for failing. Virus cards introduce a penalty/infection mechanic that can be passed between players (a player \"infected\" by a virus card carries a penalty condition until it is cured or passed on to another player). This feature defines the core turn loop of drawing a card, resolving whether it's an assignment or a virus, and applying its effect before passing the turn to the next player."

Refined based on follow-up clarification from the user: once the game starts (with the player
set already known, per feature 001), each draw produces an "opdracht" (assignment), "spel"
(game), or "virus". A card is often aimed at one or more specific players — in which case those
players are chosen randomly from the player set at draw time — but general versions exist that
apply to all players. For a "specific" card, its instruction text contains one `{player}`
placeholder token per targeted player; each token is replaced with one resolved target player's
name (in order) before the text is shown, so the group reads names instead of raw tokens (e.g.
"{player} moet 10 keer opdrukken" becomes "Alice moet 10 keer opdrukken"). "General" card text
addresses the whole group and contains no placeholder tokens. An assignment is simply a task to
perform. A virus is a specific, ongoing rule the target player must not break, which stays in
effect until it is lifted — this happens after a random number (minimum 10) of subsequent
assignment/game draws. More than one virus effect may be active at the same time, including more
than one on the same player. A "game" is usually a more elaborate task than an assignment; the
difference is mostly visual — games and assignments otherwise work the same way. Assignment,
game, and virus content (instruction text) is bundled into sets that a session is played with;
this content does not need to be editable from within the app.

Further refined based on additional follow-up clarification: a game session does not draw from
its entire card set indefinitely. Instead, at the start of each session, a random subset of that
card set's cards — sized to a random number between 60 and 80 (inclusive), always including at
least 4 virus cards — is selected to form that session's actual draw pool. Cards are drawn from
this pool one at a time, fully at random with no predetermined order, without replacement. Once
the pool is exhausted, the game session ends; there is no reshuffling to continue indefinitely.
Any virus effects still active at that point are automatically lifted as part of ending the
session, even if they haven't reached their own lift threshold yet. A virus card defines two
separate texts: its active-effect instruction text (shown when it's drawn, per the placeholder
rules above) and a separate lift text (shown, as its own card, whenever a specific active effect
from it is lifted — whether by reaching its threshold or by being force-lifted at session end).
Since a lift always concerns exactly one player at a time (see the "one effect per targeted
player" model below), a virus's lift text always contains exactly one `{player}` token,
regardless of how many players its instruction text names when the card is drawn. There is no
"current drawer" role in the system — physically, whoever is holding the shared device triggers
each draw, but this is a social convention, not application state.

**Scope note (added during the UI design review, 2026-07-27)**: recording assignment/game
success or failure, reporting virus rule violations, and any resulting penalty-point scoring are
all explicitly **out of scope** for this feature — deferred to a separate future feature (see
Clarifications). This feature covers drawing, targeting, displaying card text, and the virus
effect lifecycle (starting, visibly tracking, and lifting — naturally or forced at session end)
only. The group is expected to judge/track outcomes and any consequences by other means for now.

## Clarifications

### Session 2026-07-26

- Q: When a "specific" card requires more target players than currently exist in the session, what should the system do? → A: Skip this card entirely (discard from the pool) and immediately draw the next one instead.
- Q: What should the upper bound be for a virus effect's randomly assigned lift threshold (currently only "at least 10", no maximum)? → A: No fixed maximum — keep the current wording (≥10, unbounded); most viruses may end up relying on the forced end-of-session lift (FR-018) rather than lifting naturally.

### Session 2026-07-27 (during `/speckit-design` review)

- Q: Is moving scoring (assignment/game success-fail handling + penalty points) out of this
  feature a real scope change, or just a simplification of one mockup screen? → A: A real scope
  change — remove it from this feature's spec/plan/design entirely; a future feature will add
  it back.
- Q: Does virus rule-violation reporting (with its penalty points) stay in this feature, since
  each virus effect already targets exactly one player (no multi-target ambiguity like
  assignment/game has)? → A: No — violation reporting and its scoring move out too. This
  feature no longer includes any point-tracking mechanic at all; it only covers drawing,
  targeting, display, and the virus effect lifecycle (start, visible tracking, lift).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Draw a card and see who it targets (Priority: P1)

Once players have been set up, the group draws cards one at a time from the session's card
pool (see User Story 4 for how that pool is built). Each card is an assignment, a game, or a
virus, and is addressed either to all players (general) or to one or more specific players
chosen at random from the player set. The group sees the card's type and instruction text.

**Why this priority**: This is the core, most frequent loop of the game. Without correctly
drawing a card, resolving its type, and resolving who it targets, there is no game — the virus
mechanic is a variation layered on top of this base loop.

**Independent Test**: Can be fully tested by drawing a card from a session with several
players, confirming it is correctly labeled as assignment, game, or virus, and confirming its
target(s) are resolved correctly (all players for a general card, or the right number of
randomly chosen players for a specific card).

**Acceptance Scenarios**:

1. **Given** a session with a player set and a randomized draw pool, **When** the group draws a
   card, **Then** the card's type (assignment, game, or virus) and instruction text are shown.
2. **Given** a drawn card is defined as "general," **When** it is displayed, **Then** it is
   shown as applying to all players in the session.
3. **Given** a drawn card is defined as "specific" (requiring one or more targets), **When** it
   is drawn, **Then** the system randomly selects the required number of target players from
   the current player set.
4. **Given** a drawn "specific" card's instruction text contains its `{player}` placeholder
   tokens, **When** it is displayed, **Then** each token is replaced with one resolved target
   player's name, in order, and no separate list or label of target names is shown in addition
   to the rendered text.

---

### User Story 2 - Draw a virus card and start an active virus effect (Priority: P2)

The group draws a card that is a virus instead of an assignment or game. Unlike an
assignment/game, a virus is not a one-off task — it becomes an active, ongoing rule on its
target player(s) that persists across subsequent draws until it is later lifted. More than one
virus effect can be active at once, including more than one on the same player.

**Why this priority**: This is the game's signature twist beyond simple task cards, but it
depends on the base draw/target loop from User Story 1 already existing.

**Independent Test**: Can be fully tested by drawing a virus card, confirming its target
player(s) are resolved the same way as User Story 1 (general or random specific selection), and
confirming the resulting virus effect remains visibly active — alongside any other already-
active virus effects, even on the same player — through several subsequent draws.

**Acceptance Scenarios**:

1. **Given** a drawn card is a virus, **When** its target(s) are resolved (general or specific,
   as in User Story 1), **Then** an active virus effect is started for those target player(s).
2. **Given** an active virus effect exists, **When** subsequent assignment/game cards are
   drawn, **Then** the virus effect remains visibly active and its progress toward being lifted
   advances.
3. **Given** a player already has one or more active virus effects, **When** another virus card
   targets that same player, **Then** a new, independent virus effect is added for them rather
   than replacing or being blocked by the existing one(s).
4. **Given** one or more active virus effects exist, **When** the group views the game state at
   any point, **Then** every currently affected player and their active effect(s) are clearly
   indicated, in a layout that stays legible and usable on a single mobile phone screen even
   when several effects are active at once.

---

### User Story 3 - Virus is automatically lifted (Priority: P3)

An active virus effect ends on its own once a random number (at least 10) of subsequent
assignment/game cards have been drawn since it started. When that threshold is reached, the
group is clearly shown a lift card — using text defined specifically for this purpose on the
virus card, distinct from its active-effect instruction text — naming the one player whose
effect just ended.

**Why this priority**: This closes the loop opened by User Story 2. It is lower priority
because a minimal playable version could ship with virus effects that simply remain active for
the rest of the session, but automatic lifting is core to how the user described the mechanic.

**Independent Test**: Can be fully tested by starting a virus effect, drawing the required
number of subsequent assignment/game cards, and confirming a lift card appears (with its
`{player}` token replaced by the affected player's name) and the effect is no longer marked
active on its target player.

**Acceptance Scenarios**:

1. **Given** a virus effect started with a randomly assigned lift threshold of at least 10,
   **When** that many subsequent assignment/game cards have been drawn, **Then** the virus
   effect ends automatically.
2. **Given** a virus effect has just been lifted, **When** the group is shown the next screen
   state, **Then** a lift card is shown using that virus's own defined lift text, with its
   single `{player}` token replaced by the affected player's name, clearly indicating the virus
   no longer applies to them.
3. **Given** a virus effect is lifted, **When** its former target player is viewed, **Then**
   they no longer show as currently affected by that virus effect (other, still-active effects
   on the same player, if any, remain shown).

---

### User Story 4 - Build the session's card pool at game start (Priority: P1)

When a game session starts, the system does not use the entire card set as its draw source.
Instead, it randomly selects a subset of that card set's cards — sized to a random number
between 60 and 80 (inclusive) — to serve as this session's draw pool, always guaranteeing that
at least 4 of the selected cards are virus cards. This pool, not the full card set, is what
User Story 1 draws from for the rest of the session.

**Why this priority**: Foundational — it defines what "the session's draw pool" actually is for
a given play-through, including the guarantee that every session has a meaningful number of
virus cards. Without it, User Story 1 has no bounded pool to draw from or exhaust (User Story
5), and every session would play identically off the full card set.

**Independent Test**: Can be fully tested by starting several sessions from the same underlying
card set and confirming each produces a pool sized between 60 and 80 cards (inclusive), drawn
entirely from that card set, always containing at least 4 virus cards, with composition varying
between sessions.

**Acceptance Scenarios**:

1. **Given** a card set with more than 80 cards including at least 4 virus cards, **When** a
   new game session starts, **Then** a draw pool is created containing a randomly chosen number
   of cards between 60 and 80 inclusive, all drawn from that card set.
2. **Given** the pool being created for a new session, **When** the random selection is made,
   **Then** at least 4 of the selected cards are of type "virus", regardless of how many
   non-virus cards make up the rest of the pool.
3. **Given** two different game sessions started from the same card set, **When** their pools
   are compared, **Then** the pools' sizes and/or specific card composition may differ between
   sessions, since the selection is independently randomized each time.

---

### User Story 5 - Game ends when the card pool is exhausted (Priority: P2)

The group keeps drawing one card at a time from the session's pool (User Story 1) until no
cards remain. At that point, the game session ends: no further draws are possible. Any virus
effects still active at that moment are automatically lifted, each showing its own lift card
(User Story 3), so no active effect is left unresolved when the session concludes.

**Why this priority**: Closes the loop opened by removing indefinite reshuffling; depends on
User Story 1 (the draw loop) and reuses User Story 3's lift mechanism for a forced case.

**Independent Test**: Can be fully tested by playing a session down to its last pool card and
confirming the game ends with no further draw possible; separately, by ending a session while
one or more virus effects are still active and confirming each is shown as lifted before the
session is considered ended, even though their thresholds hadn't been reached.

**Acceptance Scenarios**:

1. **Given** a session's draw pool has been fully drawn (no cards remain), **When** the group
   attempts to draw again, **Then** the system ends the game session and does not produce
   another card.
2. **Given** the game session ends with one or more virus effects still active, **When** the
   session ends, **Then** each still-active effect is automatically lifted and its lift card is
   shown (per User Story 3), regardless of how much progress it had made toward its own lift
   threshold.
3. **Given** the game session has ended, **When** the group views the game state afterward,
   **Then** no player shows any currently active virus effect.

---

### Edge Cases

- What happens when a "specific" card requires more target players than currently exist in the
  player set (e.g., a card needs 3 targets but only 2 players are in the session)? Resolved
  (see Clarifications): the card is discarded unresolved and the system immediately draws the
  next card from the pool instead (FR-003).
- What happens if a targeted player is removed from the player set (see feature 001) while they
  have one or more active virus effects? Player removal after a game has started is not
  possible today (feature 001 only allows removal before play starts). If a future feature adds
  mid-game removal, the expected behavior is that any active virus effects on the removed
  player are automatically lifted at that time, the same way they are at session end (User
  Story 5) — noted here for forward compatibility; this feature does not implement it.
- What happens when the same virus card definition ends up targeting the same player twice
  concurrently (two independent active effects from the identical virus text)?
- What happens when a "specific" card's instruction text contains a different number of
  `{player}` placeholder tokens than its own defined target count (a content-authoring
  mismatch)? Resolved: caught by the build/test-time validation in FR-013, not encountered
  during play.
- What happens if the underlying card set doesn't actually contain at least 80 cards or at
  least 4 virus cards? Resolved: caught by the build/test-time validation in FR-015, not
  encountered during play.
- What happens when the game session ends while several virus effects are simultaneously
  active — are all their lift cards shown at once? Resolved: each is shown in turn using the
  same single-effect lift-card mechanism as a normal automatic lift (User Story 5, Acceptance
  Scenario 2).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow the group to draw one card at a time (assignment, game, or
  virus) from the current session's draw pool (see FR-016), without requiring a fixed
  per-player turn order to do so.
- **FR-002**: System MUST determine, for each drawn card, whether it targets all players
  (general) or a specific number of players, per that card's own definition.
- **FR-003**: For a "specific" card, system MUST randomly select the card's required number of
  target player(s) from the current player set (added via the existing player-management
  feature) at the moment it is drawn. If the current player set has fewer players than the
  card's required target count, system MUST discard the card unresolved (no display, and it
  does not count toward FR-008's lift-threshold progress) and immediately draw the next card
  from the pool in its place.
- **FR-004**: System MUST display each drawn card's instruction text. For a "general" card, the
  display MUST clearly indicate it applies to all players (e.g. a category label), since no
  individual player is named. For a "specific" card, the resolved target player(s) MUST be
  identified solely through the rendered instruction text (see FR-005) — the system MUST NOT
  additionally display a separate list, badge, or label naming the target player(s) alongside
  the text.
- **FR-005**: For a "specific" card, system MUST replace each `{player}` placeholder token in
  the card's instruction text with one resolved target player's name, in order, before
  displaying it, so the group reads names rather than raw tokens. "General" card text contains
  no placeholder tokens and is shown as authored. This substitution is the only mechanism by
  which a specific card's targets are named on screen (see FR-004).
- **FR-006**: System MUST visually distinguish "game" cards from plain "assignment" cards.
  Beyond this visual distinction, this feature does not otherwise differentiate how the two are
  drawn, targeted, or displayed.
- **FR-007**: For a virus card, system MUST start an active virus effect on the resolved target
  player(s) rather than treating it as a one-off task.
- **FR-008**: System MUST assign each newly-started virus effect a randomly chosen lift
  threshold of at least 10 subsequent assignment/game draws, with no fixed maximum (confirmed
  in Clarifications — a wide/unbounded range is intentional, not an oversight), and MUST track
  progress toward that threshold as such cards are drawn.
- **FR-009**: System MUST automatically end an active virus effect once its lift threshold has
  been reached, and MUST show the group a dedicated lift card — using the lift text defined on
  that virus card (see FR-014), with its `{player}` token replaced by the affected player's
  name — clearly indicating that player's virus no longer applies.
- **FR-010**: System MUST visibly indicate, at all times, every player with one or more
  currently active virus effects, and which effect(s) each is, in a layout that remains legible
  and usable on a single mobile phone screen even when several effects are active at once.
- **FR-011**: System MUST allow more than one virus effect to be active at the same time,
  including more than one active effect on the same player simultaneously and independently.
- **FR-012**: System MUST organize assignment, game, and virus content into named sets that a
  session is played with. Editing this content from within the app is out of scope for this
  feature.
- **FR-013**: Since card set content is fixed, static data authored at build time (not runtime),
  system MUST provide an automated, build/test-time validation that checks every "specific"
  card's instruction text contains exactly one `{player}` token per target required by that
  card's own targeting count (and that "general" cards contain none), and that fails (reporting
  which card(s) are wrong) if any card set violates this — so a content mismatch is caught
  before it reaches players, rather than at runtime.
- **FR-014**: System MUST provide the same kind of build/test-time validation for every virus
  card's lift text: it MUST contain exactly one `{player}` token, since a lift event always
  concerns exactly one player regardless of how many players the card's instruction text names
  when drawn.
- **FR-015**: System MUST provide a build/test-time validation that each card set contains at
  least 80 cards in total and at least 4 cards of type "virus", failing (reporting the
  shortfall) if not — so that the random pool selection in FR-016 can always be satisfied.
- **FR-016**: At the start of a game session, system MUST randomly select a subset of the
  session's card set to form that session's draw pool, sized to a randomly chosen number of
  cards between 60 and 80 (inclusive), and MUST guarantee at least 4 of the selected cards are
  of type "virus".
- **FR-017**: System MUST draw cards from the session's pool one at a time, fully at random
  with no predetermined order, without replacement (each pool card is drawn at most once per
  session). Once the pool is exhausted, system MUST end the game session — no further draws
  are possible.
- **FR-018**: When the game session ends (FR-017), system MUST automatically lift every
  still-active virus effect regardless of its remaining lift-threshold progress, showing each
  one's lift card (per FR-009) as part of ending the session.

**Out of scope for this feature** (deferred to a future feature, see Clarifications):
recording assignment/game success or failure; reporting virus rule violations; any resulting
penalty-point scoring or totals.

### Key Entities

- **Card**: A single drawable definition belonging to a card set. Has a type of "assignment",
  "game", or "virus"; an instruction text; and a targeting rule of either "general" (all
  players) or "specific" (a fixed number of randomly chosen players). For "specific" cards, the
  instruction text contains one `{player}` placeholder token per targeted player, replaced with
  the resolved target names (in order) at display time; "general" card text contains no
  placeholder tokens. Virus cards additionally define a **lift text** — a separate text, used
  only when a specific active effect from this card is lifted, containing exactly one `{player}`
  token (a lift always concerns exactly one player, regardless of the original targeting count).
  Assignment and game cards have no lift text; it does not apply to them.
- **Card Set**: A named, bundled collection of assignment, game, and virus card definitions that
  a session is played with. Not editable from within the app. Must contain at least 80 cards in
  total, of which at least 4 are of type "virus", so that a session's randomly-sized draw pool
  (60-80 cards, at least 4 virus) can always be built.
- **Session Card Pool**: The randomly selected subset of a card set's cards — sized between 60
  and 80 (inclusive), guaranteeing at least 4 virus cards — that a specific game session actually
  draws from. Built once when the session starts; drawn from without replacement until
  exhausted, at which point the session ends.
- **Drawn Card**: The record of a card having been drawn during play, including its resolved
  target player(s) (all players for a general card, or the randomly chosen player(s) for a
  specific card).
- **Active Virus Effect**: The ongoing state created when a virus card is drawn: its target
  player, and its progress toward a randomly assigned lift threshold (at least 10 subsequent
  assignment/game draws). Ends either by reaching its threshold or by being force-lifted when
  the game session ends (and, in the future, potentially when its target player is removed
  mid-game — see Edge Cases); either way, ending it shows the virus card's lift text naming that
  player. A player may be the target of multiple concurrent, fully independent active virus
  effects.
- **Player**: An existing entity (added via the game's player list, feature 001), reused as-is.
  May be the target of one or more drawn cards and of multiple simultaneously active virus
  effects. This feature does not add any scoring/points fields to it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can go from a card being drawn to the group understanding its type,
  instruction, and target(s) in under 10 seconds of reading time.
- **SC-002**: 100% of drawn cards resolve their target(s) correctly — all players for a general
  card, or exactly the card's required number of randomly selected players for a specific card.
- **SC-003**: Each active virus effect's progress toward its lift threshold is tracked with zero
  drift or loss across a full session, independent of how many other virus effects are
  simultaneously active.
- **SC-004**: When a virus effect lifts, a clear lift card is shown on-screen in 100% of cases,
  without requiring an explanation from other players.
- **SC-005**: The active-virus-effects display remains fully legible and usable on a single
  mobile-phone-sized screen even with 5 or more concurrent effects across different players,
  via a compact/summarized layout rather than one full-detail block per effect.
- **SC-006**: 100% of game sessions start with a draw pool sized between 60 and 80 cards
  inclusive, containing at least 4 virus-type cards, regardless of how large or how
  virus-heavy the underlying card set is.
- **SC-007**: 100% of virus effects still active when a session's pool is exhausted are shown
  as lifted (via their own lift card) by the time the session is considered ended — none are
  left silently active.

## Assumptions

- There is no fixed per-player turn order for drawing cards, and no "current drawer" role is
  tracked by the system at all; any player in the group can trigger the next draw (in practice,
  whoever is holding the shared device), and each card's own definition (general, or specific
  with a target count) determines who it applies to via random selection at draw time.
- "Game" cards are functionally identical to "assignment" cards for everything this feature
  does (drawing, targeting, display) and differ only in visual presentation/labeling.
- Only assignment and game draws advance an active virus effect's lift-threshold progress;
  drawing a virus card does not itself count toward any other active virus effect's threshold.
- The number of target players required by a "specific" card (one or more) is fixed, static
  data defined per card in its card set, not something decided dynamically at runtime.
- A "specific" card's instruction text is authored with exactly one `{player}` placeholder
  token per required target (e.g. a count-2 card contains two `{player}` tokens); a virus
  card's separate lift text always has exactly one `{player}` token regardless of that count,
  since a lift always concerns one player. Keeping token counts in sync with target counts is a
  content-authoring responsibility, consistent with card content being out-of-scope static seed
  data for this feature — enforced via the build/test-time validations in FR-013 and FR-014
  rather than left to manual review.
- Since a "specific" card's target names only ever appear via its own rendered `{player}`
  tokens (FR-004, FR-005), a card that omits a token for one of its required targets simply
  never names that target on screen — this is exactly the kind of authoring mistake FR-013's
  validation exists to catch before it ships.
- A session's draw pool is built once, at session start, by first guaranteeing at least 4
  randomly chosen virus cards are included, then filling the remainder up to the session's
  randomly chosen total size (60-80) with cards drawn at random from the rest of the card set
  (which may include additional virus cards beyond the guaranteed 4). No other type-balance
  constraint (e.g. a minimum number of assignment cards) is required.
- A virus effect's lift threshold has no upper bound beyond "at least 10" (confirmed in
  Clarifications); since a session's pool is capped at 60-80 cards, a meaningful share of
  active virus effects — especially any drawn later in the session — may end up force-lifted at
  session end (FR-018) rather than reaching their own threshold naturally. This is accepted as
  intentional game balance, not a defect.
- What happens at the moment a game session ends beyond ending the draw loop and lifting active
  virus effects (e.g. a final score/summary screen) is out of scope for this feature.
- Card/content authoring (the actual instruction texts, lift texts, target counts, and which
  sets are played with) is out of scope for this feature; it is treated as static seed data the
  drawing/targeting/virus/pool-building mechanics consume, consistent with "questions don't
  need to be editable via the app."
- Multiple concurrent virus effects — including duplicate instances of the same virus card
  definition — may be independently active on the same player at once; each is tracked and
  lifted completely independently of the others.
- **Recording assignment/game success or failure, reporting virus rule violations, and any
  resulting penalty-point scoring are entirely out of scope for this feature** (see
  Clarifications, 2026-07-27) — deferred to a separate future feature. This feature reuses the
  existing player list from feature 001 as-is but does not add any scoring mechanism on top of
  it; the group tracks outcomes/consequences by other means for now.
