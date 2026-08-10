# Feature Specification: Nieuwe vragen toevoegen aan de Badzwanzen-set

**Feature Branch**: `014-add-card-set`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "start een nieuwe feature en voeg ze toe net als feature 10 zorg ook dat alle virussen weer een mooi eind virus bericht hebben" (vervolgens verduidelijkt: "ik heb nieuwe vragen" en "voeg ze toe aan de bestaande badzwanzen set") — voeg een door de gebruiker apart aangeleverde verzameling nieuwe vragen toe aan de bestaande, productie-Badzwanzen-kaartenset (niet als losse nieuwe set), net als bij het toevoegen van de oorspronkelijke content in feature 010; elke (nieuwe én bestaande) viruskaart in de set behoudt of krijgt een eigen, herkenbaar en goed geschreven eindbericht (liftText), net als bij de eerdere Badzwanzen-content (feature 011).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Meer variatie in de bestaande Badzwanzen-set (Priority: P1)

Als gebruiker die een nieuwe verzameling vragen/opdrachten heeft bedacht, wil ik dat deze worden
toegevoegd aan de bestaande, al in productie gebruikte Badzwanzen-kaartenset, zodat spelsessies
die deze set kiezen meer variatie aan kaarten trekken zonder dat er een aparte, extra set bij de
keuzelijst komt.

**Why this priority**: Dit is het hele doel van de feature — zonder dat de nieuwe vragen
daadwerkelijk in de bestaande set terechtkomen en getrokken kunnen worden, heeft het omzetten
van de aangeleverde content geen waarde.

**Independent Test**: Volledig te testen door de Badzwanzen-set te kiezen op het bestaande
kaartensetkeuzescherm (feature 010), een volledige sessie te spelen, en te verifiëren dat zowel
bestaande als nieuw toegevoegde kaarten getrokken kunnen worden — en dat er geen extra,
aparte kaartenset in de keuzelijst verschijnt.

**Acceptance Scenarios**:

1. **Given** de nieuwe vragen zijn omgezet en toegevoegd, **When** de gebruiker het
   kaartensetkeuzescherm opent, **Then** staat er nog steeds precies dezelfde lijst met sets als
   vóór deze feature (geen nieuwe set toegevoegd) — alleen "Badzwanzen" bevat nu meer kaarten.
2. **Given** de Badzwanzen-set is gekozen, **When** een spel gespeeld wordt, **Then** kunnen zowel
   de eerder bestaande kaarten als de nieuw toegevoegde kaarten getrokken worden, door elkaar.
3. **Given** de nieuwe kaarten zijn toegevoegd, **When** de seed-testset gebruikt wordt, **Then**
   is deze ongewijzigd — de nieuwe content raakt uitsluitend de Badzwanzen-set.

---

### User Story 2 - Elke viruskaart heeft een eigen, passend eindbericht (Priority: P1)

Als speler die een virus in de (uitgebreide) Badzwanzen-set meemaakt, wil ik dat het bericht dat
verschijnt zodra het virus eindigt specifiek bij dát virus past (niet een generieke, voor meerdere
virussen identieke tekst), zodat direct duidelijk is welk virus is afgelopen en wat er weer
"normaal" mag — dit geldt voor de nieuw toegevoegde viruskaarten net zo goed als voor de al
bestaande.

**Why this priority**: Gelijk in prioriteit aan User Story 1 — expliciet gevraagd, en bovendien
afgedwongen door de bestaande validatie (unieke `liftText` per viruskaart binnen een set, sinds
feature 011): als een nieuwe viruskaart per ongeluk hetzelfde eindbericht deelt met een bestaande,
is de hele set ongeldig.

**Independent Test**: Te testen door de bestaande `validateCardSet`-check te draaien over de
uitgebreide Badzwanzen-set en te verifiëren dat er geen validatiefouten zijn over gedeelde
`liftText`s, en door voor elke nieuw toegevoegde viruskaart het eindbericht te lezen naast het
effect van die kaart.

**Acceptance Scenarios**:

1. **Given** de uitgebreide Badzwanzen-set, **When** de set gevalideerd wordt, **Then** heeft
   elke viruskaart (oud én nieuw) een `liftText` die niet voorkomt bij enige andere viruskaart in
   dezelfde set.
2. **Given** een nieuw toegevoegde viruskaart met een specifiek effect, **When** het virus
   eindigt, **Then** verwijst het eindbericht inhoudelijk naar dat specifieke effect, niet naar
   een generieke "virus is voorbij"-tekst.

---

### Edge Cases

- Wat gebeurt er als een aangeleverde nieuwe vraag inhoudelijk (bijna) identiek is aan een al
  bestaande kaart in de Badzwanzen-set? De nieuwe kaart wordt alsnog toegevoegd als losse kaart
  (net als bij de oorspronkelijke content in feature 010 werd elke aangeleverde regel omgezet,
  zonder deduplicatie tegen bestaande content).
- Wat gebeurt er als een aangeleverde viruskaart geen duidelijk, herleidbaar effect beschrijft
  waaruit een specifiek eindbericht te formuleren is? Zo'n kaart krijgt een zo min mogelijk
  generiek, maar wel uniek eindbericht, consistent in toon met de rest van de set.
