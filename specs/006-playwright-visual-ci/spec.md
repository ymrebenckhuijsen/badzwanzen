# Feature Specification: Playwright visuele UI-tests in CI

**Feature Branch**: `006-playwright-visual-ci`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "Playwright visual/UI-tests in CI om te controleren of de UI er
goed uitziet"

## Clarifications

### Session 2026-07-26

- Q: Op welk(e) viewport(s) moeten de visuele tests draaien? → A: Optie A — alleen een mobiel
  viewport (bijv. 390×844), passend bij het mobile-first ontwerp en het daadwerkelijke gebruik
  tijdens het spel.
- Q: Dekken de visuele tests per hoofdscherm alleen de standaard/initiële staat, of ook
  representatieve gevulde/foutstaten? → A: Optie A — v1 dekt alleen de standaard/initiële
  staat per hoofdscherm; extra staten worden later per scherm toegevoegd zodra nodig.

## User Scenarios & Testing *(mandatory)*

*Let op: de "gebruiker" in deze feature is een ontwikkelaar aan dit project (Ymre of zijn
vader), niet een speler van het spel.*

### User Story 1 - Onbedoelde visuele regressies automatisch opvangen (Priority: P1)

Als ontwikkelaar wil ik dat CI automatisch faalt wanneer een codewijziging de UI onbedoeld
laat afwijken van de goedgekeurde referentiebeelden, zodat visuele regressies worden opgemerkt
vóórdat een pull request naar main wordt gemerged.

**Why this priority**: Dit is de kernbehoefte — zonder automatische detectie blijven visuele
regressies (bijv. een kapotte layout of verkeerde kleur) onopgemerkt tot een speler ze
tegenkomt op de live site.

**Independent Test**: Open een pull request met een onbedoelde stylingwijziging die het
uiterlijk van een scherm verandert. Verifieer dat de CI-run faalt op de visuele-test-stap,
terwijl een pull request zonder visuele wijzigingen gewoon slaagt.

**Acceptance Scenarios**:

1. **Given** een bestaand, goedgekeurd referentiebeeld voor een scherm, **When** een pull
   request een wijziging bevat die dat scherm er visueel anders uit laat zien dan het
   referentiebeeld, **Then** faalt de visuele-test-stap in CI en wordt de pull request als
   falend gemarkeerd.
2. **Given** een pull request zonder visuele wijzigingen, **When** de visuele-test-stap in CI
   draait, **Then** slaagt deze zonder dat een mens hoeft in te grijpen.

---

### User Story 2 - Bewuste UI-wijzigingen goedkeuren (Priority: P1)

Als ontwikkelaar die bewust een UI-wijziging doorvoert, wil ik eenvoudig kunnen zien wat er
visueel is veranderd en de referentiebeelden kunnen bijwerken, zodat legitieme UI-wijzigingen
niet steeds opnieuw CI laten falen.

**Why this priority**: Zonder dit wordt de check een blokkade in plaats van een hulpmiddel —
elke bewuste redesign zou CI permanent laten falen, wat de workflow-discipline
([[project_badzwanzen_overview]]) ondermijnt als ontwikkelaars de check gaan negeren of
uitschakelen.

**Independent Test**: Voer een bewuste, gewenste visuele wijziging door, bekijk het diff-
rapport, werk het referentiebeeld bij volgens het gedocumenteerde proces en verifieer dat CI
daarna weer slaagt.

**Acceptance Scenarios**:

1. **Given** een falende visuele test door een bewuste wijziging, **When** de ontwikkelaar het
   diff-rapport bekijkt, **Then** is duidelijk zichtbaar welk scherm en welk deel ervan is
   veranderd (bijv. via een diff-afbeelding naast oud/nieuw).
2. **Given** een falende visuele test die de ontwikkelaar als gewenst beoordeelt, **When** de
   ontwikkelaar het referentiebeeld bijwerkt, **Then** slaagt een volgende CI-run voor dat
   scherm weer.

---

### User Story 3 - Dekking van de belangrijkste schermen (Priority: P2)

Als ontwikkelaar wil ik dat de visuele tests de belangrijkste schermen/flows van de app dekken
(bijv. hoofdmenu, spelersbeheer, opdrachten/virussen-scherm), zodat regressies breed worden
opgevangen in plaats van op maar één scherm.

**Why this priority**: Bepaalt de daadwerkelijke dekking en waarde van de check, maar het
basismechanisme (User Story 1 en 2) moet eerst werken voordat dekking zin heeft.

**Independent Test**: Doorloop de bestaande hoofdschermen van de app. Verifieer dat elk
hoofdscherm, in zijn standaard/initiële staat, een eigen visuele testcase en referentiebeeld
heeft, en los faalt/slaagt.

**Acceptance Scenarios**:

1. **Given** de bestaande hoofdschermen van de app in hun standaard/initiële staat, **When** de
   visuele testsuite draait, **Then** wordt voor elk hoofdscherm een los screenshot vergeleken
   met zijn eigen referentiebeeld.

---

### User Story 4 - Stabiele, betrouwbare uitslagen (Priority: P3)

Als ontwikkelaar wil ik dat de visuele tests consistent draaien, zonder valse positieven door
rendering-verschillen tussen omgevingen, zodat ik CI-uitslagen kan vertrouwen.

**Why this priority**: Verhoogt vertrouwen in en houdbaarheid van de check op langere termijn,
maar de kernwerking (regressies opvangen, bewuste wijzigingen goedkeuren) staat ook zonder dit
al overeind.

