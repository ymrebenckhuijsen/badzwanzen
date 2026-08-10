# Data Model: Kaartensets

**Scope note**: this feature does not change `Card`, `SessionCardPool`, `DrawnCard`, or
`ActiveVirusEffect` from feature 004 — see [`specs/004-assignments-and-viruses/data-model.md`](../004-assignments-and-viruses/data-model.md)
for those. It extends `CardSet` from "one implicit, hardcoded set" to "one of several, chosen
per session," and adds two new concepts: the catalog of available sets, and the persisted
session-setup choice of which one to use.

## Entity: CardSet (existing, from feature 004 — unchanged shape, now one-of-many)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | yes | Unique within the catalog (research.md). Identifies which bundled content set a session is played with. |
| `name` | `string` | yes | Display name shown to the user when choosing a set (FR-002). Must be unique across the whole catalog (FR-008) — enforced as a build/test-time check, not a runtime constraint (research.md). |
| `cards` | `Card[]` | yes | Unchanged from feature 004: at least 80 cards, at least 4 of type `"virus"` (existing `validateCardSet` rules, reused unmodified per spec.md Assumptions). |

No new fields. What changes is cardinality: previously exactly one `CardSet` (`seedCardSet`)
existed and was implicitly used everywhere; now zero-or-more additional sets can exist
alongside it, and a session picks exactly one (FR-001, FR-005).

## Entity: CardSetCatalog (new — build-time, not runtime, data)

Not a stored/persisted entity — a plain, statically-imported array
(`cardSetCatalog: CardSet[]`, research.md) listing every `CardSet` bundled with the app. Always
contains the seed test set (FR-003) plus zero or more "real" sets. As of 2026-08-09 the catalog
is `[badzwanzenCardSet, seedCardSet]` — `badzwanzenCardSet` (380 cards, converted from
`specs/010-card-sets/badzwanzen.txt`) listed **first**, which is what makes it the production
default (see the persistence section below and research.md's revised fallback decision).

| Field | Type | Notes |
|-------|------|-------|
| *(the array itself)* | `CardSet[]` | Every entry must independently pass `validateCardSet` with no errors (FR-006), and no two entries may share a `name` (FR-008). Both checked by a single Vitest test against the real catalog (research.md), not at runtime — an entry that fails either check simply can't reach `main` (Constitution Principle V), so by construction every entry the running app ever sees is valid and uniquely named. |

## Entity: SessionCardSetSelection (new — setup-time state + persisted last choice)

The card-set analogue of feature 001's player-list setup state: which `CardSet` is active for
the session currently being set up (and, once chosen, for the whole session that follows —
FR-012).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `selectedCardSetId` | `string` | yes (once resolved) | The `id` of the chosen entry in `cardSetCatalog`. Drives which `CardSet` `buildSessionCardPool` is called with (FR-004, FR-005) — the same session-pool/draw machinery from feature 004, just fed the chosen set instead of always `seedCardSet`. |

### Persistence (FR-010, FR-011)

Persisted the same way as feature 001's player list (`src/lib/storage.ts`, `localStorage`,
research.md): one new key, `badzwanzen:selected-card-set-id`, storing just the `id` string.

- **On session setup start**: read the stored id. If it names an entry still present in
  `cardSetCatalog`, that entry is the pre-selected default (FR-010). If it's absent, unset, or
  names an entry no longer in the catalog (e.g. removed by an app update — spec.md Edge Cases),
  the catalog's **first entry** is the default instead (FR-011, revised 2026-08-09) —
  `badzwanzenCardSet` in production, since it's listed first; the seed set remains always
  selectable (FR-003) but is no longer the specific fallback target now that real content
  exists (research.md).
- **On explicit user choice**: overwrite the stored id with the newly chosen set's `id`
  immediately (so the *next* session setup — not the current one — sees it as the default).
- **Auto-select, single set (FR-007)**: if `cardSetCatalog.length === 1`, that one entry is
  used directly; no choice UI is shown, and the stored id is still updated to match (keeping the
  "last selected" value consistent even though no explicit choice occurred).

### Session lock (FR-012)

Once session setup transitions to `GameScreen` (i.e., the resolved `CardSet` is handed to
`buildSessionCardPool`), the selection is fixed React state for that `GameScreen` mount — there
is no code path that changes it mid-session (mirrors how feature 004's `players` prop is
likewise fixed once `GameScreen` mounts). Changing sets requires returning to session setup
(spec.md Edge Cases).

**Interaction with feature 008's end-of-game replay** (merged after this plan was first
drafted — see research.md): `App.tsx` has two ways out of a finished session, and they treat the
locked `CardSet` differently:

- **"Speel opnieuw"** (`onPlayAgain`) — remounts `GameScreen` with a brand-new
  `SessionCardPool` but the *same* `players` **and the same locked `CardSet`**; it does not
  return through `CardSetSelectionScreen` (research.md decision, mirroring how it already
  doesn't return through `PlayerSetupScreen`).
- **"Spelers wijzigen"** (`onChangePlayers`) — resets `players` to `null`, and per the same
  decision also resets `cardSet` to `null`, so the next session runs the full setup flow again,
  including a fresh card-set choice.

`SessionCardSetSelection` is therefore locked per *setup pass* (players + card set chosen
together), not per individual `SessionCardPool` — a "Speel opnieuw" replay is a new
`SessionCardPool`/new session under feature 004's existing definition, but not a new *setup
pass*, so it does not re-open the choice.

## Relationships

```text
CardSetCatalog 1---* CardSet          (static, build-time list; every entry pre-validated + uniquely named)
SessionCardSetSelection 1---1 CardSet (selectedCardSetId resolves to exactly one catalog entry, with seed-set fallback)
CardSet 1---1 SessionCardPool         (per session — unchanged from feature 004, now fed the *selected* set instead of always the seed set)
```
