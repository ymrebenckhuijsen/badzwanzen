# Research: Kaartensets

The feature spec has zero `NEEDS CLARIFICATION` markers. It deliberately leaves several
implementation-level questions open (how "the catalog" is represented in code, how validity/
uniqueness get enforced, where the selection step slots into the existing screen flow). This
document makes those decisions so `data-model.md` and `tasks.md` have a single, consistent
design to build from. None of these decisions contradict an acceptance scenario or functional
requirement; they fill gaps the spec left to planning.

## Decision: the catalog is a plain, statically-imported array of `CardSet` — no runtime registry

**Decision**: `src/features/cards/data/card-set-catalog.ts` exports a single
`cardSetCatalog: CardSet[]` built by importing each known `CardSet` module (starting with the
existing `seedCardSet`) and listing it in an array literal. Adding a new "real" set (FR-009) is:
author a new `CardSet` data module (same shape as `seed-card-set.ts`), add one import + one
array entry. No dynamic loading, no filesystem scanning, no admin UI.

**Rationale**: Constitution Principle III (Simplicity & YAGNI) and Principle IV (zero-cost,
client-side, static site) both push against any kind of runtime set registry, plugin system, or
content-management layer — none of that is needed for "a developer occasionally adds a
hardcoded set," which is explicitly the only supported way to add content per spec.md
Assumptions. This exactly mirrors how `seedCardSet` already exists today (a static TS module),
just generalized from one implicit set to an explicit list of one-or-more.

**Alternatives considered**: A registry with `registerCardSet()` calls, or loading set JSON from
`public/` at runtime, were considered and rejected — both add indirection and (for the JSON
option) a fetch/loading-state concern with no corresponding requirement.

## Decision: validity (FR-006) and name-uniqueness (FR-008) are enforced as build/test-time gates, not runtime filtering

**Decision**: A single test (`card-set-catalog.test.ts`) asserts, for every entry in
`cardSetCatalog`: `validateCardSet(set)` returns no errors, and no two entries share a `name`.
The catalog module itself does no filtering — every entry it exports is trusted to already be
valid, the same way `seedCardSet` is trusted today (validated only by
`seed-card-set.test.ts`, never at runtime).

**Rationale**: This extends the exact pattern feature 004 already established for the single
seed set (FR-013/014/015 there) to N sets, keeping one validation mechanism instead of two. It
also matches Constitution Principle V — CI already runs `npm test` on every push, so a set that
fails validation or duplicates a name simply can't reach `main`. Runtime filtering would be
dead code (nothing in the spec allows a genuinely invalid set to exist in the shipped catalog to
begin with) and would violate Simplicity & YAGNI.

**Alternatives considered**: Filtering `cardSetCatalog` through `validateCardSet` at app startup
(only rendering sets that pass) was considered, since it reads as a more literal implementation
of FR-006's "MOET alleen ... aanbieden die voldoen". Rejected: it would silently hide a broken
set from the selection UI instead of failing CI loudly, which is a worse developer experience
for the one-person team that will actually be adding these sets, and duplicates the
already-established build-gate pattern for no behavioral benefit under this project's actual
constraints (no runtime-editable content, per Assumptions).

## Decision: selection is its own screen, chained between the existing player screen and the game screen

**Decision**: `App.tsx`'s state machine grows from `players: Player[] | null` to also track a
chosen `CardSet | null`. Flow: `PlayerSetupScreen` (unchanged) → **new**
`CardSetSelectionScreen` → `GameScreen`. If `cardSetCatalog.length === 1`, `CardSetSelectionScreen`
auto-selects that one set and calls its "continue" callback immediately on mount, rendering
nothing visible (FR-007) — it is still the single place that owns "which set did we pick,"
avoiding a second, parallel auto-select code path in `App.tsx`.

**Rationale**: Matches the approved UI design (`DESIGN.md` — "Kaartenset kiezen" screen, a
distinct step with its own "START SPEL" action) and the acceptance scenario ordering in
spec.md US1 ("de gebruiker opzet... kiest... start"). Keeping auto-select logic inside the
screen component (rather than skipping rendering it from `App.tsx`) means there is exactly one
code path that decides "which set is active," which `App.tsx` doesn't need to duplicate.

**Alternatives considered**: Folding set choice into `PlayerSetupScreen` as one combined screen
was considered and rejected — the approved design (see `DESIGN.md`) is a separate screen, and
combining them would also make the FR-007 auto-skip-when-one-set behavior harder to express
cleanly (it needs to skip a whole screen, not just a section of one).

## Decision: "Speel opnieuw" (feature 008, merged after this plan was first drafted) reuses the locked card set; only "Spelers wijzigen" re-prompts

