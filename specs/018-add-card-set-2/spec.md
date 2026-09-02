# Feature Specification: Tweede batch nieuwe vragen toevoegen aan de Badzwanzen-set

**Feature Branch**: `018-add-card-set-2`

**Created**: 2026-09-02

**Status**: Draft

**Input**: User description: "Add a second large batch of new question/opdracht cards to the existing production Badzwanzen card set (src/features/cards/data/badzwanzen-card-set.ts), following the same precedent as feature 014-add-card-set. The raw source material is already saved verbatim at specs/018-add-card-set-2/raw-input.md — read it for the full raw input, the note about the first line being a virus card, and the note about three separately-numbered, overlapping lists that all need processing. Card types are Naam/Spel/Virus/Iedereen, using the existing ID scheme and {player} token conventions, with every virus card getting its own unique liftText tied to that virus's specific effect. Deduplicate: if a question is a duplicate of an existing card in the set or a duplicate within this batch, do not add it again."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Meer variatie in de bestaande Badzwanzen-set (Priority: P1)

Als gebruiker die een tweede, grote verzameling nieuwe vragen/opdrachten heeft aangeleverd, wil ik
dat deze worden toegevoegd aan de bestaande, al in productie gebruikte Badzwanzen-kaartenset,
zodat spelsessies die deze set kiezen nog meer variatie aan kaarten trekken zonder dat er een
aparte, extra set bij de keuzelijst komt.

**Why this priority**: Dit is het hele doel van de feature — zonder dat de nieuw aangeleverde
vragen daadwerkelijk in de bestaande set terechtkomen en getrokken kunnen worden, heeft het
omzetten van de aangeleverde content geen waarde.

**Independent Test**: Volledig te testen door de Badzwanzen-set te kiezen op het bestaande
kaartensetkeuzescherm (feature 010), een volledige sessie te spelen, en te verifiëren dat zowel
bestaande als nieuw toegevoegde kaarten getrokken kunnen worden — en dat er geen extra, aparte
kaartenset in de keuzelijst verschijnt.

**Acceptance Scenarios**:

1. **Given** de nieuwe vragen zijn omgezet en toegevoegd, **When** de gebruiker het
   kaartensetkeuzescherm opent, **Then** staat er nog steeds precies dezelfde lijst met sets als
   vóór deze feature (geen nieuwe set toegevoegd) — alleen "Badzwanzen" bevat nu meer kaarten.
2. **Given** de Badzwanzen-set is gekozen, **When** een spel gespeeld wordt, **Then** kunnen zowel
   de eerder bestaande kaarten (inclusief die uit feature 014) als de nieuw toegevoegde kaarten
   getrokken worden, door elkaar.
3. **Given** de nieuwe kaarten zijn toegevoegd, **When** de seed-testset gebruikt wordt, **Then**
   is deze ongewijzigd — de nieuwe content raakt uitsluitend de Badzwanzen-set.

---

### User Story 2 - Elke viruskaart heeft een eigen, passend eindbericht (Priority: P1)

Als speler die een virus in de (verder uitgebreide) Badzwanzen-set meemaakt, wil ik dat het
bericht dat verschijnt zodra het virus eindigt specifiek bij dát virus past (niet een generieke,
voor meerdere virussen identieke tekst), zodat direct duidelijk is welk virus is afgelopen en wat
er weer "normaal" mag — dit geldt voor de nieuw toegevoegde viruskaarten net zo goed als voor alle
al bestaande.

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

### User Story 3 - Geen dubbele vragen in de set (Priority: P2)

Als gebruiker die deze batch heeft samengesteld uit drie los genummerde lijsten die elkaar
inhoudelijk overlappen, wil ik dat vragen die al in de bestaande Badzwanzen-set staan, of die
binnen deze batch zelf herhaald voorkomen, niet nogmaals als losse kaart worden toegevoegd, zodat
spelers niet herhaaldelijk (bijna) dezelfde vraag trekken.

