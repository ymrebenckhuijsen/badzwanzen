# Feature Specification: Virus-eindegedrag repareren + nieuwe kaarten

**Feature Branch**: `015-virus-end-fixes`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "maak een nieuwe feature ten eerste zorg dat als er een virus is voor iedereen dat het einde van het virus ook voor iedereen tegelijk is in plaats van per persoon zorg ook dat de einde virus kaarten niet mee tellen voor de aantal kaarten dat getrokken worden in een spel zorg ook ervoor dat deze vragen worden toegevoegd [...grote lijst nieuwe vragen/opdrachten/spellen/virussen, geplakt in de chat, integraal bewaard in `new-questions-raw.txt`...] en ook dus voor dat alle virussen weer een goed eind bericht hebben"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Een "iedereen"-virus eindigt voor iedereen tegelijk (Priority: P1)

Als speler die meemaakt dat een virus iedereen tegelijk treft (bijvoorbeeld "niemand mag meer
namen zeggen"), wil ik dat dat virus ook voor iedereen tegelijk eindigt, in plaats van dat de
ene speler er willekeurig eerder vanaf is dan de andere — zodat het duidelijk is wanneer de
regel niet meer geldt, voor de hele groep in één keer.

**Why this priority**: Dit is de kern van de gemelde bug — vandaag krijgt elke getroffen speler
bij een "iedereen"-virus zijn eigen willekeurige eindmoment, wat verwarrend is (de ene speler is
al klaar met fluisteren terwijl de andere nog "moet"), terwijl het virus conceptueel één
gedeelde regel voor de hele groep is.

**Independent Test**: Volledig te testen door een virus te trekken dat "iedereen" target,
voldoende opdracht-/spelkaarten te trekken tot het virus afloopt, en te verifiëren dat alle
getroffen spelers in dezelfde beurt (niet verspreid over meerdere latere beurten) als
afgelopen worden gemeld.

**Acceptance Scenarios**:

1. **Given** een viruskaart die "iedereen" target is getrokken, **When** het virus zijn
   eindmoment bereikt, **Then** eindigt het voor alle op dat moment getroffen spelers op
   hetzelfde moment (dezelfde trekbeurt), niet verspreid over losse, willekeurige momenten per
   speler.
2. **Given** een viruskaart die specifieke spelers (niet iedereen) target, **When** dat virus
   afloopt, **Then** blijft het bestaande gedrag ongewijzigd — dat virus heeft altijd al maar
   één (of een klein, expliciet aantal) getroffen speler(s), dus "gelijktijdig eindigen" was daar
   al vanzelfsprekend.
3. **Given** meerdere "iedereen"-virussen tegelijk actief (tot het bestaande maximum van 4),
   **When** elk virus zijn eigen eindmoment bereikt, **Then** eindigt elk virus nog steeds
   onafhankelijk van de andere virussen — alleen de spelers ván één en hetzelfde virus eindigen
   samen, niet alle actieve virussen door elkaar.

---

### User Story 2 - Een virus-einde telt niet mee als een getrokken kaart (Priority: P1)

Als speler wil ik dat het aantal kaarten dat in een spelsessie getrokken wordt (en dus wanneer
de trekstapel leeg raakt / het spel eindigt) alleen gaat over de kaarten die je daadwerkelijk
trekt uit de stapel (opdrachten, spellen, virussen) — niet over de losse "dit virus is
afgelopen"-meldingen die daaruit voortvloeien.

**Why this priority**: Gelijk in prioriteit aan User Story 1: dit is een expliciete eis uit de
featurebeschrijving, en is bovendien een randvoorwaarde die bewaakt moet blijven zodra User
Story 1 het eindgedrag van virussen verandert — een virus-einde mag door die wijziging niet per
ongeluk gaan meetellen als kaarttrekking.

**Independent Test**: Te testen door een volledige sessie te spelen tot het einde, het aantal
daadwerkelijk als kaart getoonde opdrachten/spellen/virussen te tellen, en te verifiëren dat dit
aantal overeenkomt met de opgebouwde trekstapelgrootte (feature 012: 50–55), ongeacht hoeveel
virus-eindemeldingen er tussendoor getoond zijn.

**Acceptance Scenarios**:

1. **Given** een lopende sessie waarin één of meer virussen eindigen, **When** de sessie
   voortgaat, **Then** blijft het aantal resterende kaarten in de trekstapel exact gelijk aan wat
   het zou zijn geweest zonder die virus-eindemeldingen — een virus-einde verkleint de trekstapel
   niet.
2. **Given** de trekstapel is precies leeg (alle echte kaarten getrokken), **When** er op dat
   moment nog een actief virus bestaat, **Then** wordt dat virus geforceerd beëindigd (bestaand
   gedrag) zonder dat deze afsluitende melding alsnog als een extra "kaart" meetelt.

---

### User Story 3 - Nieuwe vragen, opdrachten, spellen en virussen toevoegen (Priority: P2)

Als gebruiker die een nieuwe verzameling vragen/opdrachten/spellen/virussen heeft bedacht, wil
ik dat deze worden toegevoegd aan de bestaande, al in productie gebruikte Badzwanzen-kaartenset
— op dezelfde manier als eerdere content-toevoegingen (features 010 en 014) — zodat sessies meer
variatie krijgen.

**Why this priority**: Onafhankelijk waardevol van de twee bugfixes hierboven, maar iets minder
kritiek dan het repareren van het bestaande, zichtbaar verwarrende eindgedrag van virussen —
zonder deze content werkt de app nog steeds correct, alleen met minder variatie.

**Independent Test**: Volledig te testen door de Badzwanzen-set te kiezen, een sessie te spelen,
en te verifiëren dat (een deel van) de nieuw toegevoegde kaarten getrokken kan worden, op
dezelfde manier als bestaande kaarten.

**Acceptance Scenarios**:

1. **Given** de nieuwe content is toegevoegd, **When** de gebruiker het
   kaartensetkeuzescherm opent, **Then** staat er nog steeds dezelfde lijst met sets (geen
   nieuwe, aparte set) — alleen "Badzwanzen" bevat meer kaarten.
2. **Given** de Badzwanzen-set is gekozen, **When** een spel gespeeld wordt, **Then** kunnen
   zowel de eerder bestaande als de nieuw toegevoegde kaarten getrokken worden.

---

### User Story 4 - Elke viruskaart heeft een eigen, goed eindbericht (Priority: P2)

Als speler die een virus meemaakt (bestaand of nieuw), wil ik dat het eindbericht van dat virus
specifiek bij het effect van dát virus past, zodat duidelijk is welk virus is afgelopen en wat
er weer "normaal" mag — dit geldt zowel voor de nieuw toegevoegde viruskaarten (User Story 3)
als, waar nodig, voor bestaande.

**Why this priority**: Directe randvoorwaarde bij User Story 3 (nieuwe viruskaarten zijn pas
geldig als hun eindbericht uniek is binnen de set, zie bestaande validatie sinds feature 011) en
herbevestigt expliciet, herhaald door de gebruiker, dat dit ook na deze uitbreiding moet blijven
kloppen.

**Independent Test**: Te testen door de bestaande `validateCardSet`-check te draaien over de
uitgebreide set en te verifiëren dat er geen validatiefouten zijn over gedeelde `liftText`s.

**Acceptance Scenarios**:

1. **Given** de uitgebreide Badzwanzen-set, **When** de set gevalideerd wordt, **Then** heeft
   elke viruskaart een `liftText` die niet voorkomt bij enige andere viruskaart in dezelfde set.
2. **Given** een nieuw toegevoegde viruskaart met een specifiek effect, **When** het virus
   eindigt, **Then** verwijst het eindbericht inhoudelijk naar dat specifieke effect.

---

### Edge Cases

- Wat gebeurt er als tijdens een actief "iedereen"-virus een nieuwe speler wordt toegevoegd
  (feature 007, spelers tijdens het spel toevoegen)? Reasonable default: de nieuwe speler was
  niet aanwezig toen het virus begon en wordt dus niet met terugwerkende kracht aan het virus
  toegevoegd — dit verandert niet door deze feature.
- Wat gebeurt er als tijdens een actief "iedereen"-virus een speler verwijderd wordt (feature
  007)? Het gedeelde eindmoment van de overige getroffen spelers verandert niet door het
  verwijderen van één speler.
- Wat gebeurt er als de trekstapel leeg raakt terwijl een "iedereen"-virus nog actief is? Het
  bestaande geforceerde-eindegedrag (alle nog actieve virussen worden bij sessie-einde
  afgesloten) blijft van toepassing, nu consistent gelijktijdig voor alle spelers van datzelfde
  virus.
- Wat gebeurt er met aangeleverde vragen die niet duidelijk als opdracht/spel/virus te
  classificeren zijn? Reasonable default: zonder expliciete "Spel"/"Virus"-prefix wordt een
  vraag als opdracht (assignment) behandeld, consistent met de bestaande conventie uit feature
  010/014.
- Wat gebeurt er met content in de nieuwe lijst die grof, gewaagd of ongepast zou kunnen zijn?
  Net als bij features 010 en 014 wordt de aangeleverde tekst zoveel mogelijk integraal
  overgenomen, passend bij het karakter van dit private drankspel — met dezelfde uitzondering:
  daadwerkelijke scheldwoorden/beledigende termen worden niet overgenomen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Systeem MOET, wanneer een viruskaart met "iedereen"-targeting getrokken wordt, alle
  op dat moment getroffen spelers op exact hetzelfde moment (dezelfde trekbeurt) als "virus
  afgelopen" markeren — niet elk met een eigen, onafhankelijk willekeurig eindmoment.
- **FR-002**: Systeem MOET het bestaande gedrag voor viruskaarten met specifieke (niet
  "iedereen") targeting ongewijzigd laten.
- **FR-003**: Systeem MOET het tonen van een virus-eindemelding (lift) NOOIT laten meetellen als
  een getrokken kaart uit de sessie-trekstapel — de resterende trekstapelgrootte en het moment
  waarop de trekstapel leeg raakt, hangen uitsluitend af van daadwerkelijk getrokken
  opdracht-/spel-/viruskaarten.
- **FR-004**: Systeem MOET de door de gebruiker aangeleverde nieuwe vragen/opdrachten/spellen/
  virussen (zie `new-questions-raw.txt` in deze feature-map) toevoegen als extra kaarten binnen
  de bestaande Badzwanzen-kaartenset, niet als een aparte, nieuwe set in de catalogus — op
  dezelfde manier als features 010 en 014.
- **FR-005**: De uitgebreide Badzwanzen-set MOET blijven voldoen aan alle bestaande
  geldigheidseisen: minimaal 80 kaarten, minimaal 4 viruskaarten, correcte `{player}`-tokens per
  kaart.
- **FR-006**: Elke viruskaart in de uitgebreide set — bestaand én nieuw — MOET een `liftText`
  (eindbericht) hebben dat uniek is binnen de hele set en die inhoudelijk verwijst naar het
  specifieke effect van die kaart.
- **FR-007**: Systeem MOET de kaartensetcatalogus (welke sets er zijn en hoe ze heten) en de
  seed-testset ongewijzigd laten — deze feature past uitsluitend virus-eindegedrag aan en breidt
  de inhoud van de bestaande Badzwanzen-set uit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% van de "iedereen"-virussen eindigt voor alle getroffen spelers in dezelfde
  trekbeurt — geen enkel geval waarin spelers van hetzelfde virus op verschillende momenten als
  "afgelopen" gemarkeerd worden.
- **SC-002**: Het totale aantal kaarten dat in een sessie getrokken wordt (tot de trekstapel leeg
  is) blijft exact binnen de bestaande sessie-poolgrootte (feature 012: 50–55), ongeacht hoeveel
  virus-eindemeldingen er in die sessie voorkwamen.
- **SC-003**: Na het toevoegen bevat de Badzwanzen-set meer kaarten dan vóór deze feature en is
  hij direct speelbaar zonder aanpassing aan de keuze- of sessielogica.
- **SC-004**: 100% van de viruskaarten in de uitgebreide set heeft een uniek eindbericht — geen
  enkele validatiefout over gedeelde `liftText` bij het draaien van de bestaande validatie.

## Assumptions

- "Gelijktijdig eindigen" betekent: alle getroffen spelers van één "iedereen"-virus worden in
  dezelfde trekbeurt van "actief" naar "afgelopen" gezet. Hoe dit vervolgens getoond wordt (één
  gedeeld eindscherm, of een reeks eindschermen die na elkaar bevestigd moeten worden zoals de
  bestaande wachtrij dat al doet voor meerdere gelijktijdig eindigende virussen) is een
  implementatiedetail, geen nieuw UI-ontwerp — er worden geen nieuwe schermen/componenten
  geïntroduceerd.
- Vandaag telt een virus-einde al niet mee in de sessie-trekstapel (`useDrawPile`'s
  `remainingCardIds` wordt alleen bij een daadwerkelijke kaarttrekking aangepast); FR-003
  formaliseert en beschermt dit expliciet als vereiste, juist omdat User Story 1 dezelfde
  virus-eindelogica aanraakt en dit gedrag niet per ongeluk mag veranderen.
- De inhoud van de nieuwe vragen (`new-questions-raw.txt`) wordt na het plannen van deze feature
  omgezet naar het bestaande kaartformaat, net als bij features 010 en 014 — deze spec beschrijft
  het resultaat, niet de letterlijke conversie.
- Deze feature introduceert geen nieuwe UI-schermen of visueel ontwerp.
