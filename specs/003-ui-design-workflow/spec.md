# Feature Specification: UI-design-stap in de spec-driven workflow (Google Stitch)

**Feature Branch**: `003-ui-design-workflow`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Voeg een UI-design-stap toe aan de spec-driven workflow: voor
elke feature die de UI raakt, wordt eerst via Google Stitch (MCP) een UI-ontwerp gegenereerd en
vastgelegd in een DESIGN.md (styling/design tokens, kleuren, typografie, componenten) voordat
er geïmplementeerd wordt. Na het genereren van het ontwerp is er een interactief review-moment
waarin de gebruiker de voorgestelde UI kan bekijken en wijzigingen kan aanvragen voordat
/speckit-tasks en /speckit-implement doorgaan. Dit geldt voor alle UI-rakende features (game
features en eventuele interne tooling met een UI), niet alleen voor deze workflow-feature
zelf."

## Clarifications

### Session 2026-07-25

- Q: Waar leeft `DESIGN.md`, gegeven dat er één gedeeld design system is dat features
  hergebruiken? → A: Optie C — een blijvend, projectbreed `DESIGN.md` (repository-root) voor
  de gedeelde basis, plus een klein, feature-specifiek addendum-`DESIGN.md` in de feature-map
  voor wat die feature toevoegt of afwijkt.
- Q: Hoe wordt de goedkeuringsstatus van een ontwerp vastgelegd zodat `/speckit-tasks` die
  betrouwbaar kan controleren, ook na een sessie-onderbreking? → A: Optie A — een
  statusregel/frontmatter-veld (bijv. `Status: Approved`) in het feature-specifieke
  `DESIGN.md`-addendum zelf, die `/speckit-tasks` leest voordat het taken genereert.

## User Scenarios & Testing *(mandatory)*

*Let op: de "gebruiker" in deze feature is een ontwikkelaar aan dit project (Ymre of zijn
vader), niet een speler van het spel.*

### User Story 1 - Ontwerp vastleggen vóór implementatie (Priority: P1)

Als ontwikkelaar die een UI-rakende feature specificeert, wil ik dat er automatisch via Google
Stitch een UI-ontwerp gegenereerd wordt en vastgelegd in een `DESIGN.md`, zodat
stylingbeslissingen (kleuren, typografie, componenten) al vastliggen voordat er ook maar één
regel implementatiecode geschreven wordt.

**Why this priority**: Dit is de kernbehoefte — zonder dit blijft UI-styling een ad-hoc
beslissing tijdens het implementeren, precies het probleem dat deze feature moet oplossen.

**Independent Test**: Doorloop `/speckit-specify` voor een nieuwe, duidelijk UI-rakende
feature. Verifieer dat er, voordat `/speckit-plan` iets over styling hoeft te verzinnen, een
`DESIGN.md` in de feature-map staat met concrete kleuren, typografie en componentstijl.

**Acceptance Scenarios**:

1. **Given** een nieuwe feature-specificatie die een schermfunctie voor de eindgebruiker
   beschrijft, **When** de designstap wordt doorlopen, **Then** ontstaat er een `DESIGN.md` in
   de feature-map met kleuren, typografie en componentstijl die zijn afgeleid van een via
   Stitch gegenereerd ontwerp.
2. **Given** een gegenereerde `DESIGN.md`, **When** `/speckit-plan` wordt gestart, **Then**
   verwijst het plan naar `DESIGN.md` in plaats van dat er nieuwe, losse stylingkeuzes worden
   verzonnen.

---

### User Story 2 - Interactief ontwerp beoordelen en aanpassen (Priority: P1)

Als ontwikkelaar wil ik het door Stitch voorgestelde ontwerp kunnen bekijken (bijvoorbeeld als
preview-afbeelding) en gericht wijzigingen kunnen aanvragen, zodat ik controle houd over hoe
het spel eruitziet vóórdat er taken en code voor worden gemaakt.