**Why this priority**: Expliciet gevraagd voor deze specifieke batch (in tegenstelling tot eerdere
batches, zoals feature 014, waar niet werd gededupliceerd) — belangrijk voor de kwaliteit van de
set, maar de kern van de feature (meer variatie, User Story 1) blijft ook zonder perfecte
deduplicatie waardevol.

**Independent Test**: Te testen door de volledige lijst instructieteksten van de uitgebreide set
te doorlopen en te verifiëren dat geen twee kaarten inhoudelijk dezelfde vraag/opdracht stellen
(rekening houdend met kleine formuleringsverschillen tussen de drie brondelen van deze batch, en
met eerder al toegevoegde content zoals feature 014).

**Acceptance Scenarios**:

1. **Given** twee regels in de ruwe input die (bijna) letterlijk dezelfde vraag stellen, **When**
   de content wordt omgezet naar kaarten, **Then** wordt deze vraag slechts één keer als kaart
   toegevoegd.
2. **Given** een regel in de ruwe input die inhoudelijk al bestaat als kaart in de huidige
   Badzwanzen-set, **When** de content wordt omgezet naar kaarten, **Then** wordt hiervoor geen
   nieuwe, dubbele kaart toegevoegd.

---

### Edge Cases

- Wat gebeurt er met de allereerste regel van de ruwe input ("Virus iedereen praat vanaf nu met
  een harde G ... 1 strafpunt als je het niet doet")? Dit is zelf een viruskaart (targeting
  "iedereen") en geen losse instructie — deze wordt als zodanig verwerkt, inclusief eigen unieke
  `liftText`.
- Wat gebeurt er met de drie apart genummerde lijsten in de ruwe input (elk herstart de nummering
  bij 1, met overlappende nummers)? Alle drie worden volledig verwerkt; de nummering zelf heeft
  geen betekenis voor kaart-ID's of volgorde.
- Wat gebeurt er als twee regels bijna, maar niet volledig, identiek zijn geformuleerd (bv. een
  net iets andere zinsconstructie voor dezelfde opdracht)? Dit telt als duplicaat en wordt niet
  twee keer toegevoegd; bij twijfel telt inhoudelijke overeenkomst zwaarder dan letterlijke
  woordgelijkheid.
