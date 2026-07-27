# Data Model: Assignment, Game and Virus Card Loop

**Scope note**: this feature has no scoring mechanism (see spec.md Clarifications,
2026-07-27 — success/fail recording and virus violation reporting/penalties are deferred to a
future feature). There is no `PenaltyPoints` entity, no `DrawnCard.outcome` field, and no
`ActiveVirusEffect.violationCount` field in this data model.

## Entity: Card

A single drawable definition, part of a `CardSet`. Static seed data — never created/edited at
runtime (FR-012).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | yes | Stable identifier within its card set. |
| `type` | `"assignment" \| "game" \| "virus"` | yes | Determines resolution behavior (FR-006, FR-007). `"game"` and `"assignment"` resolve identically; only display differs. |
| `instructionText` | `string` | yes | The text shown when the card is drawn (FR-004). For a "specific" card, contains one `{player}` token per required target (FR-005); "general" card text contains no tokens. This substitution is the *only* place a specific card's target names appear on screen — no separate name list is rendered alongside it (FR-004, research.md). |
| `liftText` | `string` | virus only | Only present/used for `type: "virus"`. The text shown, as its own lift card, when a specific `ActiveVirusEffect` originating from this card is lifted. Always contains exactly one `{player}` token, regardless of `targeting.count` (FR-014, research.md) — a lift always concerns exactly one player. Not applicable to assignment/game cards. |
| `targeting` | `TargetingRule` (see below) | yes | Resolved at draw time, never stored pre-resolved. |

### `TargetingRule`

A discriminated union:

- `{ kind: "general" }` — applies to all players in the session (FR-002).
- `{ kind: "specific", count: number }` — applies to `count` randomly-chosen players from the
  current player set, resolved fresh at draw time (FR-002, FR-003). `count` is fixed, static
  per-card data (see spec Assumptions). If `count` exceeds the number of currently available
  players, the card is discarded unresolved rather than drawn/shown — see "Discarded draws"
  under `SessionCardPool` below (FR-003, clarified 2026-07-26; supersedes an earlier
  clamp-to-available-players draft decision in research.md).

## Entity: CardSet

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | yes | Identifies which bundled content set a session is played with. |
| `name` | `string` | yes | Display name of the set. |
| `cards` | `Card[]` | yes | The full collection of assignment/game/virus definitions in this set. Not editable from within the app (FR-012). Must contain at least 80 cards in total and at least 4 of type `"virus"` (FR-015), so a `SessionCardPool` (below) can always be built from it. |

### Validation (FR-013, FR-014, FR-015)

`validateCardSet(cardSet: CardSet): ValidationError[]` is a pure function checking:

- Per card, if `targeting.kind === "specific"`: the number of `{player}` tokens in
  `instructionText` equals `targeting.count`; if `targeting.kind === "general"`:
  `instructionText` contains zero tokens (FR-013).
- Per virus card: `liftText` contains exactly one `{player}` token (FR-014).
- Across the whole set: `cards.length >= 80` and the count of `type === "virus"` cards is
  `>= 4` (FR-015).

`ValidationError` carries at least an identifier (a `cardId`, or a set-level marker for the
FR-015 checks) and a message. A Vitest test (`seed-card-set.test.ts`) runs this against the real
seed `CardSet`(s) and fails the test suite (and therefore CI, per Constitution Principle V) if
any error is returned — this is the "build-time" check FR-013/014/015 require, since card sets
are fixed data authored before the app runs, not something resolved at runtime.

## Entity: SessionCardPool (session-scoped, in-memory)

Built once when a game session starts (FR-016); replaces the earlier "draw straight from the
full card set, reshuffle on exhaustion" model — there is no reshuffle in this feature.

| Field | Type | Notes |
|-------|------|-------|
| `poolCardIds` | `string[]` | The randomly selected subset of the card set's card ids for this session: size is a random integer in `[60, 80]`, guaranteed to include at least 4 virus-type card ids (research.md "guarantee then fill" decision). Fixed for the lifetime of the session — never added to or reshuffled. |
| `remainingCardIds` | `string[]` | The subset of `poolCardIds` not yet drawn this session. A draw (FR-017) removes one random id from this list — including a discarded draw (see below), which still consumes its id permanently. |
| `hasEnded` | `boolean` | Becomes `true` once `remainingCardIds` becomes empty (FR-017); once `true`, no further draws are possible and end-of-session processing (FR-018) has run. |

### Discarded draws (FR-003, clarified 2026-07-26)

When the next id removed from `remainingCardIds` resolves to a "specific" card whose
`targeting.count` exceeds the current player set's size, that draw is **discarded**: no
`DrawnCard` is created, nothing is shown to the group, no virus effect starts, and it does not
advance any `ActiveVirusEffect.assignmentGameDrawsSinceStart`. The draw loop immediately
continues by removing and evaluating the next id from `remainingCardIds`, repeating until a
resolvable card is found or the pool empties (in which case the session ends, FR-017, exactly
as if the pool had run out on an ordinary draw). The discarded card's id is never returned to
the pool — the player set is fixed for the session's lifetime (no addition; removal isn't
possible mid-game today, see spec Edge Cases), so a card that can't resolve now never could
later in the same session (research.md).

