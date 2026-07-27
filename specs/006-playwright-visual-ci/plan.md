# Implementation Plan: Playwright visuele UI-tests in CI

**Branch**: `006-playwright-visual-ci` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-playwright-visual-ci/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

CI moet automatisch onbedoelde visuele regressies opvangen door de belangrijkste schermen van
de app (in hun standaard/initiële staat, op een mobiel viewport) te vergelijken met goedgekeurde
referentiebeelden. Aanpak: `@playwright/test` met zijn ingebouwde `toHaveScreenshot()`-
vergelijking — referentiebeelden zijn gewoon PNG-bestanden in de repository, geen extern
screenshot-hostingsysteem (Principle IV: zero-cost). De testsuite draait tegen een lokaal
gebouwde `vite preview`-server, in Chromium headless op een vast mobiel viewport (390×844),
als nieuwe, aparte job in de bestaande GitHub Actions CI-workflow zodat een visuele regressie
duidelijk te onderscheiden is van een lint/unit-testfout (FR-008).

## Technical Context

**Language/Version**: TypeScript (project-conventie, zie `tsconfig.json`), Node 22 (zoals
`.github/workflows/ci.yml` al gebruikt)

**Primary Dependencies**: `@playwright/test` (nieuwe devDependency); app-under-test draait via
Vite's ingebouwde `preview`-server (geen nieuwe serverdependency)

**Storage**: N/A — referentiebeelden zijn PNG-bestanden onder versiebeheer in de repository,
geen database of extern hostingsysteem

**Testing**: Playwright Test's ingebouwde visuele assertie (`expect(page).toHaveScreenshot()`),
uitgevoerd via `npx playwright test`. De bestaande Vitest + React Testing Library-suite blijft
ongewijzigd en dekt logica/component-tests; Playwright dekt uitsluitend visuele regressie
(pixelvergelijking), een categorie die jsdom structureel niet kan testen (geen echte rendering)

**Target Platform**: Chromium headless op de GitHub Actions `ubuntu-latest`-runner (CI); lokaal
worden referentiebeelden gegenereerd/bijgewerkt via Playwright's officiële Docker-image
(`mcr.microsoft.com/playwright:v<versie>-jammy`) zodat ze pixel-voor-pixel overeenkomen met wat
CI produceert, ongeacht of de ontwikkelaar op macOS werkt. Vast mobiel viewport 390×844 (zie
Clarifications in spec.md)

**Project Type**: Eén web-app (bestaand Vite/React-project); nieuwe top-level `tests/visual/`-
map naast de bestaande `src/`, geen nieuw package/subproject

**Performance Goals**: De visuele testsuite voegt voor v1 (1 gedekt scherm) niet meer dan enkele
minuten toe aan de totale CI-doorlooptijd; schaalt ongeveer lineair mee naarmate er schermen
bijkomen

**Constraints**: Geen extra kosten (Principle IV) — geen betaalde visual-testing-SaaS
(Percy/Chromatic e.d.), alles draait op de bestaande gratis GitHub Actions-tier; deterministische
rendering vereist (animaties/transities uitgeschakeld, wachten tot webfonts geladen zijn) om
valse positieven te voorkomen (FR-007, User Story 4); referentiebeelden zijn platform-specifiek
(Linux) om exact te matchen met wat CI genereert. **Let op fasering**: FR-007 is als geheel pas
volledig gedekt ná User Story 4 (Phase 6/T012) — de MVP (Setup + Foundational + User Story 1)
regelt alleen het vaste viewport/browser (T003), nog niet het uitschakelen van animaties/het
wachten op webfonts. De MVP is dus functioneel compleet voor regressiedetectie (User Story 1),
maar nog niet volledig FR-007-compliant op zichzelf.

**Scale/Scope**: v1 dekt het enige scherm dat vandaag daadwerkelijk bestaat
(`PlayerSetupScreen`, spelersbeheer) in zijn standaard/initiële staat. De opzet is expliciet
uitbreidbaar: nieuwe schermen (bijv. het opdrachten/virussen-scherm zodra feature
004-assignments-and-viruses is geïmplementeerd) krijgen een eigen `.spec.ts`-bestand zonder de
structuur te hoeven aanpassen

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notitie |
|---|---|---|
| I. Spec-Driven Development | Pass | Deze feature doorloopt de volledige flow (specify → clarify → plan → tasks → implement) op een eigen branch. |
| II. Test-First (TDD) | Pass | Playwright is sinds constitutie v1.2.0 expliciet gesanctioneerd in Principle II en in Technology Constraints' Testing-regel voor visuele-regressietests — geen self-justified deviation meer, dus geen Complexity Tracking-entry nodig. Vitest/RTL blijven de stack voor logica/component-tests; Playwright dekt uitsluitend pixel-niveau visuele regressie, een categorie die jsdom structureel niet kan testen. De testbestanden zelf (Playwright specs) zijn de "tests"; het rood→groen-ritme wordt aangetoond via `quickstart.md` (eerst zonder referentiebeeld falen/aanmaken, dan tegen een bewuste wijziging laten falen, dan laten slagen). |
| III. Simplicity & YAGNI | Pass | Eén tool (Playwright), één nieuwe map (`tests/visual/`), geen abstractielaag. Geen dekking van staten/schermen die nog niet bestaan. |
| IV. Zero-Cost, Client-Side Architecture | Pass | `@playwright/test` is gratis/open-source; referentiebeelden zijn bestanden in git, geen betaalde SaaS; CI-job draait op de bestaande gratis GitHub Actions-tier. |
| V. Quality Gates (CI + Review) | Pass | Nieuwe job in `.github/workflows/ci.yml`, draait op elke push/PR net als de bestaande lint-and-test-job; een falende visuele test blokkeert de merge net zoals een falende unit-test dat al doet. |

## Project Structure

### Documentation (this feature)

```text
specs/006-playwright-visual-ci/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
playwright.config.ts     # Nieuw: Playwright-config (testDir, webServer, viewport, project)

tests/
└── visual/
    ├── player-setup.spec.ts               # Nieuw: visuele test voor PlayerSetupScreen
    └── player-setup.spec.ts-snapshots/
        └── player-setup-chromium-linux.png  # Referentiebeeld (door Playwright gegenereerd/benoemd)

.github/workflows/
└── ci.yml                # Bestaand: krijgt een nieuwe job `visual-tests` naast `lint-and-test`

package.json              # Bestaand: nieuwe devDependency `@playwright/test` + script `test:visual`

src/                       # Bestaand, ongewijzigd door deze feature
```

**Structure Decision**: Eén bestaand Vite/React-project (Option 1: single project). Playwright
komt als losstaande testlaag naast de bestaande `src/`-broncode en Vitest-tests, met zijn eigen
config-bestand op repository-root-niveau (Playwright-conventie) en een eigen `tests/visual/`-map
zodat het duidelijk gescheiden blijft van de Vitest-unit/component-tests die colocated bij `src/`
staan.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Niet van toepassing — de Constitution Check hierboven heeft geen violations meer. Playwright
was aanvankelijk hier verantwoord als afwijking van de in Technology Constraints genoemde
teststack, maar is sinds constitutie v1.2.0 (zie `.specify/memory/constitution.md` Sync Impact
Report, getriggerd door `/speckit-analyze`-bevinding C1 op deze feature) expliciet gesanctioneerd
in Principle II en Technology Constraints zelf — dit is dus geen ongeautoriseerde toevoeging
meer die via deze tabel gerechtvaardigd hoeft te worden.