**Why this priority**: Dit is de andere kernbehoefte uit de featurewens ("laat me interactief
de UI zien zodat ik aanpassingen kan doen voordat we verder gaan"): zonder een expliciet
review-moment is de designstap alleen automatisering, geen samenwerking.

**Independent Test**: Genereer een ontwerp voor een feature, vraag een concrete wijziging aan
(bijvoorbeeld een andere accentkleur of ander component), en verifieer dat het ontwerp en de
`DESIGN.md` worden bijgewerkt op basis van die feedback vóórdat er wordt goedgekeurd.

**Acceptance Scenarios**:

1. **Given** een net gegenereerd ontwerp, **When** de ontwikkelaar een wijziging aanvraagt,
   **Then** wordt een aangepast ontwerp gegenereerd en de `DESIGN.md` dienovereenkomstig
   bijgewerkt, zonder dat de workflow al naar `/speckit-tasks` is doorgegaan.
2. **Given** een gegenereerd ontwerp waar de ontwikkelaar nog geen goedkeuring voor heeft
   gegeven, **When** `/speckit-tasks` wordt aangeroepen voor die feature, **Then** wijst het
   systeem erop dat het ontwerp nog niet is goedgekeurd en wacht het op een expliciete
   goedkeuring voordat het taken genereert.
3. **Given** een gegenereerd ontwerp, **When** de ontwikkelaar het ontwerp goedkeurt, **Then**
   kan de workflow doorgaan naar `/speckit-tasks` en `/speckit-implement`.

---

### User Story 3 - Niet-UI features slaan de designstap over (Priority: P2)

Als ontwikkelaar die een feature zonder UI-impact specificeert (bijvoorbeeld interne tooling of
pure spellogica), wil ik niet gedwongen worden een designstap te doorlopen die niet van
toepassing is, zodat de workflow voor dit soort features net zo licht blijft als nu.

**Why this priority**: Voorkomt dat de designstap onnodige overhead toevoegt aan features zoals
[[project-git-worktrees]]-achtige tooling, wat de bredere workflow-discipline
([[project-badzwanzen-overview]]) zou ondermijnen als ontwikkelaars de stap als storend gaan
ervaren en de neiging krijgen de flow te omzeilen.

**Independent Test**: Doorloop `/speckit-specify` voor een feature die expliciet geen UI heeft.
Verifieer dat de workflow doorgaat naar `/speckit-plan` zonder dat er een `DESIGN.md` wordt
geëist of een Stitch-ontwerp wordt gegenereerd.

**Acceptance Scenarios**:

1. **Given** een feature-beschrijving zonder UI-impact, **When** de designstap wordt bereikt,
   **Then** wordt deze overgeslagen en gaat de workflow direct verder, zonder verplichte
   Stitch-interactie of `DESIGN.md`.

---

### User Story 4 - Consistente visuele stijl over features heen (Priority: P3)

Als ontwikkelaar wil ik dat opeenvolgende UI-rakende features hetzelfde onderliggende design
system (kleuren, typografie, componentstijl) hergebruiken, zodat de app als geheel een
consistente uitstraling houdt in plaats van dat elke feature een eigen, losstaande stijl
krijgt.

**Why this priority**: Verhoogt de kwaliteit van het eindresultaat, maar de kernwerkwijze
(ontwerp vastleggen + reviewen vóór implementatie) werkt ook zonder dit al perfect op orde te
hebben; daarom lagere prioriteit dan User Story 1 en 2.

**Independent Test**: Doorloop de designstap voor twee verschillende UI-rakende features na
elkaar. Verifieer dat beide `DESIGN.md`-bestanden naar hetzelfde onderliggende design system
verwijzen (dezelfde basiskleuren/typografie), tenzij de ontwikkelaar expliciet om een afwijkende
stijl heeft gevraagd.

**Acceptance Scenarios**:

1. **Given** een al bestaand, project-breed design system, **When** een nieuwe UI-rakende
   feature de designstap doorloopt, **Then** wordt dat bestaande design system als basis
   gebruikt in plaats van dat er een volledig nieuw, losstaand ontwerp ontstaat.

---

### Edge Cases

- Wat gebeurt er als de Stitch-integratie niet bereikbaar is op het moment dat een ontwerp
  gegenereerd moet worden? (zie FR-009)
- Wat gebeurt er als de ontwikkelaar meerdere rondes wijzigingen aanvraagt zonder ooit goed te
  keuren? De workflow moet in review blijven staan zonder vast te lopen of stilzwijgend door te
  gaan.
- Wat gebeurt er als een feature slechts een klein UI-detail toevoegt aan een scherm dat al een
  goedgekeurd ontwerp heeft (bijvoorbeeld één nieuwe knop)? De designstap moet dit kunnen
  afhandelen als een gerichte aanvulling op het bestaande design system, niet als reden om het
  hele scherm opnieuw te laten ontwerpen.
- Wat gebeurt er als de ontwikkelaar zelf twijfelt of een feature UI-impact heeft? Er moet een
  duidelijke, eenvoudige regel zijn om dit te bepalen (zie Assumptions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: De workflow MUST een designstap bevatten die wordt doorlopen tussen het
  specificeren/verhelderen van een feature en `/speckit-plan`, en die bepaalt of de feature
  UI-impact heeft.
- **FR-002**: Voor een feature met UI-impact MUST het systeem via de Stitch MCP-integratie een
  UI-ontwerp genereren op basis van de feature-beschrijving.
- **FR-003**: Het systeem MUST het resulterende ontwerp — kleuren, typografie, spacing en
  componentstijl (design tokens) — vastleggen in twee lagen: het projectbrede, canonieke
  `DESIGN.md` in de repository-root MUST worden bijgewerkt met wijzigingen aan het gedeelde
  design system, en de feature-map MUST een eigen, kleiner `DESIGN.md`-addendum krijgen dat
  beschrijft wat specifiek voor déze feature is toegevoegd of afwijkt.
- **FR-004**: Het systeem MUST de ontwikkelaar een manier bieden om het gegenereerde ontwerp
  visueel te bekijken (bijvoorbeeld een preview-afbeelding of link) voordat er wordt
  goedgekeurd.
- **FR-005**: Het systeem MUST de ontwikkelaar toestaan interactief wijzigingen op het ontwerp
  aan te vragen, en het ontwerp en de `DESIGN.md` op basis van die feedback opnieuw te
  genereren of aan te passen.
- **FR-006**: `/speckit-tasks` en `/speckit-implement` MUST NOT doorgaan voor een UI-rakende
  feature totdat de statusregel in het feature-specifieke `DESIGN.md`-addendum aangeeft dat de
  ontwikkelaar het ontwerp expliciet heeft goedgekeurd (bijv. `Status: Approved`); een
  ontbrekende of niet-goedgekeurde status MUST de generatie van taken blokkeren.
- **FR-007**: Voor een feature zonder UI-impact MUST de designstap worden overgeslagen zonder
  de workflow te blokkeren of te vertragen.
- **FR-008**: Het systeem MUST hergebruik van één bestaand, project-breed Stitch design system
  ondersteunen, vastgelegd in het canonieke `DESIGN.md` in de repository-root, zodat
  opeenvolgende UI-rakende features een consistente basisstijl delen in plaats van dat elke
  feature een volledig nieuw, losstaand design system krijgt.
- **FR-009**: Als de Stitch-integratie niet beschikbaar is, MUST het systeem de ontwikkelaar
  hier duidelijk over informeren en een expliciete keuze bieden — opnieuw proberen, of
  handmatig doorgaan met een door de ontwikkelaar zelf geschreven `DESIGN.md` — in plaats van
  de workflow onopgemerkt te laten vastlopen.
- **FR-010**: De combinatie van het projectbrede `DESIGN.md` en het feature-specifieke
  addendum MUST voldoende gedetailleerd zijn (kleuren, typografie, componentstijl) om als
  directe basis te dienen voor `/speckit-plan` en `/speckit-tasks`, zonder dat de ontwikkelaar
  daarnaast nog los onderzoek naar styling hoeft te doen.

### Key Entities

- **DESIGN.md (projectbreed)**: Canoniek bestand in de repository-root dat het gedeelde
  design system documenteert (kleuren, typografie, spacing, componentstijl) en bij elke
  UI-rakende feature wordt bijgewerkt; de bron van waarheid voor de gedeelde visuele
  identiteit.
- **DESIGN.md (feature-addendum)**: Klein, feature-specifiek bestand in de feature-map dat
  beschrijft wat déze feature toevoegt aan of laat afwijken van het projectbrede design
  system (nieuwe schermen/componenten), met een verwijzing naar het projectbrede bestand; de
  directe brug tussen het Stitch-ontwerp voor déze feature en `/speckit-plan`/`/speckit-tasks`.
- **Design system**: Het onderliggende, project-brede geheel van stylingregels in Stitch dat
  meerdere features en schermen deelt, zodat de visuele identiteit van de app consistent
  blijft.
- **Ontwerp-review-status**: De stand van een feature's ontwerp — bijvoorbeeld "gegenereerd,
  wacht op review", "wijziging aangevraagd" of "goedgekeurd" — vastgelegd als een expliciete
  statusregel/frontmatter-veld in het feature-specifieke `DESIGN.md`-addendum, die bepaalt of
  `/speckit-tasks`/`/speckit-implement` mogen starten.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Voor elke UI-rakende feature bestaan er, voordat implementatietaken worden
  gegenereerd, een actueel projectbreed `DESIGN.md` en een feature-specifiek `DESIGN.md`-
  addendum met concrete kleuren, typografie en componentstijl.
- **SC-002**: De ontwikkelaar kan het voorgestelde ontwerp bekijken en minstens één ronde van
  wijzigingen aanvragen voordat de workflow doorgaat naar `/speckit-tasks`.
- **SC-003**: Twee opeenvolgende UI-rakende features delen dezelfde basisstijl (kleuren en
  typografie), meetbaar doordat hun feature-specifieke `DESIGN.md`-addenda beide verwijzen naar
  hetzelfde projectbrede `DESIGN.md` zonder tegenstrijdige kleur-/typografiewaarden, tenzij de
  ontwikkelaar expliciet om een afwijkende stijl heeft gevraagd.
- **SC-004**: Voor een feature zonder UI-impact voegt de designstap nul verplichte
  interactiemomenten of wachttijd toe aan de workflow.

## Assumptions

- Er is één gedeeld, project-breed Stitch-project/design system voor de hele Badzwanzen-app
  (er bestaat al een Stitch-project "Party Quest" met een uitgewerkt design system), dat per
  UI-rakende feature wordt uitgebreid met nieuwe schermen in plaats van dat er per feature een
  volledig nieuw, los design system ontstaat.
- Of een feature "UI-impact" heeft, wordt in v1 door de ontwikkelaar zelf beoordeeld en
  bevestigd bij het starten van de designstap; geautomatiseerde detectie is geen vereiste.
  Voor interne tooling zonder schermen (zoals worktree-scripts) is dat antwoord duidelijk
  "nee".
- Het review-moment vindt plaats binnen dezelfde interactieve sessie/chat als de rest van de
  workflow; er is geen apart goedkeuringsscherm of -systeem nodig.
- Als Stitch aanhoudend onbereikbaar is en de ontwikkelaar expliciet kiest voor handmatig
  doorgaan (zie FR-009), telt dat niet als falen van deze feature — de escape hatch is zelf
  onderdeel van de vereiste.