## Entity: DrawnCard

The record produced each time a card is drawn **and successfully resolved** — a discarded draw
(see `SessionCardPool` → "Discarded draws" above) produces no `DrawnCard`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `cardId` | `string` | yes | References the `Card` drawn (from the session's `SessionCardPool`). |
| `type` | `"assignment" \| "game" \| "virus"` | yes | Copied from the card for convenience/history display. |
| `targetPlayerIds` | `string[]` | yes | All player ids for a general card; the randomly-selected subset for a specific card (always exactly `targeting.count` players — insufficient-player draws never reach this record, see above). |
| `drawnAt` | `number` (sequence index) | yes | Monotonic draw counter for this session; used to derive virus lift-threshold progress (research.md, SC-003). |

`DrawnCard` itself stores only `targetPlayerIds`, not a pre-rendered display string. The
`{player}` → name substitution (FR-005) is a pure display-time derivation: given the card's
`instructionText` and `targetPlayerIds` (resolved to names via the player list), replace each
`{player}` token in order with the next target's name. This keeps `DrawnCard` free of
duplicated/denormalized name data (names can't go stale if a player entity ever changes), and
means the rendered text is the sole place target names are shown (FR-004).

## Entity: ActiveVirusEffect

Created when a virus card is drawn; one instance **per targeted player** (see research.md
decision — a "specific, count > 1" virus draw creates multiple independent instances, not one
shared instance).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | yes | Unique per effect instance (not per card definition — the same virus card can produce many concurrent, independent effect instances, including more than one on the same player, per FR-011). |
| `cardId` | `string` | yes | The virus `Card` this effect originated from — supplies `instructionText`/`liftText`. |
| `targetPlayerId` | `string` | yes | The single player this effect applies to. |
| `startedAtDraw` | `number` | yes | The `drawnAt` sequence index of the draw that started this effect. Also used to order forced end-of-session lifts (research.md: oldest first). |
| `liftThreshold` | `number` (≥10) | yes | Randomly assigned when the effect starts (FR-008); number of subsequent assignment/game draws after which this effect auto-lifts (unless force-lifted earlier — see `status`). |
| `assignmentGameDrawsSinceStart` | `number` | yes | Increments by 1 each time an assignment/game card is drawn while this effect is active (FR-008). Effect lifts automatically once this reaches `liftThreshold` (FR-009). |
| `status` | `"active" \| "lifted"` | yes | `"lifted"` effects are excluded from the active-effects display (FR-010). |
| `liftReason` | `"threshold" \| "forced-end"` \| `null` | yes (null while active) | Set when `status` becomes `"lifted"`: `"threshold"` if `assignmentGameDrawsSinceStart` reached `liftThreshold` naturally (FR-009), `"forced-end"` if the session ended while this effect was still active (FR-018). Kept reason-agnostic in the underlying "lift" operation so a future removal-triggered reason can be added without restructuring (research.md). |

### Lifecycle

1. **Active**: created when a virus card's target resolves to this player; `status: "active"`,
   `liftReason: null`, `assignmentGameDrawsSinceStart: 0`.
2. Each subsequent assignment/game draw (of any target) increments
   `assignmentGameDrawsSinceStart` for every still-active effect (FR-008).
3. **Lifted** (`liftReason: "threshold"`): once `assignmentGameDrawsSinceStart >= liftThreshold`,
   `status` becomes `"lifted"` and this virus's `liftText` is shown as a lift card, its one
   `{player}` token replaced with `targetPlayerId`'s name (FR-009).
4. **Lifted** (`liftReason: "forced-end"`): if the session's `SessionCardPool` empties
   (`hasEnded` becomes `true`) while this effect is still `"active"`, it is lifted immediately
   regardless of its progress toward `liftThreshold`, showing the same lift card (FR-018).
   When several effects are force-lifted this way, they are processed in `startedAtDraw`
   ascending order (research.md).

## Entity: Player (existing, from feature 001 — reused, not modified)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Used as the key into `DrawnCard.targetPlayerIds` and `ActiveVirusEffect.targetPlayerId`. |
| `name` | `string` | Display only. |

No new fields are added to `Player` by this feature — in particular, no scoring/points field
(see the scope note at the top of this document). There is no "current drawer" concept anywhere
in this model — no field represents whose turn it is (spec Assumptions).

## Relationships

```text
CardSet 1---* Card
CardSet 1---1 SessionCardPool (per session; a subset of CardSet.cards, built once at session start)
SessionCardPool 1---* DrawnCard  (drawn without replacement; pool exhaustion ends the session)
Card 1---* DrawnCard        (a card definition may be drawn at most once per session, but the same definition can recur across different sessions/pools)
Card 1---* ActiveVirusEffect (only for type: "virus"; one instance per targeted player per draw)
Player 1---* ActiveVirusEffect (targetPlayerId; a player may have many concurrent, independent effects)
```