**Independent Test**: Draai dezelfde visuele testsuite twee keer achter elkaar zonder
codewijzigingen ertussen. Verifieer dat beide runs hetzelfde resultaat geven.

**Acceptance Scenarios**:

1. **Given** geen wijzigingen aan de code tussen twee CI-runs, **When** de visuele testsuite
   twee keer draait, **Then** geven beide runs hetzelfde resultaat, zonder onverklaarde diffs.

---

### Edge Cases

- Wat gebeurt er als een pull request vanuit een fork komt zonder schrijfrechten om
  referentiebeelden bij te werken?
- Wat gebeurt er als een nieuw scherm wordt toegevoegd dat nog geen referentiebeeld heeft?
- Wat gebeurt er als een visuele test faalt door tijdelijke, onbedoelde flakiness (bijv. een
  animatie of laadtijd van lettertypen) in plaats van een echte regressie?
- Wat gebeurt er als de visuele-test-stap de totale CI-doorlooptijd fors verlengt ten opzichte
  van de bestaande lint-en-testrun?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: De CI-workflow MUST bij elke pull request en bij pushes naar main automatisch een
  visuele UI-testsuite uitvoeren.
- **FR-002**: Het systeem MUST screenshots van de belangrijkste schermen van de app vastleggen
  en vergelijken met een goedgekeurd referentiebeeld per scherm.
- **FR-003**: Het systeem MUST de CI-run laten falen wanneer een visueel verschil met het
  referentiebeeld een acceptabele drempel overschrijdt.
- **FR-004**: Bij een falende visuele test MUST het systeem een voor mensen begrijpelijke diff
  (bijv. een diff-afbeelding of rapport) beschikbaar stellen, zodat een reviewer kan zien wat er
  precies is veranderd.
- **FR-005**: Ontwikkelaars MUST op een eenvoudige, gedocumenteerde manier de
  referentiebeelden kunnen bijwerken wanneer een visuele wijziging bewust en gewenst is.
- **FR-006**: De visuele testsuite MUST voor v1 minstens de standaard/initiële staat van elk
  belangrijk hoofdscherm van de app dekken, en MUST uitbreidbaar zijn naarmate er nieuwe
  schermen of relevante staten (bijv. gevuld of foutmelding) bijkomen, niet beperkt blijven tot
  één scherm of staat.
- **FR-007**: Het systeem MUST draaien in een consistente, reproduceerbare render-omgeving —
  een vast mobiel viewport (bijv. 390×844) en vaste browser-versie — om valse positieven door
  omgevingsverschillen te minimaliseren en aan te sluiten bij het mobile-first ontwerp en het
  daadwerkelijke gebruik tijdens het spel.
- **FR-008**: De visuele-test-stap MUST los van de bestaande lint/unit-test-stap in de
  CI-workflow kunnen slagen of falen, zodat de oorzaak van een falende CI-run altijd duidelijk
  is (visuele regressie versus lint/unit-testfout).

### Key Entities

- **Referentiebeeld (baseline-screenshot)**: De goedgekeurde afbeelding per scherm/testcase
  waarmee nieuwe renders worden vergeleken; de bron van waarheid voor "hoe dit scherm er hoort
  uit te zien".
- **Visuele testcase**: Een gedefinieerde combinatie van scherm en staat die tijdens CI wordt
  gerenderd en vergeleken met zijn referentiebeeld.
- **Diff-rapport**: De output die per falende testcase laat zien wat er visueel is veranderd
  ten opzichte van het referentiebeeld.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Een pull request met een onbedoelde visuele regressie op een gedekt scherm wordt
  door CI gedetecteerd en als falend gemarkeerd, zonder dat een mens dit handmatig hoeft te
  ontdekken.
- **SC-002**: Een ontwikkelaar kan een bewuste UI-wijziging beoordelen en het referentiebeeld
  bijwerken in minder dan 5 minuten, zonder de CI-configuratie zelf te hoeven aanpassen.
- **SC-003**: Minstens de belangrijkste hoofdschermen van de app hebben elk een eigen visuele
  testcase.
- **SC-004**: Twee opeenvolgende CI-runs zonder codewijzigingen geven hetzelfde visuele
  testresultaat (geen flakiness bij herhaalde runs zonder wijzigingen).

## Assumptions

- "De belangrijkste schermen" worden in eerste instantie door de ontwikkelaar bepaald op basis
  van de bestaande hoofdschermen van de app ([[project_badzwanzen_overview]]); voor v1 wordt
  per hoofdscherm alleen de standaard/initiële staat gedekt, geen uitputtende lijst van alle
  mogelijke states/varianten.
- Referentiebeelden worden als bestanden in de repository opgeslagen en via een pull request
  bijgewerkt en beoordeeld, net als reguliere code — geen extern screenshot-hostingsysteem is
  vereist voor v1.
- De visuele tests draaien tegen een lokaal gebouwde/geserveerde versie van de app binnen de
  CI-runner, niet tegen de live Vercel-deployment ([[project_005_deployment_status]]).
- De acceptabele visuele-verschildrempel (pixel-diff-tolerantie) wordt met een redelijke
  standaardwaarde ingesteld en kan later verfijnd worden; dit is geen blokkerende
  designbeslissing voor v1.
- Deze feature is interne tooling zonder eigen speler-zichtbare UI; de bestaande UI-design-
  workflow ([[project_ui_design_workflow_inprogress]]) hoeft er dus niet voor doorlopen te
  worden.