- Wat gebeurt er met de allerlaatste regel van de ruwe input ("Doe met zn allen een ronde Maxen
  ... als er dubbele zijn voeg ze dan niet toe")? Dit is zelf geen kaart maar een meta-instructie
  van de gebruiker over hoe deze batch verwerkt moet worden (de dedupe-eis in deze spec) — deze
  regel wordt niet als losse kaart toegevoegd.
- Wat gebeurt er met kaart-ID's van de nieuwe kaarten? Deze moeten uniek zijn binnen de
  Badzwanzen-set (dus niet botsen met bestaande `bz-opdracht-*`/`bz-virus-*`/etc. ID's, inclusief
  die uit feature 014).
- Wat gebeurt er met content die grof, gewaagd of ongepast zou kunnen zijn (vergelijkbaar met de
  bestaande Badzwanzen-content)? Deze wordt, net als bij feature 010 en 014, integraal
  overgenomen zoals aangeleverd, passend bij het karakter van dit (privé) drankspel — met dezelfde
  uitzondering als destijds: content die als daadwerkelijke scheldwoorden/beledigingen te
  classificeren is, wordt niet overgenomen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Systeem MOET de in `specs/018-add-card-set-2/raw-input.md` aangeleverde nieuwe
  vragen toevoegen als extra kaarten binnen de bestaande Badzwanzen-kaartenset
  (`badzwanzenCardSet`), niet als een aparte, nieuwe set in de catalogus.
- **FR-002**: De uitgebreide Badzwanzen-set MOET blijven voldoen aan alle bestaande
  geldigheidseisen: minimaal 80 kaarten, minimaal 4 viruskaarten, correcte `{player}`-tokens per
  kaart.
- **FR-003**: Elke viruskaart in de uitgebreide set — zowel de al bestaande als de nieuw
  toegevoegde — MOET een `liftText` (eindbericht) hebben dat uniek is binnen de hele set; geen
  enkele viruskaart deelt zijn eindbericht met een andere.
- **FR-004**: Elk eindbericht van een nieuw toegevoegde viruskaart MOET inhoudelijk verwijzen naar
  het specifieke effect van die kaart, niet een generieke "virus voorbij"-tekst die voor elk virus
  zou kunnen gelden.
- **FR-005**: De inhoud van de nieuwe kaarten MOET afgeleid worden van de ruwe input in
  `specs/018-add-card-set-2/raw-input.md`, omgezet naar het bestaande kaartformaat (`Card`: `id`,
  `type`, `targeting`, `instructionText`, optioneel `liftText`), consistent met hoe de bestaande
  Badzwanzen-kaarten al zijn opgebouwd (zelfde `type`-herkenning, `{player}`-tokenconventie).
- **FR-006**: Systeem MOET, in tegenstelling tot eerdere batches, dedupliceren: een vraag uit de
  ruwe input die inhoudelijk al voorkomt als bestaande kaart in de Badzwanzen-set, of die
  inhoudelijk al elders in deze batch is verwerkt (bv. door overlap tussen de drie genummerde
  brondelen), wordt niet nogmaals als losse kaart toegevoegd.
- **FR-007**: Systeem MOET de al bestaande Badzwanzen-kaarten, de seed-testset, en de
  kaartensetcatalogus (welke sets er zijn en hoe ze heten) ongewijzigd laten — deze feature breidt
  uitsluitend de inhoud van de bestaande Badzwanzen-set uit.
- **FR-008**: Nieuw toegevoegde kaart-ID's MOETEN uniek zijn binnen de Badzwanzen-set (geen
  botsing met bestaande kaart-ID's, inclusief die uit eerdere batches zoals feature 014).

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
- **SC-005**: Geen twee kaarten in de uitgebreide Badzwanzen-set stellen inhoudelijk dezelfde
  vraag/opdracht (kwalitatief, te toetsen door de volledige lijst instructieteksten te doorlopen
  op inhoudelijke duplicaten, inclusief duplicaten die ontstaan door de drie overlappende
  brondelen van deze batch).

## Assumptions

- De ruwe brontekst is al aangeleverd en verbatim opgeslagen in
  `specs/018-add-card-set-2/raw-input.md` (drie los genummerde lijsten, Naam/Spel/Virus/Iedereen
  kaarttypen); deze spec beschrijft het resultaat (een geldige, verder uitgebreide Badzwanzen-set
  met unieke viruseindberichten en zonder inhoudelijke duplicaten), niet de letterlijke
  omzetstappen.
- Het mechanisme voor meerdere, selecteerbare, benoemde kaartensets (feature 010) en de regel dat
  elke viruskaart binnen een set een uniek eindbericht moet hebben (feature 011) bestaan al en
  worden door deze feature niet gewijzigd — alleen data toegevoegd binnen de bestaande
  `badzwanzen-card-set.ts`.
- Zoals bij de eerdere Badzwanzen-content (features 010 en 014) wordt de nieuw aangeleverde
  brontekst zoveel mogelijk integraal overgenomen, passend bij het karakter van dit private
  drankspel voor eigen vriendengroep — met dezelfde uitzondering die destijds is toegepast (geen
  daadwerkelijke scheldwoorden/beledigende termen in de uiteindelijke set).
- "Inhoudelijk duplicaat" (FR-006) wordt beoordeeld op betekenis, niet op exacte tekstgelijkheid —
  kleine formuleringsverschillen tussen de drie brondelen van deze batch, of tussen deze batch en
  bestaande kaarten, maken een vraag niet automatisch uniek.
- Deze feature introduceert geen nieuwe UI-schermen of visueel ontwerp — het
  kaartensetkeuzescherm en de rest van de UI blijven ongewijzigd; alleen de inhoud van de
  bestaande Badzwanzen-dataset breidt uit.
