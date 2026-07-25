# Feature Specification: Assignment, Game and Virus Card Loop

**Feature Branch**: `004-assignments-and-viruses`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Players play the game by drawing and completing \"opdracht\" (assignment/dare/mini-game) cards and \"virus\" cards. Assignment cards give the current player a task or mini-game to perform, with penalty points for failing. Virus cards introduce a penalty/infection mechanic that can be passed between players (a player \"infected\" by a virus card carries a penalty condition until it is cured or passed on to another player). This feature defines the core turn loop of drawing a card, resolving whether it's an assignment or a virus, and applying its effect before passing the turn to the next player."

Refined based on follow-up clarification from the user: once the game starts (with the player
set already known, per feature 001), each draw produces an "opdracht" (assignment), "spel"
(game), or "virus". A card is often aimed at one or more specific players — in which case those
players are chosen randomly from the player set at draw time — but general versions exist that
apply to all players. An assignment is simply a task to perform. A virus is a specific,
ongoing rule the target player(s) must not break, which stays in effect until it is lifted by a
notification that it no longer applies; this happens after a random number (minimum 10) of
subsequent assignment/game draws. A virus scores no points automatically — but if the rule is
broken, the group reports it at that moment and the virus card's own defined penalty points are
added, which can happen more than once while the same virus is active. More than one virus
effect may be active at the same time, including more than one on the same player. A "game" is
usually a more elaborate task than an assignment; the difference is mostly visual — games and
assignments otherwise work the same way. Assignment, game, and virus content (instruction text)
is bundled into sets that a session is played with; this content does not need to be editable
from within the app.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Draw a card and see who it targets (Priority: P1)

Once players have been set up, the group draws cards one at a time from the session's card set.
Each card is an assignment, a game, or a virus, and is addressed either to all players
(general) or to one or more specific players chosen at random from the player set. The group
sees the instruction text and, for assignment/game cards, records whether it was completed
successfully, with penalty points applied on failure.

**Why this priority**: This is the core, most frequent loop of the game. Without correctly
drawing a card, resolving its type, and resolving who it targets, there is no game — the virus
mechanic is a variation layered on top of this base loop.

**Independent Test**: Can be fully tested by drawing a card from a session with several
players, confirming it is correctly labeled as assignment, game, or virus, confirming its
target(s) are resolved correctly (all players for a general card, or the right number of
randomly chosen players for a specific card), and — for assignment/game cards — confirming a
failed resolution adds the card's penalty points to the targeted player(s).

**Acceptance Scenarios**:

1. **Given** a session with a player set and a shuffled card set, **When** the group draws a
   card, **Then** the card's type (assignment, game, or virus) and instruction text are shown.
2. **Given** a drawn card is defined as "general," **When** it is displayed, **Then** it is
   shown as applying to all players in the session.
3. **Given** a drawn card is defined as "specific" (requiring one or more targets), **When** it
   is drawn, **Then** the system randomly selects the required number of target players from
   the current player set and displays them.
