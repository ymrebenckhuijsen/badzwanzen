# Feature Specification: End of Game Screen

**Feature Branch**: `008-end-of-game`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Einde van het spel: eindscherm/afronding van een potje"

## Clarifications

### Session 2026-07-27

- Q: When does the end-of-game screen appear relative to the session's last card? → A: The last card is shown and resolved normally like any other card; the end-of-game screen only appears once the group takes the next "draw" action and finds the pool empty.
- Q: What happens to session state (players, progress, end-of-game screen) if the page is refreshed? → A: Refreshing loses all session state and returns to the player setup screen; surviving a reload is out of scope for this feature (a separate future feature, consistent with the assignment/game/virus card loop feature also not handling this).
- Q: When "change players" is chosen from the end-of-game screen, what state does the player setup screen open in? → A: Pre-filled with the same player list from the just-ended session, ready to edit (add/remove names) before starting.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See a clear end-of-game screen when the session finishes (Priority: P1)

When the group's game session (a "potje") reaches its natural end — its draw pool of
assignment, game, and virus cards is exhausted — the next time the group tries to draw a card,
the app shows an end-of-game screen instead, so the group clearly understands the session is
over instead of the app simply having no more cards to show.

**Why this priority**: This is the entire point of the feature — without it, a session just
stops producing cards with no clear resolution, leaving the group unsure whether something broke
or the game actually ended.

**Independent Test**: Can be fully tested by playing through a session until its draw pool is
exhausted and confirming the end-of-game screen appears automatically.

**Acceptance Scenarios**:

1. **Given** a session in progress with exactly one card left in the pool, **When** that last
   card is drawn, **Then** it is shown and resolved the same way as any other card (no early
   transition to the end screen).
2. **Given** the session's last card has just been resolved, **When** the group next triggers
   the "draw" action, **Then** the app finds the pool empty and shows the end-of-game screen
   instead of a card.
3. **Given** the end-of-game screen is showing, **When** the group looks at it, **Then** it
   lists the players who took part in the session.

---

### User Story 2 - Start a new game from the end screen (Priority: P2)

From the end-of-game screen, the group can immediately start a new session with the same set of
players, without needing to re-enter everyone's names, or choose to return to the player setup
screen to change who's playing.

**Why this priority**: Closes the loop back into the app so the group can keep playing without
friction, but the app is still fully usable (a group can just close the tab) if this isn't
present, so it's the lowest priority.

**Independent Test**: Can be fully tested by reaching the end-of-game screen and confirming both
a "play again" action (which starts a fresh session with the same players) and a "change
players" action (which returns to the player setup screen) are available and work as expected.

**Acceptance Scenarios**:

1. **Given** the end-of-game screen is showing, **When** the group chooses "play again",
   **Then** a new session starts immediately with the same players and a freshly built draw
   pool.
2. **Given** the end-of-game screen is showing, **When** the group chooses "change players",
   **Then** the app returns to the player setup screen, pre-filled with the same player list
   from the just-ended session, ready to edit instead of starting a new session.

---

### Edge Cases

- What happens if a session's draw pool is exhausted almost immediately (a very short pool)?
  The last card is still shown and resolved normally, and the end-of-game screen still appears
  correctly the next time the group tries to draw.
- What happens if the group simply closes or navigates away from the app mid-session, without
  the pool being exhausted? No end-of-game screen is shown or required — ending a session early
  is out of scope for this feature (see Assumptions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST show the end-of-game screen when the group triggers the "draw"
  action and the session's pool has no cards left, rather than transitioning to it automatically
  the instant the last card is drawn — the last card itself is always shown and resolved
  normally like any other card first.
- **FR-002**: The end-of-game screen MUST list every player who took part in the session.
- **FR-003**: The end-of-game screen MUST offer a "play again" action that starts a new session
  with the same players and a newly built draw pool.
- **FR-004**: The end-of-game screen MUST offer a "change players" action that returns to the
  player setup screen, pre-filled with the same player list from the just-ended session ready
  to edit, instead of starting a new session.
- **FR-005**: The system MUST NOT show the end-of-game screen at any other time than when a
  session's draw pool has actually been exhausted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of sessions that exhaust their draw pool show the end-of-game screen the next
  time the group tries to draw a card, with no extra steps beyond that normal "draw" action.
- **SC-002**: A group can go from that "draw" attempt on an empty pool to seeing the end-of-game
  screen in under 2 seconds.
- **SC-003**: A group can go from the end-of-game screen to a freshly started new session with
  the same players in a single action (one tap/click).

## Assumptions

- "Potje" (a round) refers to one game session as already defined by the assignment/game/virus
  card loop: a session's draw pool is built once at start and the session ends when that pool is
  exhausted.
- Ending a session manually before its draw pool is exhausted is explicitly **out of scope** for
  this feature; the end-of-game screen only ever appears when the pool naturally runs out.
- Scoring, penalty point totals, rankings, and declaring a winner/loser are explicitly **out of
  scope** for this feature and will be addressed by a separate feature. The end-of-game screen
  in this feature only confirms the session is over and lists who played.
- Any active virus effects at the moment a session ends are lifted by the existing
  assignment/game/virus card loop behavior; this feature does not duplicate or alter that
  lifecycle.
- Surviving a page refresh/reload (mid-session or on the end-of-game screen) is explicitly
  **out of scope** for this feature; a reload loses all session state and returns to the player
  setup screen. This is consistent with the assignment/game/virus card loop feature also not
  addressing reload-resilience, and would be handled by a separate future feature if needed.
