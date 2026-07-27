---

description: "Task list template for feature implementation"
---

# Tasks: Playwright visuele UI-tests in CI

**Input**: Design documents from `/specs/006-playwright-visual-ci/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Er zijn hier geen aparte "meta-tests" — de Playwright-specs zélf zijn de
deliverable/tests van deze feature. Elke user-story-fase bevat daarom een expliciete
**Validatie**-taak die de rood→groen-demonstratie uit `quickstart.md` uitvoert, in plaats van
een losse "Tests for User Story X"-sectie.

**Organization**: Taken zijn gegroepeerd per user story uit spec.md, zodat elke story
onafhankelijk te implementeren en te valideren is.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Kan parallel (ander bestand, geen afhankelijkheid van een nog niet afgeronde taak)
- **[Story]**: Bij welke user story deze taak hoort (US1–US4)

## Path Conventions

Eén bestaand Vite/React-project (single project). Playwright komt als losse testlaag naast
`src/`: `playwright.config.ts` op repo-root, testbestanden onder `tests/visual/` (zie plan.md §
Project Structure).

## Phase 1: Setup

**Purpose**: Playwright als dependency beschikbaar maken, zonder dat testartefacten per ongeluk
gecommit worden

- [X] T001 [P] Installeer `@playwright/test` als devDependency: `npm install --save-dev @playwright/test` (`package.json`, `package-lock.json`)
- [X] T002 [P] Voeg `playwright-report/` en `test-results/` toe aan `.gitignore` (Playwright's standaard output-mappen)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: De basisconfiguratie waar alle user stories op bouwen

**⚠️ CRITICAL**: Geen enkele user story kan starten voordat dit klaar is

- [X] T003 Maak `playwright.config.ts` op repo-root: `testDir: './tests/visual'`, `webServer` die `npm run build && npm run preview` draait, één `chromium`-project met viewport 390×844 (research.md § 2, § 5; depends on T001)

**Checkpoint**: Foundation gereed — user stories kunnen nu beginnen

---

## Phase 3: User Story 1 - Onbedoelde visuele regressies automatisch opvangen (Priority: P1) 🎯 MVP

**Goal**: CI faalt automatisch wanneer een codewijziging de UI onbedoeld laat afwijken van het
goedgekeurde referentiebeeld.

**Independent Test**: Open een pull request met een onbedoelde stylingwijziging → de
`visual-tests`-CI-job faalt. Open een pull request zonder visuele wijzigingen → de job slaagt.

### Implementation for User Story 1

- [X] T004 [US1] Schrijf `tests/visual/player-setup.spec.ts`: render de app (`PlayerSetupScreen` in standaard/initiële staat) en assert `expect(page).toHaveScreenshot('player-setup.png')` (depends on T003)
- [X] T005 [US1] Genereer en commit het initiële Linux-referentiebeeld via Playwright's officiële Docker-image, per quickstart.md § 2 (`tests/visual/player-setup.spec.ts-snapshots/player-setup-chromium-linux.png`) (depends on T004)
- [X] T006 [US1] Voeg een `visual-tests`-job toe aan `.github/workflows/ci.yml`: checkout, `actions/setup-node@v4` (node 22), `npm ci`, `npx playwright install --with-deps chromium`, `npx playwright test` (depends on T005)
- [X] T007 [US1] Valideer end-to-end per quickstart.md § 3: wijzig tijdelijk een stijl in `src/features/players/PlayerSetupScreen.tsx`, bevestig dat `npx playwright test` faalt met een diff, draai de wijziging terug en bevestig dat de test weer slaagt (depends on T006)

**Checkpoint**: User Story 1 is volledig functioneel en zelfstandig te testen (open een PR, bekijk de `visual-tests`-job). **Let op**: FR-007 ("consistente, reproduceerbare render-omgeving") is hier pas gedeeltelijk gedekt — vast viewport/browser staat (T003), maar animaties uitschakelen en op webfonts wachten volgen pas in Phase 6 (User Story 4, T012). Deze MVP kan dus af en toe nog een vals-positieve diff geven totdat Phase 6 is afgerond.

---

## Phase 4: User Story 2 - Bewuste UI-wijzigingen goedkeuren (Priority: P1)

**Goal**: Een ontwikkelaar kan eenvoudig zien wat er visueel is veranderd en het
referentiebeeld bijwerken, zodat een gewenste UI-wijziging niet blijvend CI laat falen.

**Independent Test**: Voer een bewuste visuele wijziging door, bekijk het diff-rapport, werk het
referentiebeeld bij, en bevestig dat CI weer slaagt.

### Implementation for User Story 2

- [X] T008 [US2] Voeg een rapport-upload-stap toe aan de `visual-tests`-job in `.github/workflows/ci.yml`: `actions/upload-artifact` voor `playwright-report/`, met `if: failure()` (depends on T006)
- [X] T009 [P] [US2] Voeg de scripts `test:visual` (`playwright test`) en `test:visual:update` (`playwright test --update-snapshots`) toe aan `package.json`
- [X] T010 [US2] Valideer end-to-end per quickstart.md § 4: maak een bewuste visuele wijziging, volg de bijwerkprocedure uit `contracts/visual-test-conventions.md` (`npm run test:visual:update` via het Docker-image), commit het nieuwe referentiebeeld, en bevestig dat `npm run test:visual` weer slaagt (depends on T008, T009)

**Checkpoint**: User Story 1 én 2 werken samen zelfstandig

---

## Phase 5: User Story 3 - Dekking van de belangrijkste schermen (Priority: P2)

**Goal**: De visuele testsuite dekt de belangrijkste schermen van de app, uitbreidbaar
naarmate er nieuwe schermen bijkomen.

**Independent Test**: Doorloop de bestaande hoofdschermen van de app; verifieer dat elk
hoofdscherm een eigen visuele testcase en referentiebeeld heeft.

> **Noot**: de app heeft vandaag precies één hoofdscherm (`PlayerSetupScreen`), dat al gedekt is
> door User Story 1. Deze story voegt daarom geen nieuw testbestand toe (dat zou een niet-
> bestaand scherm verzinnen, in strijd met Principle III/YAGNI), maar bevestigt dat de opzet
> daadwerkelijk uitbreidbaar is — zodat het opdrachten/virussen-scherm straks (feature
> 004-assignments-and-viruses) er zonder structuurwijziging bij kan.

### Implementation for User Story 3

- [X] T011 [P] [US3] Verifieer dat `playwright.config.ts`'s `testDir` (`tests/visual`) elk nieuw `*.spec.ts`-bestand automatisch oppikt zonder configwijziging, en dat dit klopt met de beschrijving in `contracts/visual-test-conventions.md` (depends on T003)

**Checkpoint**: Dekking van de bestaande hoofdschermen bevestigd; nieuwe schermen kunnen zonder plumbing-wijziging worden toegevoegd

---

## Phase 6: User Story 4 - Stabiele, betrouwbare uitslagen (Priority: P3)

**Goal**: De visuele tests draaien consistent, zonder valse positieven door
rendering-verschillen.

**Independent Test**: Draai dezelfde visuele testsuite twee keer achter elkaar zonder
codewijzigingen; beide runs geven hetzelfde resultaat.

### Implementation for User Story 4

- [X] T012 [US4] Maak de screenshot deterministisch in `tests/visual/player-setup.spec.ts`: `{ animations: 'disabled' }` op de `toHaveScreenshot()`-assertie en wacht op `document.fonts.ready` vóór de screenshot (research.md § 4) (depends on T004)
- [X] T013 [US4] Valideer end-to-end per quickstart.md § 6: draai `npm run test:visual` twee keer achter elkaar zonder codewijzigingen, bevestig dat beide runs identiek slagen (depends on T012)

**Checkpoint**: Alle vier user stories zelfstandig functioneel. Vanaf hier is FR-007 volledig gedekt (viewport/browser sinds T003, animaties/webfonts sinds T012) — zie de kanttekening bij User Story 1's checkpoint.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T014 Doorloop `quickstart.md` volledig (§ 1 t/m § 6) als eindcontrole
- [X] T015 [P] Voeg een korte "Visuele tests"-sectie toe aan `README.md` die verwijst naar `specs/006-playwright-visual-ci/quickstart.md` en `contracts/visual-test-conventions.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: geen afhankelijkheden — kan direct starten
- **Foundational (Phase 2)**: hangt af van Setup — BLOKKEERT alle user stories
- **User Stories (Phase 3–6)**: hangen allemaal af van Foundational; kunnen daarna in
  prioriteitsvolgorde (P1 → P1 → P2 → P3) of, waar afhankelijkheden het toelaten, parallel
