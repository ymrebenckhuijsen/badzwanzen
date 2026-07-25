# Feature Specification: Git worktrees voor parallelle feature-ontwikkeling

**Feature Branch**: `002-git-worktree-setup`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Richt het project zo in dat we met git worktrees tegelijk aan
meerdere features kunnen werken, zodat elke feature-branch in zijn eigen werkmap staat en je
niet steeds hoeft te wisselen/stashen op dezelfde checkout. Dit gaat om het projectproces/de
tooling zelf (voor de twee ontwikkelaars), niet om een schermfunctie voor de eindgebruiker van
het spel."

## User Scenarios & Testing *(mandatory)*

*Let op: de "gebruiker" in deze feature is een ontwikkelaar aan dit project (Ymre of zijn
vader), niet een speler van het spel.*

### User Story 1 - Een nieuwe feature starten in een eigen werkmap (Priority: P1)

Als ontwikkelaar die aan een nieuwe feature wil beginnen, wil ik met één herhaalbare procedure
een eigen werkmap (git worktree) krijgen met de bijbehorende feature-branch al uitgecheckt,
zodat ik niet hoef te stashen of van branch te wisselen in mijn huidige werkmap om ergens
anders aan te beginnen.

**Why this priority**: Dit is de kernbehoefte — zonder dit is er geen parallel werken aan
meerdere features mogelijk, en blijft de huidige beperking (wisselen/stashen in dezelfde map)
gewoon bestaan.

**Independent Test**: Start, terwijl er al een feature-branch met niet-gecommit werk is
uitgecheckt in een werkmap, een nieuwe feature volgens de gedocumenteerde procedure. Verifieer
dat er een nieuwe, aparte werkmap ontstaat met de nieuwe branch uitgecheckt, en dat de
bestaande werkmap (inclusief het niet-gecommitte werk) volledig ongewijzigd blijft.

**Acceptance Scenarios**:

1. **Given** een werkmap met feature-branch A uitgecheckt en niet-gecommit werk, **When** een
   nieuwe feature B gestart wordt volgens de gedocumenteerde worktree-procedure, **Then**
   ontstaat er een nieuwe werkmap met branch B uitgecheckt, en blijft werkmap A (inclusief het
   niet-gecommitte werk) ongewijzigd.
2. **Given** twee actieve werkmappen op verschillende feature-branches, **When** in de ene
   werkmap wijzigingen worden gecommit, **Then** heeft dat geen zichtbaar effect in de andere
   werkmap totdat daar expliciet gefetcht wordt.

---

### User Story 2 - Conflictvrije feature-nummering over werkmappen heen (Priority: P1)

Als ontwikkelaar die een nieuwe feature-spec aanmaak, wil ik dat het volgnummer van mijn
feature nooit botst met een feature die al in een andere werkmap of branch in behandeling is,
zodat twee gelijktijdig gestarte features nooit per ongeluk hetzelfde nummer krijgen.

**Why this priority**: Dit probleem is al concreet opgetreden: twee features kregen allebei
nummer "001" omdat de nummering alleen keek naar de map `specs/` in de op dat moment actieve
checkout, en de andere feature nog op een niet-samengevoegde branch stond. Zonder oplossing
leidt elke sessie met parallelle features tot dit soort botsingen, wat de kern van deze
feature ondermijnt.

**Independent Test**: Maak, met een feature-branch die lokaal of op de remote bestaat maar niet
zichtbaar is in de huidige werkmap, een nieuwe feature aan. Verifieer dat het toegekende
volgnummer niet samenvalt met een reeds bestaande feature-branch.

**Acceptance Scenarios**:

1. **Given** feature-branch "001-add-players" bestaat (lokaal of op de remote) maar de map
   `specs/001-add-players` is niet aanwezig in de huidige werkmap, **When** een nieuwe feature
   wordt aangemaakt, **Then** krijgt die een volgnummer dat nog niet in gebruik is door een
   bestaande feature-branch.

---

### User Story 3 - Een werkmap opruimen na afronding (Priority: P3)

Als ontwikkelaar die een feature heeft afgerond en samengevoegd, wil ik de bijbehorende
werkmap op een simpele, herhaalbare manier weer opruimen, zodat er geen verweesde werkmappen
en branches blijven rondslingeren.

**Why this priority**: Nodig voor nette hygiëne op de langere termijn, maar het project blijft
ook zonder deze stap functioneren (opruimen kan altijd nog handmatig); daarom lagere prioriteit
dan het kunnen starten en conflictvrij nummeren van features.

**Independent Test**: Rond een feature af (merge de branch), volg de gedocumenteerde
opruimstappen voor de bijbehorende werkmap, en verifieer dat de werkmap niet meer bestaat en
niet meer voorkomt in het overzicht van actieve werkmappen.

**Acceptance Scenarios**:

1. **Given** een samengevoegde feature-branch met een bijbehorende werkmap, **When** de
   gedocumenteerde opruimstappen gevolgd worden, **Then** bestaat die werkmap niet meer en
   staat de branch niet meer in het overzicht van actieve werkmappen.

---

### Edge Cases

- Wat gebeurt er als iemand een werkmap probeert aan te maken voor een branch die al in een
  andere werkmap actief is? Dit MUST duidelijk worden teruggemeld, niet stil falen of de
  andere werkmap beschadigen.
- Wat gebeurt er met bestanden die niet in git zitten (bijvoorbeeld geïnstalleerde
  dependencies) in een nieuwe werkmap? Die MUST expliciet opnieuw aangemaakt/geïnstalleerd
  worden; ze worden niet automatisch gedeeld tussen werkmappen.
- Wat gebeurt er als twee ontwikkelaars tegelijk, ieder in hun eigen werkmap, een nieuwe
  feature-spec proberen aan te maken? (zie User Story 2: dit MUST geen dubbele nummers
  opleveren)
- Wat gebeurt er als een werkmap wordt opgeruimd terwijl er nog niet-gecommit werk in staat?
  Dit MUST voorkomen worden of expliciet bevestigd moeten worden, niet stilzwijgend werk laten
  verdwijnen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Het project MUST een gedocumenteerde, herhaalbare procedure bieden om voor een
  nieuwe feature een eigen git-werkmap (worktree) aan te maken, gekoppeld aan een nieuwe
  feature-branch.
- **FR-002**: Elke werkmap MUST onafhankelijk bruikbaar zijn (dependencies installeren,
  dev-server starten, tests draaien) zonder een andere werkmap te beïnvloeden.
- **FR-003**: Het toekennen van een volgnummer aan een nieuwe feature MUST rekening houden met
  reeds bestaande feature-branches, lokaal én op de remote — niet alleen met de mappen die
  zichtbaar zijn in de huidige werkmap — zodat twee gelijktijdig gestarte features nooit
  hetzelfde nummer krijgen.
- **FR-004**: Het project MUST een gedocumenteerde, herhaalbare procedure bieden om de werkmap
  van een afgeronde (samengevoegde) feature weer op te ruimen.
- **FR-005**: De procedure MUST expliciet documenteren welke niet-git-bestanden (zoals
  geïnstalleerde dependencies) opnieuw aangemaakt moeten worden bij het in gebruik nemen van
  een nieuwe werkmap.
- **FR-006**: Een poging om een branch te gebruiken die al in een andere werkmap actief is
  MUST resulteren in een foutmelding die de naam van de branch én het pad van de werkmap die
  hem al gebruikt noemt (niet een generieke foutmelding), zodat dit direct herkenbaar en
  bruikbaar is voor de ontwikkelaars.
- **FR-007**: De procedure MUST toepasbaar zijn voor beide ontwikkelaars onafhankelijk van
  elkaar (bijvoorbeeld: de een werkt aan feature X terwijl de ander aan feature Y werkt, elk in
  hun eigen werkmap op hun eigen machine, of beiden op dezelfde machine in aparte werkmappen).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Een ontwikkelaar kan een nieuwe feature starten in een eigen werkmap, zonder de
  bestaande werkmap van een andere feature aan te raken (geen stashen/wisselen nodig), in
  minder dan 2 minuten.
- **SC-002**: Twee features die gelijktijdig in aparte werkmappen gestart worden, krijgen in
  100% van de gevallen verschillende volgnummers.
- **SC-003**: De werkmap van een afgeronde feature kan in minder dan 1 minuut worden opgeruimd
  volgens de gedocumenteerde stappen.
- **SC-004**: Beide ontwikkelaars kunnen, ieder in hun eigen werkmap, gelijktijdig de
  ontwikkelserver en de testsuite draaien zonder dat de ene sessie de andere verstoort.

## Assumptions

- Beide ontwikkelaars werken vanaf dezelfde GitHub-remote (`origin`); werkmappen worden lokaal
  per ontwikkelaar aangemaakt en zijn geen door git gedeeld concept.
- Werkmappen leven op dezelfde machine als de hoofd-checkout; er is geen remote/cloud-oplossing
  voor werkmappen nodig.
- Niet-git-bestanden (zoals geïnstalleerde dependencies) worden per werkmap opnieuw
  geïnstalleerd; de extra schijfruimte en installatietijd die dat kost, is een geaccepteerde
  kost voor het voordeel van parallel werken.
- Deze feature verandert niets aan de speler-gerichte functionaliteit van het spel zelf; het
  betreft uitsluitend het ontwikkelproces en de bijbehorende tooling.
- De exacte locatie/naamgeving op schijf voor werkmappen (bijvoorbeeld een vaste map naast de
  hoofd-checkout) is een implementatiedetail dat in de planningsfase wordt bepaald, niet in
  deze spec.
