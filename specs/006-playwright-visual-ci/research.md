# Research: Playwright visuele UI-tests in CI

Alle onderwerpen uit de Technical Context zijn hieronder opgelost; er blijven geen
`NEEDS CLARIFICATION`-markers over.

## 1. Tool voor visuele regressietests

**Decision**: `@playwright/test` met zijn ingebouwde `expect(page).toHaveScreenshot()`.

**Rationale**: Slaat referentiebeelden op als gewone PNG-bestanden in de repository — sluit
direct aan bij Assumption "Referentiebeelden worden als bestanden in de repository opgeslagen"
uit spec.md en bij Principle IV (zero-cost, geen betaalde SaaS). Genereert bij een falende test
automatisch een diff-afbeelding (verwacht/daadwerkelijk/diff naast elkaar) en een HTML-rapport —
dekt FR-004 zonder extra werk. Bijwerken van een referentiebeeld is één CLI-vlag
(`--update-snapshots`). Playwright is al de facto standaard voor dit soort tests en heeft geen
losse browser-installatiestap nodig buiten `npx playwright install`.

**Alternatives considered**:
- **Percy / Chromatic** (SaaS visual-testing-diensten): bieden een mooiere reviewer-UI, maar zijn
  betaalde diensten (of sterk gelimiteerde gratis tiers) — in strijd met Principle IV.
- **BackstopJS**: vergelijkbare aanpak (screenshots + pixelmatch), maar voegt een aparte
  tool/config-taal toe zonder voordeel t.o.v. Playwright, dat toch al de facto standaard is voor
  browserautomatisering in dit soort projecten; geen reden om twee tools te onderhouden.
- **jest-image-snapshot in Vitest**: zou de bestaande teststack hergebruiken, maar Vitest draait
  op jsdom, dat niet echt rendert — er is geen pixelinhoud om te vergelijken. Vereist alsnog een
  losse browser-rendering-stap (bijv. via Playwright als headless-browser-driver), dus dit voegt
  complexiteit toe zonder de nieuwe dependency te vermijden.

## 2. De app bedienen tijdens tests

**Decision**: Playwright's `webServer`-config start `npm run build && npm run preview` (Vite's
ingebouwde preview-server) vóór de testrun, zowel lokaal als in CI.

**Rationale**: Test tegen een productie-achtige build (geminificeerd, zonder dev-only overhead
zoals React Fast Refresh-overlays) — sluit beter aan bij wat spelers/reviewers echt zien dan de
dev-server. Playwright's `webServer`-optie handelt start/wachten-tot-gereed/opruimen automatisch
af, dus geen losse scripting nodig.

**Alternatives considered**:
- **`npm run dev` (Vite dev-server)**: sneller op te starten, maar kan dev-only artefacten
  renderen die niet in de productie-build zitten, wat valse regressies zou kunnen opleveren.

## 3. Platform-consistente referentiebeelden

**Decision**: Referentiebeelden worden gegenereerd/bijgewerkt via Playwright's officiële
Docker-image (`mcr.microsoft.com/playwright:v<versie>-jammy`), zodat lettertype-rendering exact
overeenkomt met de Linux `ubuntu-latest`-runner die CI gebruikt. Playwright hangt automatisch een
platform-suffix aan de bestandsnaam (bijv. `player-setup-chromium-linux.png`), dus lokale
Darwin-screenshots (macOS) overschrijven de CI-relevante Linux-baseline niet per ongeluk.

**Rationale**: Lettertype-anti-aliasing verschilt tussen macOS en Linux, wat bij losse
pixelvergelijking tot valse positieven leidt — precies het probleem dat FR-007/User Story 4
willen voorkomen. Playwright's ingebouwde platform-suffix-gedrag lost het "welke baseline geldt
waar"-vraagstuk al automatisch op; de Docker-stap is alleen nodig om als ontwikkelaar op macOS
zelf zo'n Linux-baseline te kunnen *genereren*.

**Alternatives considered**:
- **Baselines alleen op macOS genereren en negeren dat CI Linux draait**: leidt tot permanent
  falende CI-runs door platformverschillen, ondermijnt SC-004 direct.
- **Baselines altijd via een CI-workflow laten committen ("commit-back")**: voegt een extra
  geautomatiseerde git-commit-stap toe die schrijfrechten in CI vereist — meer bewegende delen
  dan nodig voor een project met twee ontwikkelaars; een lokale Docker-run is eenvoudiger en
  blijft onder directe controle van de ontwikkelaar (past bij Principle III).

## 4. Determinisme (voorkomen van flaky diffs)

**Decision**: `playwright.config.ts` schakelt CSS-animaties/transities uit
(`expect().toHaveScreenshot({ animations: 'disabled' })`, Playwright's ingebouwde optie) en elke
test wacht op `document.fonts.ready` vóór het maken van de screenshot.

**Rationale**: Dit zijn de twee meest voorkomende oorzaken van flaky visuele tests (een
mid-transitie frame, of een screenshot vóórdat het webfont geladen is) en Playwright heeft er
ingebouwde ondersteuning voor — geen custom code nodig.

**Alternatives considered**: Een vaste `waitForTimeout(...)` vóór elke screenshot — brozer en
trager dan wachten op een concreet, betekenisvol signaal (`animations: 'disabled'` + fonts
ready).

## 5. Viewport en browser

**Decision**: Vast mobiel viewport 390×844, alleen Chromium, voor v1 (bevestigd via
`/speckit-clarify`, zie spec.md § Clarifications).

**Rationale**: Sluit aan bij het mobile-first ontwerp (DESIGN.md) en het daadwerkelijke
gebruiksscenario (één telefoon die wordt doorgegeven tijdens het spel). Eén browser houdt de
testmatrix klein (Principle III); uitbreiding naar Firefox/WebKit of extra viewports kan later
per scherm worden toegevoegd zonder structurele wijziging.

**Alternatives considered**: Meerdere viewports/browsers vanaf v1 — verworpen, verdubbelt het
aantal referentiebeelden zonder dat er nu al een concrete behoefte aan is (YAGNI).

## 6. Plek van de visuele-test-stap in CI

**Decision**: Een nieuwe, aparte job `visual-tests` in `.github/workflows/ci.yml`, naast de
bestaande `lint-and-test`-job, met zijn eigen `npx playwright install --with-deps chromium`-stap
en een `actions/upload-artifact`-stap die het Playwright HTML-rapport (incl. diff-afbeeldingen)
uploadt wanneer de job faalt.

**Rationale**: Een aparte job maakt in de GitHub-PR-UI direct zichtbaar of een falende CI-run een
visuele regressie is of een lint/unit-testfout (FR-008), zonder dat iemand de logs van één grote
job hoeft door te spitten. Het geüploade rapport is de "voor mensen begrijpelijke diff" uit
FR-004, bereikbaar vanaf de Actions-run zonder dat de reviewer de tests lokaal hoeft te draaien.

**Alternatives considered**: Visuele tests als extra stap in de bestaande `lint-and-test`-job —
verworpen omdat een falende stap dan minder direct duidelijk maakt welk van de twee heel
verschillende soorten fouten (styling vs. logica/lint) er speelt.
