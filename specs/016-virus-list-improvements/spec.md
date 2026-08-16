# Feature Specification: Actieve-virussenlijst verbeteren

**Feature Branch**: `016-virus-list-improvements`

**Created**: 2026-08-16

**Status**: Draft

**Input**: User description: "start een nieuwe feature waar als er een virus is voor iedereen dat in plaats van dat het voor elke speler onder de kaart apart laat zien dat hij een virus heeft dat er een icoontje is met iedereen zorg ook dat de maximum aantal virussen tegelijk 3 is en zorg ook dat als je op iemands naam drukt op de plek dat je laat zien hoeveel virussen er actief zijn dat je de text krijgt van het virus"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Eén gedeelde "iedereen"-rij voor een groepsvirus (Priority: P1)

Als speler die de lijst met actieve virussen bekijkt terwijl een virus alle spelers tegelijk
treft, wil ik daar één duidelijke "iedereen"-aanduiding zien in plaats van diezelfde regel
herhaald onder elke individuele spelersnaam, zodat direct duidelijk is dat het om één en
hetzelfde, voor de hele groep geldende virus gaat.

**Why this priority**: Dit is de kern van de gemelde bug/verbetering — vandaag toont de actieve-
virussenlijst een aparte rij per speler, ook als het om precies hetzelfde "iedereen"-virus gaat,
wat de lijst onnodig lang en verwarrend maakt (lijkt op meerdere losse virussen in plaats van
één gedeeld virus).

**Independent Test**: Volledig te testen door een virus te trekken dat "iedereen" target, de
actieve-virussenlijst te openen, en te verifiëren dat er precies één gedeelde "iedereen"-regel
verschijnt (niet één regel per speler).

**Acceptance Scenarios**:

1. **Given** een actief virus dat "iedereen" target, **When** de speler de actieve-
   virussenlijst bekijkt, **Then** staat dat virus als één gedeelde "iedereen"-regel in de lijst,
   niet als afzonderlijke regels per speler.
2. **Given** een actief virus dat specifieke spelers (niet iedereen) target, **When** de speler
   de actieve-virussenlijst bekijkt, **Then** blijft het bestaande gedrag ongewijzigd — dat
   virus staat nog steeds onder de naam/namen van de specifiek getroffen speler(s).
3. **Given** zowel een "iedereen"-virus als een specifiek-getarget virus tegelijk actief,
   **When** de speler de lijst bekijkt, **Then** staat de gedeelde "iedereen"-regel naast de
   normale per-speler-regel(s), zonder dat ze door elkaar lopen.

---

### User Story 2 - Maximaal 3 virussen tegelijk actief (Priority: P1)

Als speler wil ik dat er nooit meer dan 3 verschillende virussen tegelijk actief zijn, zodat het
overzicht van actieve regels behapbaar blijft.

**Why this priority**: Losstaande, expliciet gevraagde aanpassing van een bestaande
spelregel (feature 011 introduceerde het maximum, destijds op 4); even kritiek als User Story 1
omdat het een directe, ondubbelzinnige eis is.

**Independent Test**: Te testen door herhaaldelijk viruskaarten te trekken tot het maximum
bereikt is, en te verifiëren dat een 4e, verschillend virus niet getrokken wordt (overgeslagen/
uitgesteld) totdat een van de 3 actieve virussen is afgelopen.

**Acceptance Scenarios**:

1. **Given** al 3 verschillende virussen actief zijn, **When** een volgende viruskaart getrokken
   zou worden, **Then** wordt deze niet als actief virus toegevoegd (blijft beschikbaar voor een
   latere trekbeurt, bestaand uitstelgedrag uit feature 011), totdat een van de 3 actieve
   virussen is afgelopen.
2. **Given** minder dan 3 virussen actief zijn, **When** een viruskaart getrokken wordt,
   **Then** wordt deze gewoon actief, zoals vandaag al het geval is tot het (nu verlaagde)
   maximum.

---

### User Story 3 - De tekst van een actief virus opnieuw kunnen bekijken (Priority: P2)

Als speler die de actieve-virussenlijst bekijkt en niet meer precies weet wat de regel van een
virus was, wil ik op de rij (bij een spelersnaam, of bij de gedeelde "iedereen"-rij) kunnen
tikken en dan de oorspronkelijke tekst/instructie van dat virus te zien krijgen, zodat ik de
regel niet hoef te onthouden of te gokken.

**Why this priority**: Ondersteunt de andere twee user stories (met minder zichtbare context per
rij, zoals na User Story 1's samenvoeging, is het makkelijker om te vergeten wat een virus
precies inhoudt), maar is op zichzelf een kleinere, losse verbetering.

**Independent Test**: Te testen door een virus te trekken, in de actieve-virussenlijst op de
bijbehorende rij/naam te tikken, en te verifiëren dat de oorspronkelijke virusinstructie
zichtbaar wordt.

**Acceptance Scenarios**:

1. **Given** een actief virus met een specifieke speler, **When** de speler op die rij (de
   naam van de getroffen speler) tikt, **Then** verschijnt de oorspronkelijke instructietekst
   van dat virus.
