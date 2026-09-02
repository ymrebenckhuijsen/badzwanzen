# Research: Tweede batch nieuwe vragen toevoegen aan de Badzwanzen-set

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this codebase is small and
already well understood from prior features (010, 014, 015). This document records the concrete
decisions made from reading the existing implementation and the raw input, not open unknowns.

## Decision 1: Where and how to add the new content

**Decision**: Convert `raw-input.md` into `Card` objects appended to the existing `cards` array
in `badzwanzen-card-set.ts`, following the exact classification convention used in features
010/014/015: a leading `Naam`/`Spel`/`Virus`/`Iedereen` word (or an equivalent phrasing, e.g. "De
speler met de meeste...", "Wie ooit...") determines the card's `type` and `targeting`, matching
however the existing set already classifies structurally identical lines. Player-name
placeholders become `{player}` tokens per the existing convention, with the token count matching
`targeting.count` for `specific`-targeted cards (0 tokens for `general`-targeted cards, exactly 1
in `liftText` for every virus card).

**Rationale**: This matches FR-001 (append to the existing set, not a new catalog entry) and
FR-002/005 (must keep passing `validateCardSet`'s existing thresholds — already comfortably
cleared today at 628 cards, 102 virus cards). It reuses a conversion pattern the project has
already validated three times (010, 014, 015), so there is no new process to design.

**Alternatives considered**:
- *New separate card set* — explicitly rejected by FR-007 (catalog and seed set stay unchanged;
  this is purely additive content within the existing Badzwanzen set).

## Decision 2: Handling the first line as a virus card

**Decision**: The raw input's opening line — "Virus iedereen praat vanaf nu met een harde G 1
strafpunt als je het niet doet" — is not prose framing; it converts to one `Card` with
`type: 'virus'`, `targeting: { kind: 'general' }`, exactly like any other `Virus iedereen ...`
line found throughout the three numbered lists.

**Rationale**: Its shape (`Virus` prefix, "iedereen", a described effect, a strafpunt penalty for
non-compliance) is structurally identical to dozens of other virus cards already in the set (e.g.
`bz-virus-001`'s "De oneven strafpunten worden nu verdubbeld."). Treating it as anything other
than a normal virus card (e.g. as a title or instruction) would silently drop a real card, which
FR-001 doesn't allow.

**Alternatives considered**: None — this was flagged explicitly in `raw-input.md` and confirmed
by inspection; there's no reasonable alternative reading.

## Decision 3: Deduplication approach (new for this batch — FR-006)

**Decision**: Deduplication is a manual authoring/review step performed while converting the raw
lines, not a new automated mechanism added to the codebase. Two lines are treated as duplicates
when they ask for the *same mechanic/question in substance*, even if worded differently — judged
by a human/LLM reading pass, not a fuzzy-string-matching algorithm. Three passes are needed:
1. **Within-batch, across the three numbered lists**: the three lists in `raw-input.md` overlap
   heavily (e.g. multiple "noem 5 dingen die je in een rugzak kunt vinden"-style prompts, several
   "virus naam mag alleen antwoorden met..." variants, repeated "de speler met de meeste... neemt
   N strafpunten" templates across all three lists) — each distinct mechanic is converted once.
2. **Within-batch, near-duplicate templates with different fill-in values**: lines that reuse the
   same template with a different category/number (e.g. "noem 5 dingen die je in een keuken/
   apotheek/garage/koffer vindt") are **not** duplicates of each other — the category is the
   content of the card, matching how the existing set already contains many same-template,
   different-detail cards. Only lines asking for the literal same thing count as duplicates.
3. **Against the existing set**: a converted line is dropped if the existing ~628-card set
   (including features 010/014/015 content) already has a card asking for the same thing in
   substance.

**Rationale**: FR-006 explicitly asks for substance-based, not literal-string, deduplication
("Inhoudelijk duplicaat... wordt beoordeeld op betekenis, niet op exacte tekstgelijkheid" — see
spec Assumptions). Building a real fuzzy-matching/dedup algorithm into the codebase for a
one-time content-authoring task would violate Constitution Principle III (Simplicity & YAGNI) —
this is exactly the kind of speculative infrastructure the constitution asks to avoid when three
similar lines (or one careful reading pass) suffice. The resulting `badzwanzen-card-set.test.ts`
gets a **verification** assertion (no two `instructionText`s are byte-identical, as a cheap floor
check) but the substantive judgment call happens during conversion, at task-execution time, not
via new runtime code.

**Alternatives considered**:
- *Automated fuzzy-matching dedup script* — rejected: one-time task, not a recurring capability
  the app needs; adds a maintenance surface for zero ongoing value (Constitution Principle III).
- *No deduplication (like features 010/014)* — rejected: FR-006 explicitly asks for the opposite
  behavior for this specific batch, per the user's own note in `raw-input.md`.

## Decision 4: Unique, content-specific `liftText` per new virus card

**Decision**: Every new virus card gets a bespoke `liftText` that names the specific behavior
that is ending (matching the pattern already used for all 102 existing virus cards), and the
existing set-wide `validateCardSet` uniqueness rule guards against accidental duplicates across
the whole set, old and new cards combined.

**Rationale**: Directly required by FR-003/FR-004 and already enforced by an existing validation
rule (`validateCardSet.ts` lines 46–61) that fails the build/tests on any duplicate `liftText`
among virus cards — no new validation logic needed, only correctly authored content. This mirrors
Decision 4 of feature 015's research.md exactly.

**Alternatives considered**: None — this is a content-authoring task constrained by an existing,
adequate validation rule, not a design decision with real alternatives.
