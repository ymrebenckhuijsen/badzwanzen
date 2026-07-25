# Data Model: Spelers toevoegen

## Entity: Player

Represents one participant added to the current game setup session.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | yes | Stable identifier for the player within this session, generated when added (e.g. `crypto.randomUUID()`). Used as the React list key and as the target for removal — never derived from the name, since names are not guaranteed unique across the app's lifetime of use. |
| `name` | `string` | yes | Display name as typed by the user. Trimmed of leading/trailing whitespace before storage. |
| `order` | `number` | yes | Position in which the player was added (0-based). Determines display order in the list; matches the array index in storage. |

### Validation rules (from spec Functional Requirements)

- `name` MUST NOT be empty after trimming whitespace (FR-007).
- `name` MUST be unique (case-sensitive match after trimming) among currently-added players;
  a duplicate is rejected, not added (FR-011).
- The collection of players MUST NOT exceed 20 entries (FR-012). The 21st add attempt is
  rejected.
- The collection MUST contain at least 2 entries before the game can be started (FR-010).

### Lifecycle

1. **Empty**: no players added yet (initial state).
2. **Building**: 1–20 players added; players may be added or removed (FR-008) in this state.
   State is persisted to `localStorage` after every change (FR-013).
3. **Ready**: ≥2 players added; the play action becomes available (still in the "Building"
   state otherwise, just with the play control enabled/disabled accordingly — this is a
   derived UI state, not a separate stored state).
4. **Started**: the play action was triggered; the current player list is handed off to the
   (out of scope) game itself. What happens to the `localStorage` entry after this point is
   out of scope for this feature (see spec Assumptions).

### Storage representation

- **Key**: `badzwanzen:players`
- **Value**: JSON-serialized array of `Player` objects, in display order (so `order` is
  redundant with array index but kept explicit for clarity when reading/debugging storage).

```json
[
  { "id": "a1b2c3", "name": "Yara", "order": 0 },
  { "id": "d4e5f6", "name": "Tom", "order": 1 }
]
```

No other entities are involved in this feature.