4. **Given** an assignment or game card has been shown, **When** the group marks it failed,
   **Then** the card's penalty points are added to the targeted player's (or players') totals.
5. **Given** an assignment or game card has been shown, **When** the group marks it completed
   successfully, **Then** no penalty points are added.
6. **Given** the shared card set has been fully drawn, **When** another card is requested,
   **Then** previously used cards are reshuffled into a new draw pile so play can continue.

---

### User Story 2 - Draw a virus card and start an active virus effect (Priority: P2)

The group draws a card that is a virus instead of an assignment or game. Unlike an
assignment/game, a virus is not resolved immediately as success/failure — it becomes an active,
ongoing rule on its target player(s) that persists across subsequent draws until it is later
lifted. More than one virus effect can be active at once, including more than one on the same
player.

**Why this priority**: This is the game's signature twist beyond simple task cards, but it
depends on the base draw/target loop from User Story 1 already existing.

**Independent Test**: Can be fully tested by drawing a virus card, confirming its target
player(s) are resolved the same way as User Story 1 (general or random specific selection), and
confirming the resulting virus effect remains visibly active — alongside any other already-
active virus effects, even on the same player — through several subsequent draws rather than
resolving immediately.

**Acceptance Scenarios**:

1. **Given** a drawn card is a virus, **When** its target(s) are resolved (general or specific,
   as in User Story 1), **Then** an active virus effect is started for those target player(s)
   instead of asking for a success/failure resolution, and no penalty points are applied yet.
2. **Given** an active virus effect exists, **When** subsequent assignment/game cards are
   drawn, **Then** the virus effect remains visibly active and its progress toward being lifted
   advances.
3. **Given** a player already has one or more active virus effects, **When** another virus card
   targets that same player, **Then** a new, independent virus effect is added for them rather
   than replacing or being blocked by the existing one(s).
4. **Given** one or more active virus effects exist, **When** the group views the game state at
   any point, **Then** every currently affected player and their active effect(s) are clearly
   indicated.

---

### User Story 3 - Report a virus rule violation (Priority: P3)

While a virus effect is active, its target player may break the rule it describes. At the
moment the group observes this, they report the violation. The specific virus card's own
defined penalty points are then added to the violating player's total. This can happen more
than once during the same virus effect's active lifetime, each time adding the points again.

**Why this priority**: This is what gives the virus mechanic teeth — without it, an active
virus is purely cosmetic. It depends on User Story 2 (an active effect must exist to violate).

**Independent Test**: Can be fully tested by starting a virus effect, reporting a violation
against it, confirming the virus's penalty points are added to the target player, reporting a
second violation against the same still-active effect, and confirming the points are added
again.

**Acceptance Scenarios**:

1. **Given** an active virus effect targeting one or more players, **When** the group reports
   that a targeted player broke the rule, **Then** that virus card's defined penalty points are
   added to that player's total.
2. **Given** a violation has already been reported once for an active virus effect, **When**
   the group reports another violation for the same still-active effect, **Then** the penalty
   points are added again, independent of the first report.
3. **Given** a virus effect has already been lifted, **When** the group attempts to report a
   violation against it, **Then** the system does not allow it, since the effect is no longer
   active.

---

### User Story 4 - Virus is automatically lifted (Priority: P4)

An active virus effect ends on its own once a random number (at least 10) of subsequent
assignment/game cards have been drawn since it started. When that threshold is reached, the
group is clearly notified that the virus no longer applies.

**Why this priority**: This closes the loop opened by User Story 2/3. It is lower priority
because a minimal playable version could ship with virus effects that simply remain active (and
reportable) for the rest of the session, but automatic lifting is core to how the user described
the mechanic.

**Independent Test**: Can be fully tested by starting a virus effect, drawing the required
number of subsequent assignment/game cards, and confirming a lift notification appears, the
effect is no longer marked active on its target player(s), and violations can no longer be
reported against it.

**Acceptance Scenarios**:

1. **Given** a virus effect started with a randomly assigned lift threshold of at least 10,
   **When** that many subsequent assignment/game cards have been drawn, **Then** the virus
   effect ends automatically.
2. **Given** a virus effect has just been lifted, **When** the group is shown the next screen
   state, **Then** a clear notification indicates the virus no longer applies.
3. **Given** a virus effect is lifted, **When** its former target player(s) are viewed,
   **Then** they no longer show as currently affected by that virus effect (other, still-active
   effects on the same player, if any, remain shown).

---

### Edge Cases

- What happens when a "specific" card requires more target players than currently exist in the
  player set (e.g., a card needs 3 targets but only 2 players are in the session)?
- What happens when the shared card set is exhausted while one or more virus effects are still
  counting down toward their lift threshold — does reshuffling reset or preserve that progress?
- What happens if a targeted player is removed from the player set (see feature 001) while
  they have one or more active virus effects?
- What happens if a virus card is drawn while no other assignment/game cards remain to count
  toward its lift threshold?
- What happens when the same virus card definition ends up targeting the same player twice
  concurrently (two independent active effects from the identical virus text)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow the group to draw one card at a time (assignment, game, or
  virus) from the current session's shared, shuffled card set, without requiring a fixed
  per-player turn order to do so.
- **FR-002**: System MUST determine, for each drawn card, whether it targets all players
  (general) or a specific number of players, per that card's own definition.
- **FR-003**: For a "specific" card, system MUST randomly select the card's required number of
  target player(s) from the current player set (added via the existing player-management
  feature) at the moment it is drawn.
- **FR-004**: System MUST display each drawn card's instruction text together with a clear
  indication of who it applies to (all players, or the specific randomly-selected player(s)).
- **FR-005**: System MUST visually distinguish "game" cards from plain "assignment" cards,
  while resolving both the same way functionally (see FR-006).
- **FR-006**: For assignment and game cards, system MUST allow the group to record the
  target player's (or players') success or failure, and MUST add the card's penalty points to
  the relevant player total(s) when marked failed; MUST add no penalty when marked successful.
- **FR-007**: For a virus card, system MUST start an active virus effect on the resolved target
  player(s) instead of requesting a success/failure resolution, and MUST NOT apply any penalty
  points automatically when the effect starts.