- **Polish (Phase 7)**: hangt af van alle gewenste user stories

### User Story Dependencies

- **US1 (P1)**: start na Foundational; geen afhankelijkheid van andere stories
- **US2 (P1)**: bouwt voort op de `visual-tests`-CI-job uit US1 (T006), dus start na US1's T006
- **US3 (P2)**: heeft alleen Foundational (T003) nodig — kan in principe parallel aan US1/US2
- **US4 (P3)**: bouwt voort op het testbestand uit US1 (T004), dus start na US1's T004

### Parallel Opportunities

- T001 en T002 samen (Setup, andere bestanden)
- T009 kan parallel aan T008 (ander bestand: `package.json` vs. `.github/workflows/ci.yml`)
- T011 (US3) kan parallel aan de rest zodra Foundational (T003) klaar is
- T015 (Polish) kan parallel aan andere late taken zodra US1 klaar is

---

## Parallel Example: Setup

```bash
Task: "Installeer @playwright/test als devDependency"
Task: "Voeg playwright-report/ en test-results/ toe aan .gitignore"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: User Story 1
4. **STOP en VALIDEER**: bevestig dat een onbedoelde visuele wijziging CI laat falen
5. Merge/demo als gereed

### Incremental Delivery

1. Setup + Foundational → basis gereed
2. User Story 1 → CI-regressiedetectie werkt (MVP)
3. User Story 2 → referentiebeeld bijwerken wordt praktisch haalbaar
4. User Story 3 → dekking en uitbreidbaarheid bevestigd
5. User Story 4 → resultaten worden betrouwbaar/stabiel
6. Polish → eindvalidatie en documentatie

---

## Notes

- [P] taken = andere bestanden, geen onderlinge afhankelijkheid
- [Story]-label koppelt de taak aan een specifieke user story
- Elke user story is zelfstandig afrondbaar en te valideren via zijn eigen validatietaak
- Commit na elke taak of logische groep taken
- Vermijd: schermen/staten testen die nog niet bestaan (zie noot bij User Story 3)