2. **Given** een actief "iedereen"-virus (zie User Story 1), **When** de speler op de gedeelde
   "iedereen"-rij tikt, **Then** verschijnt de oorspronkelijke instructietekst van dat virus.
3. **Given** een rij waarbij één speler meerdere actieve virussen tegelijk heeft (het bestaande
   "×N"-teken), **When** de speler op die rij tikt, **Then** worden de instructieteksten van al
   die actieve virussen getoond (niet alleen van één ervan).

---

### Edge Cases

- Wat gebeurt er als een "iedereen"-virus eindigt terwijl een speler net de tekst van dat virus
  aan het bekijken is (User Story 3)? De getoonde tekst hoeft niet live te verdwijnen —
  reasonable default: de weergave sluit op dezelfde manier als hij geopend werd (nogmaals tikken/
  wegtikken), en de rij zelf verdwijnt de eerstvolgende keer dat de lijst opnieuw gerenderd wordt
  omdat het virus niet meer actief is.
- Wat gebeurt er als er tijdens een lopend spel een nieuwe speler wordt toegevoegd (feature 007)
  terwijl een "iedereen"-virus al actief is? Zoals al vastgelegd in feature 015: de nieuwe
  speler was niet aanwezig toen het virus begon en telt dus niet met terugwerkende kracht mee in
  de "iedereen"-rij van dat virus — dit verandert niet door deze feature.
- Wat gebeurt er als het verlagen van het maximum naar 3 betekent dat een sessie met een
  kaartenset die maar 4 viruskaarten heeft (het bestaande validatieminimum) er nooit meer dan 3
  tegelijk actief kan hebben? Dat is verwacht en gewenst gedrag — het minimum aantal
  viruskaarten in een set (4, feature 011) hoeft niet gelijk te zijn aan het maximum aantal
  gelijktijdig actieve virussen (nu 3); dit blijft ongewijzigd naast elkaar bestaan.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Systeem MOET, wanneer een virus "iedereen" target, dit virus als één gedeelde
  "iedereen"-rij tonen in de actieve-virussenlijst, in plaats van een aparte rij per getroffen
  speler.
- **FR-002**: Systeem MOET het bestaande, per-speler-rij-gedrag van de actieve-virussenlijst
  voor specifiek-getargete virussen ongewijzigd laten.
- **FR-003**: Systeem MOET het maximum aantal gelijktijdig actieve, verschillende virussen
  verlagen van 4 naar 3; een viruskaart die dit maximum zou overschrijden wordt niet actief
  totdat er weer ruimte is (bestaand uitstelgedrag, feature 011).
- **FR-004**: Systeem MOET, wanneer de speler tikt op een rij in de actieve-virussenlijst (een
  individuele spelersnaam-rij of de gedeelde "iedereen"-rij), de oorspronkelijke instructietekst
  van het/de bijbehorende virus(sen) tonen.
- **FR-005**: Systeem MOET, als een rij meerdere gelijktijdig actieve virussen vertegenwoordigt
  (het bestaande "×N"-teken bij één speler), bij het tikken de instructietekst van elk van die
  virussen tonen, niet slechts van één ervan.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Bij een actief "iedereen"-virus toont de actieve-virussenlijst precies één rij
  voor dat virus, ongeacht het aantal spelers in de sessie.
- **SC-002**: Er zijn nooit meer dan 3 verschillende virussen tegelijk actief binnen een sessie.
- **SC-003**: Een speler kan vanuit de actieve-virussenlijst, in één tik, de instructietekst van
  elk actief virus terugvinden zonder te hoeven wachten tot dat virus afloopt.

## Assumptions

- Deze feature introduceert geen nieuw visueel ontwerp/nieuwe schermen — het past de bestaande
  `ActiveVirusList`-component aan (groepering + tikbare rijen) binnen de bestaande visuele stijl,
  en verlaagt een bestaande constante (`MAX_ACTIVE_VIRUSES`). Vergelijkbaar met hoe feature 015's
  vergelijkbare "iedereen"-groepering voor het eindscherm (`VirusLiftCard`, `targetPlayerId:
  string | null`) al zonder nieuw ontwerp is doorgevoerd.
- "De tekst van het virus" (User Story 3) verwijst naar de oorspronkelijke `instructionText` van
  de viruskaart (dezelfde tekst die getoond werd toen het virus getrokken werd), niet naar het
  latere eindbericht (`liftText`) — dat blijft voorbehouden aan het moment dat het virus
  daadwerkelijk afloopt.
- Het tikgedrag (FR-004/FR-005) is een eenvoudige tonen/verbergen-interactie (bijvoorbeeld
  uitklappen binnen dezelfde rij) — er wordt geen nieuwe navigatie, modal-systeem of scherm
  geïntroduceerd die niet al elders in de app gebruikt wordt.
- Het verlagen van het maximum naar 3 verandert niets aan de bestaande minimale eisen voor een
  kaartenset (minimaal 4 viruskaarten, `validateCardSet.ts`) — dat blijft een aparte regel.