**Decision**: Feature 008 added an end-of-game screen with two actions on `App.tsx`'s `players`
state: `onPlayAgain` (bumps a `sessionKey`, remounting `GameScreen` with a **new**
`SessionCardPool` but the **same** `players` — it does not return through
`PlayerSetupScreen`) and `onChangePlayers` (resets `players` to `null`, returning fully to
`PlayerSetupScreen`). This feature's `cardSet` state follows the same shape as `players`:
`onPlayAgain` keeps the currently-locked `cardSet` as-is (no re-render of
`CardSetSelectionScreen`, same as it doesn't re-render `PlayerSetupScreen`); only
`onChangePlayers` also resets `cardSet` to `null`, so the full setup flow — including set choice
— runs again from scratch.

**Rationale**: spec.md's Edge Cases only says switching sets "kan pas bij het opzetten van een
nieuwe sessie" (only possible when setting up a new session) — it doesn't by itself say whether
every new `SessionCardPool` must re-prompt. Feature 008 already established the precedent that
"Speel opnieuw" is a *replay shortcut* that reuses the previous setup (same players, no
re-prompt) rather than a full new "opzetten" pass; treating the card-set choice identically
keeps the two pieces of session setup (players, card set) symmetric instead of one persisting
through replay and the other not — an inconsistency a user would find surprising ("why did it
ask me to re-pick a card set but not re-add players?"). `onChangePlayers` is unambiguously a
full return to setup (spec.md's actual "opzetten van een nieuwe sessie"), so resetting the card
set there is the direct, uncontroversial reading of FR-012.

**Consequence**: `App.tsx`'s state shape grows to `players: Player[] | null`,
`cardSet: CardSet | null`, `sessionKey: number` — `cardSet` is set once (alongside the first
`players` value) when `CardSetSelectionScreen` completes, left untouched by `onPlayAgain`, and
reset to `null` by `onChangePlayers` in lockstep with `players`.

**Alternatives considered**: Re-showing `CardSetSelectionScreen` on every "Speel opnieuw" was
considered and rejected — it would contradict the existing "same players, no re-prompt" replay
behavior feature 008 already shipped and reviewed, for no requirement that asks for it.

## Decision: last-selection persistence reuses `src/lib/storage.ts`, one new key

**Decision**: Add `getSelectedCardSetId(): string | null` and
`setSelectedCardSetId(id: string): void` to the existing `src/lib/storage.ts`, under a new
`localStorage` key `badzwanzen:selected-card-set-id` (sibling to the existing
`badzwanzen:players` key). `CardSetSelectionScreen`'s hook reads this on mount, resolves it
against `cardSetCatalog` (`find` by id), and falls back to `seedCardSet` if the id is missing,
unset, or no longer present in the catalog (FR-011) — the same "look up by id, fall back if
gone" shape already used nowhere else in this codebase but directly implied by the requirement.

**Rationale**: FR-010 explicitly says "op dezelfde manier als de bestaande spelerslijst
persistent wordt opgeslagen" — reusing the same module/mechanism (not a second storage
abstraction) is the requirement, not just a convenient default. Constitution Principle IV
requires `localStorage`-only persistence anyway.

**Alternatives considered**: A generic `useLocalStorageState` hook was considered (it would also
simplify `usePlayers`), but that's a refactor of already-shipped, unrelated code with no spec
requirement behind it — out of scope per Simplicity & YAGNI; `usePlayers` is left untouched.

## Decision (revised 2026-08-09): the fallback/default target is the catalog's first entry, not a hardcoded seed-set id

**Decision**: Once the real "Badzwanzen" content set existed, `resolveDefaultId` in
`useCardSetSelection.ts` was changed from "fall back to `seedCardSet.id` specifically" to "fall
back to `catalog[0].id`" — whichever set is listed first. Production's `cardSetCatalog` lists
`badzwanzenCardSet` before `seedCardSet`, so this makes Badzwanzen the production default;
`seedCardSet` remains present (FR-003) but is no longer the fallback target. Unit tests keep
their own fixture catalogs with the seed fixture listed first, so they keep a stable,
seed-based default without needing the real production catalog.

**Rationale**: Direct developer instruction (2026-08-09): "Badzwanzen... should be the set by
default selected... Badzwanzen as default is just for production" — with testing explicitly
allowed to keep using the seed set as its stable default. Keying the fallback off array order
rather than a specific hardcoded id is what makes both halves of that requirement true with one
code path: change catalog order, not hook logic, to change what's default.

## Contracts

No `contracts/` directory: like features 001 and 004, this feature exposes no external
API/CLI/service interface — it's internal client-side selection state and one new screen
component, reusing the existing card/storage modules.