- Wat gebeurt er met kaart-ID's van de nieuwe kaarten? Deze moeten uniek zijn binnen de
  Badzwanzen-set (dus niet botsen met bestaande `bz-opdracht-*`/`bz-virus-*`/etc. ID's).
- Wat gebeurt er met content die grof, gewaagd of ongepast zou kunnen zijn (vergelijkbaar met de
  bestaande Badzwanzen-content)? Deze wordt, net als bij feature 010, integraal overgenomen zoals
  aangeleverd, passend bij het karakter van dit (privé) drankspel — met dezelfde uitzondering als
  destijds: content die als daadwerkelijke scheldwoorden/beledigingen te classificeren is, wordt
  niet overgenomen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Systeem MOET de door de gebruiker aangeleverde nieuwe vragen toevoegen als extra
  kaarten binnen de bestaande Badzwanzen-kaartenset (`badzwanzenCardSet`), niet als een aparte,
  nieuwe set in de catalogus.
- **FR-002**: De uitgebreide Badzwanzen-set MOET blijven voldoen aan alle bestaande
  geldigheidseisen: minimaal 80 kaarten, minimaal 4 viruskaarten, correcte `{player}`-tokens per
  kaart.
- **FR-003**: Elke viruskaart in de uitgebreide set — zowel de al bestaande als de nieuw
  toegevoegde — MOET een `liftText` (eindbericht) hebben dat uniek is binnen de hele set; geen
  enkele viruskaart deelt zijn eindbericht met een andere.
- **FR-004**: Elk eindbericht van een nieuw toegevoegde viruskaart MOET inhoudelijk verwijzen naar
  het specifieke effect van die kaart, niet een generieke "virus voorbij"-tekst die voor elk virus
  zou kunnen gelden.
- **FR-005**: De inhoud van de nieuwe kaarten MOET afgeleid worden van de apart door de gebruiker
  aangeleverde vragen, omgezet naar het bestaande kaartformaat (`Card`: `id`, `type`, `targeting`,
  `instructionText`, optioneel `liftText`), consistent met hoe de bestaande Badzwanzen-kaarten al
  zijn opgebouwd (zelfde `type`-herkenning, `{player}`-tokenconventie).
- **FR-006**: Systeem MOET de al bestaande Badzwanzen-kaarten, de seed-testset, en de
  kaartensetcatalogus (welke sets er zijn en hoe ze heten) ongewijzigd laten — deze feature breidt
  uitsluitend de inhoud van de bestaande Badzwanzen-set uit.
- **FR-007**: Nieuw toegevoegde kaart-ID's MOETEN uniek zijn binnen de Badzwanzen-set (geen botsing
  met bestaande kaart-ID's).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Na het toevoegen bevat de Badzwanzen-set meer kaarten dan vóór deze feature, en is
  hij direct speelbaar via het bestaande kaartensetkeuzescherm zonder enige aanpassing aan de
  keuze- of sessielogica.
- **SC-002**: De kaartensetcatalogus toont exact dezelfde sets (namen en aantal) als vóór deze
  feature — er is geen nieuwe set bijgekomen.
- **SC-003**: 100% van de viruskaarten in de uitgebreide Badzwanzen-set heeft een uniek
  eindbericht — geen enkele validatiefout over gedeelde `liftText` bij het draaien van de
  bestaande validatie.
- **SC-004**: Een speler die een willekeurige (oude of nieuwe) viruskaart uit de Badzwanzen-set
  ziet aflopen, kan aan het eindbericht direct herkennen welk specifiek effect voorbij is
  (kwalitatief, te toetsen door het eindbericht van elke viruskaart te lezen naast de
  bijbehorende opdrachttekst).

## Assumptions

- De daadwerkelijke inhoud (de aangeleverde nieuwe vragen) wordt na het specificeren/plannen van
  deze feature aangeleverd en omgezet, net als bij feature 010 — deze spec beschrijft het
  resultaat (een geldige, uitgebreide Badzwanzen-set met unieke viruseindberichten voor alle
  viruskaarten), niet de letterlijke brontekst.
- Het mechanisme voor meerdere, selecteerbare, benoemde kaartensets (feature 010) en de regel dat
  elke viruskaart binnen een set een uniek eindbericht moet hebben (feature 011) bestaan al en
  worden door deze feature niet gewijzigd — alleen data toegevoegd binnen de bestaande
  `badzwanzen-card-set.ts`.
- Zoals bij de oorspronkelijke Badzwanzen-content (feature 010) wordt de nieuw aangeleverde
  brontekst zoveel mogelijk integraal overgenomen, passend bij het karakter van dit private
  drankspel voor eigen vriendengroep — met dezelfde uitzondering die destijds is toegepast (geen
  daadwerkelijke scheldwoorden/beledigende termen in de uiteindelijke set).
- Deze feature introduceert geen nieuwe UI-schermen of visueel ontwerp — het
  kaartensetkeuzescherm en de rest van de UI blijven ongewijzigd; alleen de inhoud van de
  bestaande Badzwanzen-dataset breidt uit.
