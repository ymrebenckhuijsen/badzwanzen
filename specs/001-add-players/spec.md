# Feature Specification: Spelers toevoegen

**Feature Branch**: `001-add-players`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "spelers toevoegen dat doe je door op een + knop te drukken en dan een naam in te voeren je kan meerdere spelers toevoegen en je moet ze allemaal zien en als je klaar bent staat er een knop met een play icoon om het spel te starten"

## Clarifications

### Session 2026-07-25

- Q: Wat is het maximum aantal spelers dat toegevoegd kan worden? → A: Maximum van 20 spelers.
- Q: Blijft de ingevoerde spelerslijst behouden bij een refresh/afsluiten vóór het spel start? → A: Ja, bewaard in `localStorage` tot het spel start.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Een speler toevoegen (Priority: P1)

Als gebruiker die een spelsessie voorbereidt, druk ik op een "+" knop, voer ik de naam van
een speler in, en zie ik die speler daarna terug in de lijst van deelnemers.

**Why this priority**: Dit is de kernhandeling van de hele feature — zonder deze stap kunnen
er helemaal geen spelers worden toegevoegd en kan er niet gestart worden.

**Independent Test**: Volledig te testen door op de "+" knop te drukken, een naam in te
voeren en te bevestigen, en te verifiëren dat die naam als nieuwe speler in de lijst
verschijnt.

**Acceptance Scenarios**:

1. **Given** een lege spelerslijst, **When** de gebruiker op de "+" knop drukt, een naam
   invoert en bevestigt, **Then** verschijnt die naam als nieuwe speler in de zichtbare lijst.
2. **Given** een spelerslijst met 1 speler, **When** de gebruiker opnieuw op "+" drukt en een
   tweede naam invoert en bevestigt, **Then** bevat de lijst beide spelers.
3. **Given** het invoerveld voor een naam staat open, **When** de gebruiker niets invoert (of
   alleen spaties) en probeert te bevestigen, **Then** wordt er geen speler toegevoegd.
4. **Given** een speler met een bepaalde naam is al toegevoegd, **When** de gebruiker
   opnieuw dezelfde naam invoert en probeert te bevestigen, **Then** wordt de naam niet
   toegevoegd en krijgt de gebruiker een duidelijke melding dat de naam al bestaat.

---

### User Story 2 - Alle toegevoegde spelers zien (Priority: P2)

Als gebruiker die spelers aan het toevoegen ben, wil ik alle tot nu toe toegevoegde spelers in
één overzicht zien, zodat ik weet wie er meedoet voordat het spel start.

**Why this priority**: Ondersteunt en bouwt voort op User Story 1 (toevoegen heeft weinig
waarde als je niet kunt controleren wie al is toegevoegd), maar is op zichzelf waarneembaar en
testbaar.

**Independent Test**: Te testen door meerdere spelers toe te voegen en te verifiëren dat alle
namen tegelijk zichtbaar zijn in het overzicht.

**Acceptance Scenarios**:

1. **Given** 3 toegevoegde spelers, **When** het scherm getoond wordt, **Then** zijn alle 3
   namen zichtbaar in de lijst.
2. **Given** meerdere toegevoegde spelers, **When** een nieuwe speler wordt toegevoegd,
   **Then** blijven de eerder toegevoegde spelers zichtbaar in de lijst.

---

### User Story 3 - Het spel starten (Priority: P3)

Als gebruiker die klaar is met het toevoegen van spelers, druk ik op de knop met het
play-icoon om het spel te starten met de spelers die ik heb toegevoegd.

**Why this priority**: Sluit de flow af. Zonder deze stap kan het eigenlijke spel niet
beginnen, maar de waarde van User Story 1 en 2 (spelers toevoegen en zien) staat daar
los van.

**Independent Test**: Te testen door voldoende spelers toe te voegen, te verifiëren dat de
play-knop verschijnt/bruikbaar is, erop te drukken, en te controleren dat het spel start met
de op dat moment toegevoegde spelers.

**Acceptance Scenarios**:

1. **Given** het minimum vereiste aantal spelers is toegevoegd, **When** de gebruiker op de
   play-knop drukt, **Then** start het spel met de volledige, actuele lijst van spelers.
2. **Given** minder dan het minimum vereiste aantal spelers, **When** het scherm getoond
   wordt, **Then** is de play-knop niet beschikbaar of duidelijk gemarkeerd als niet
   bruikbaar.

---

### Edge Cases

- Wat gebeurt er als de gebruiker een lege naam (of alleen spaties) probeert toe te voegen?
- Wat gebeurt er als de gebruiker dezelfde naam meerdere keren invoert? (zie FR-011: wordt
  geweigerd met een melding)