- **FR-008**: System MUST assign each newly-started virus effect a randomly chosen lift
  threshold of at least 10 subsequent assignment/game draws, and MUST track progress toward
  that threshold as such cards are drawn.
- **FR-009**: System MUST automatically end an active virus effect once its lift threshold has
  been reached, and MUST clearly notify the group that the virus no longer applies.
- **FR-010**: System MUST visibly indicate, at all times, every player with one or more
  currently active virus effects, and which effect(s) each is.
- **FR-011**: System MUST allow more than one virus effect to be active at the same time,
  including more than one active effect on the same player simultaneously and independently.
- **FR-012**: System MUST allow the group to report a rule violation against any currently
  active virus effect at any time while it remains active, and MUST add that virus card's
  defined penalty point value to the target player's (or players') total each time a violation
  is recorded.
- **FR-013**: System MUST support recording multiple, separate violations against the same
  active virus effect over its lifetime, applying the penalty points again each time.
- **FR-014**: System MUST NOT allow a violation to be recorded against a virus effect that has
  already been lifted.
- **FR-015**: System MUST organize assignment, game, and virus content into named sets that a
  session is played with. Editing this content from within the app is out of scope for this
  feature.
- **FR-016**: System MUST reshuffle previously drawn cards back into a new draw pile once the
  shared card set is exhausted, so the session can continue indefinitely.

### Key Entities

- **Card**: A single drawable definition belonging to a card set. Has a type of "assignment",
  "game", or "virus"; an instruction text; and a targeting rule of either "general" (all
  players) or "specific" (a fixed number of randomly chosen players). Assignment and game cards
  define a penalty point value applied on failure; virus cards define a penalty point value
  applied each time a violation against them is reported.
- **Card Set**: A named, bundled collection of assignment, game, and virus card definitions that
  a session is played with. Not editable from within the app.
- **Drawn Card**: The record of a card having been drawn during play, including its resolved
  target player(s) (all players for a general card, or the randomly chosen player(s) for a
  specific card) and, for assignment/game cards, its success/failure outcome.
- **Active Virus Effect**: The ongoing state created when a virus card is drawn: its target
  player(s), its progress toward a randomly assigned lift threshold (at least 10 subsequent
  assignment/game draws) after which it automatically ends, and the count/history of violations
  reported against it while active. A player may be the target of multiple concurrent, fully
  independent active virus effects.
- **Player**: An existing entity (added via the game's player list, feature 001) that
  accumulates penalty points from failed assignment/game cards and from reported virus
  violations, and may be the target of multiple simultaneously active virus effects.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can go from a card being drawn to the group understanding its type,
  instruction, and target(s) in under 10 seconds of reading time.
- **SC-002**: 100% of drawn cards resolve their target(s) correctly — all players for a general
  card, or exactly the card's required number of randomly selected players for a specific card.
- **SC-003**: Each active virus effect's progress toward its lift threshold is tracked with zero
  drift or loss across a full session of at least 50 card draws, independent of how many other
  virus effects are simultaneously active.
- **SC-004**: When a virus effect lifts, a clear notification is shown on-screen in 100% of
  cases, without requiring an explanation from other players.
- **SC-005**: 100% of reported virus violations apply exactly the reporting virus's defined
  penalty point value to the correct target player(s), regardless of how many other virus
  effects or prior violations are simultaneously active or already recorded.

## Assumptions

- There is no fixed per-player turn order for drawing cards; any player in the group can
  trigger the next draw, and each card's own definition (general, or specific with a target
  count) determines who it applies to via random selection at draw time.
- "Game" cards are functionally identical to "assignment" cards (same success/failure and
  penalty-point handling) and differ only in visual presentation/labeling.
- Only assignment and game draws advance an active virus effect's lift-threshold progress;
  drawing a virus card does not itself count toward any other active virus effect's threshold.
- The number of target players required by a "specific" card (one or more) is fixed, static
  data defined per card in its card set, not something decided dynamically at runtime.
- Card/content authoring (the actual instruction texts, penalty values, target counts, and
  which sets are played with) is out of scope for this feature; it is treated as static seed
  data the drawing/targeting/virus mechanics consume, consistent with "questions don't need to
  be editable via the app."
- Multiple concurrent virus effects — including duplicate instances of the same virus card
  definition — may be independently active on the same player at once; each is tracked, scored,
  and lifted completely independently of the others.
- The existing player list and penalty point totals (from feature 001 and the base game) are
  reused as-is; this feature adds card targeting, active virus effects, and violation-based
  scoring on top of that existing scoring mechanism rather than replacing it.
