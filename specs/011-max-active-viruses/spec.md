# Feature Specification: Max Active Viruses

**Feature Branch**: `011-max-active-viruses`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "start een nieuwe feature waar het maxiumum aantal virusen die tegelijkertijd actief zijn 4 is dit betekend dus dat er 4 verschillende virussen maximaal tegelijk actief zijn, zorg ook voor dat alle virussen een eigen einde virus bericht krijgen zodat je weet welk virus is geeindigd"

## Clarifications

### Session 2026-08-10

- Q: When a virus card is drawn while 4 different viruses are already active, what should happen? → A: The draw skips over virus cards while the cap is active — the next non-virus card is drawn instead. The skipped virus card is not lost; it stays in the draw pool and can still be drawn later once a slot opens up.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Virus pile-up is capped at 4 (Priority: P1)

As a group of players, we want the number of different viruses active at the same time to be capped at 4, so the game's rule changes stay tracked and don't pile up into an unplayable mess.

**Why this priority**: This is the core mechanic requested. Without it, a long session can stack many simultaneous rule changes on top of each other, making the game confusing and hard to play.

**Independent Test**: Can be fully tested by playing a session long enough for 4 different viruses to become active, then continuing to draw cards, and confirming no 5th different virus ever becomes active while those 4 remain active.

**Acceptance Scenarios**:

1. **Given** fewer than 4 different viruses are currently active, **When** a virus card is drawn, **Then** the new virus becomes active as normal.
2. **Given** exactly 4 different viruses are currently active, **When** the next card to be drawn is a virus card, **Then** that virus card is skipped and the next eligible non-virus card is drawn and presented instead, and no 5th virus becomes active.
3. **Given** exactly 4 different viruses are active and one of them ends (naturally or forced), **When** a virus card is next drawn, **Then** it is allowed to become active, since only 3 different viruses now remain active.
4. **Given** a virus card was skipped earlier because the cap was full, **When** a slot later opens up, **Then** that same virus card can still be drawn from the pool.

---

### User Story 2 - Every virus has its own end message (Priority: P2)

As a player, when a virus ends, I want a message that clearly and uniquely identifies which virus it is, so I immediately know which rule change just stopped applying, even when several other viruses are still active.

**Why this priority**: Directly requested alongside the cap. It matters most once several viruses can be active at once (enabled by this same feature and by existing multi-virus support), because a generic "a virus ended" message becomes ambiguous exactly when it matters most.

**Independent Test**: Can be fully tested by having two or more different viruses active at the same time, ending one of them, and confirming the shown end message is specific to that virus and reads differently from the end message any of the other active viruses would show.

**Acceptance Scenarios**:

1. **Given** two or more different viruses are active at the same time, **When** one of them ends, **Then** the end message shown names or describes that specific virus's effect, distinct from the other active viruses' end messages.
2. **Given** the full set of virus cards available in the game, **When** their end messages are compared to one another, **Then** no two virus cards share the same end message text.
3. **Given** a virus that targeted multiple players at once, **When** it ends, **Then** its end message still clearly identifies which virus effect ended (in addition to which player(s) it applied to).

---

### Edge Cases

- What happens when two active viruses end during the same draw (e.g., a forced end-of-session lift)? Each ended virus MUST still show its own distinct end message; messages are not merged or replaced with a generic one.
- What happens when a virus targeting "everyone" is active? It still counts as a single virus toward the 4-virus cap, regardless of how many players it affects.
- What happens when the draw pool is exhausted while a virus card was still being skipped due to the cap? The existing end-of-session behavior (all remaining active viruses are force-ended) is unaffected by this feature; a virus card that was never drawn simply never activates that session.
- What happens if a virus card's own text does not describe a clearly distinguishable effect from another virus's? This is a content-authoring concern; the requirement is that the end message text itself is unique per virus, not merely non-identical by accident.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST track how many different viruses are currently active at any point in a game session.
- **FR-002**: System MUST prevent more than 4 different viruses from being active at the same time.
- **FR-003**: When a virus card is drawn while 4 different viruses are already active, the system MUST skip that card without activating a new virus, and continue by drawing the next eligible card instead.
- **FR-004**: A virus card skipped due to the cap MUST remain available to be drawn again later in the same session, once fewer than 4 different viruses are active.
- **FR-005**: A virus that targets multiple players at once MUST still count as exactly one virus toward the 4-virus cap.
- **FR-006**: Every virus MUST have its own end-of-virus message that is unique across all viruses available in the game's card content, so that no two viruses share the same end message text.
- **FR-007**: When a virus ends (whether by reaching its natural end point or by a forced end), the system MUST display that specific virus's own unique end message.
- **FR-008**: When multiple viruses end around the same time, the system MUST show each one's own distinct end message rather than a single combined or generic message.
- **FR-009**: The uniqueness requirement for end messages applies to the full set of virus cards defined in the game's content, not only to the viruses active at any one moment.

### Key Entities *(include if feature involves data)*

- **Virus (card)**: A card that, once drawn and started, applies an ongoing rule change to one or more players until it ends. Each virus card has its own start effect and now must also have its own unique end message.
- **Active Virus**: A virus that is currently in effect for one or more players. Counted toward the session-wide cap of 4 different active viruses regardless of how many players it affects.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In every game session, no more than 4 different viruses are ever active at the same time, regardless of player count or how long the session runs.
- **SC-002**: When a new virus can't start because the cap is full, play continues to the next card with no visible error, pause, or dead turn.
- **SC-003**: 100% of the virus end messages in the game's card content are unique text, so a player reading any end message can identify which virus it belongs to without cross-referencing anything else.
- **SC-004**: When two or more viruses are active and one ends, players can correctly identify which one ended just from reading the end message shown.

## Assumptions

- "4 different viruses" is counted by distinct virus (one count per virus card that has become active), not by the number of players a virus affects — a virus affecting every player still counts as one.
- The 4-virus cap is session-wide (one shared count across the whole game), not a separate cap per player.
- Skipping a virus card due to the cap is a deferral, not a removal — the card stays available in the draw pool for a later turn.
- The existing virus mechanics this feature builds on (random natural end point, forced end-of-session ending, per-player tracking of multiple active viruses) are unchanged by this feature; this feature only adds the concurrency cap and the end-message uniqueness requirement.
- Uniqueness of end messages is a content requirement enforceable against the game's card data, independent of which specific card set is in use.