- Wat gebeurt er als de gebruiker op de play-knop drukt terwijl het minimum aantal spelers nog
  niet is bereikt?
- Wat gebeurt er bij een zeer lange spelersnaam die niet volledig past in de lijst-weergave?
- Wat gebeurt er als de gebruiker probeert een 21e speler toe te voegen? (zie FR-012: niet
  toegestaan, "+" knop niet bruikbaar of melding)
- Wat gebeurt er als de gebruiker de pagina ververst of de app sluit voordat het spel is
  gestart? (zie FR-013: de spelerslijst blijft bewaard tot het spel start)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Systeem MUST een "+" knop tonen waarmee de gebruiker een nieuwe speler kan
  toevoegen.
- **FR-002**: Systeem MUST bij het indrukken van de "+" knop een manier bieden om een naam in
  te voeren voor de nieuwe speler.
- **FR-003**: Systeem MUST een ingevoerde naam na bevestiging toevoegen aan de lijst van
  spelers.
- **FR-004**: Systeem MUST de gebruiker toestaan dit proces te herhalen om meerdere spelers na
  elkaar toe te voegen.
- **FR-005**: Systeem MUST alle op dat moment toegevoegde spelers gelijktijdig zichtbaar tonen
  in een overzicht.
- **FR-006**: Systeem MUST een knop met een play-icoon tonen waarmee de gebruiker het spel kan
  starten.
- **FR-007**: Systeem MUST voorkomen dat een lege naam (niets, of alleen witruimte) als speler
  wordt toegevoegd.
- **FR-008**: Systeem MUST toestaan dat een reeds toegevoegde speler weer verwijderd wordt
  voordat het spel gestart is.
- **FR-009**: Systeem MUST het spel starten met de volledige, actuele lijst toegevoegde
  spelers zodra op de play-knop wordt gedrukt.
- **FR-010**: Systeem MUST minimaal 2 toegevoegde spelers vereisen voordat de play-knop
  gebruikt kan worden om het spel te starten.
- **FR-011**: Systeem MUST voorkomen dat twee spelers dezelfde naam hebben; bij een poging om
  een naam toe te voegen die al in de lijst staat, wordt de speler niet toegevoegd en krijgt
  de gebruiker een duidelijke melding dat de naam al in gebruik is.
- **FR-012**: Systeem MUST een maximum van 20 spelers hanteren; zodra dit maximum bereikt is,
  kan de gebruiker geen nieuwe spelers meer toevoegen (de "+" knop is niet meer bruikbaar of
  toont een melding dat het maximum is bereikt).
- **FR-013**: Systeem MUST de op dat moment ingevoerde spelerslijst bewaren in client-side
  opslag (`localStorage`) zodat een paginaverversing of het (per ongeluk) sluiten van de app
  vóór het starten van het spel de ingevoerde spelers niet verloren laat gaan.

### Key Entities *(include if feature involves data)*

- **Speler**: Vertegenwoordigt een deelnemer aan de spelsessie. Kernattribuut is de naam zoals
  ingevoerd door de gebruiker, plus de volgorde waarin de speler is toegevoegd. Bestaat alleen
  voor de duur van de huidige spelsessie.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Een gebruiker kan een nieuwe speler toevoegen (drukken op "+", naam intypen,
  bevestigen) in minder dan 10 seconden.
- **SC-002**: Alle toegevoegde spelers zijn, ongeacht het aantal, terug te vinden in het
  overzicht zonder dat er spelers "verdwijnen" of onzichtbaar blijven.
- **SC-003**: 100% van de pogingen om het spel te starten met het vereiste minimumaantal
  spelers slaagt zonder foutmeldingen.
- **SC-004**: Een nieuwe gebruiker die de app voor het eerst opent, begrijpt zonder verdere
  uitleg hoe spelers toegevoegd en het spel gestart wordt (te verifiëren via een informele
  gebruikstest).

## Assumptions

- Dit scherm is het allereerste scherm van de app: de spelerslijst wordt hier opgebouwd vóór
  het eigenlijke spel (vragen/spellen) begint.
- Er is geen account- of inlogsysteem; spelersnamen gelden alleen voor de huidige spelsessie
  (in lijn met de projectconstitutie: client-side, geen backend). De lijst wordt tijdens het
  toevoegen bewaard in `localStorage` (zie FR-013) zodat een refresh vóór het starten van het
  spel niets kwijtraakt; wat er ná het starten van het spel met deze opslag gebeurt, valt
  buiten de scope van deze feature.
- Er geldt een maximum van 20 spelers (zie FR-012 en Clarifications).
- Spelersnamen worden puur als weergavetekst gebruikt (bijvoorbeeld om later in vragen genoemd
  te worden) en hebben geen verdere validatie nodig dan "niet leeg".
