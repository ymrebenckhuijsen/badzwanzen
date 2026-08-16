# Specification Quality Checklist: Actieve-virussenlijst verbeteren

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-16
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Alle items geslaagd bij eerste validatie-run. Geen [NEEDS CLARIFICATION]-markers nodig:
  - De "iedereen"-groepering (User Story 1) volgt hetzelfde precedent als feature 015's
    groepering van het eindbericht (`targetPlayerId: string | null` in `VirusLiftCard`/
    `App.tsx`), dus een consistente aanpak lag voor de hand.
  - Het maximum (User Story 2) is een simpele constante-wijziging (`MAX_ACTIVE_VIRUSES`,
    `useDrawPile.ts`), geen ambiguïteit.
  - "De tekst van het virus" (User Story 3) is eenduidig gekoppeld aan de bestaande
    `instructionText` van de viruskaart (via `cardId` op `ActiveVirusEffect`), niet aan het
    eindbericht — vastgelegd als Assumption om verwarring met `liftText` te voorkomen.
