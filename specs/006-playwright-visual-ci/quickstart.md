# Quickstart: Playwright visuele UI-tests in CI

Doel: bewijzen dat de visuele testsuite lokaal en in CI daadwerkelijk regressies opvangt (rood
→ groen), en dat een bewuste UI-wijziging op een voorspelbare manier goedgekeurd kan worden.
Zie [data-model.md](./data-model.md) voor de betekenis van elk bestand en
[contracts/visual-test-conventions.md](./contracts/visual-test-conventions.md) voor de
naamgevings- en CI-afspraken.

## Vereisten

- Node 22 (zoals `.github/workflows/ci.yml`)
- Docker (voor het genereren van Linux-consistente referentiebeelden vanaf macOS — zie
  research.md § 3)

## 1. Installeren

```bash
npm install
npx playwright install --with-deps chromium
```

## 2. Eerste referentiebeeld genereren (er bestaat er nog geen)

**Belangrijk**: `<versie>` MUST exact overeenkomen met de `@playwright/test`-versie die in
`package.json` staat gepind (bijv. `"@playwright/test": "1.48.2"` → tag `v1.48.2-jammy`). Dit is
een harde eis van Playwright zelf, niet optioneel: browser-builds tussen versies verschillen net
genoeg om lettertype-/pixelrendering te laten afwijken. Lees de versie op met:

```bash
node -p "require('./package.json').devDependencies['@playwright/test']"
```

```bash
docker run --rm -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v<versie>-jammy \
  npx playwright test --update-snapshots
```

**Verwacht resultaat**: de test slaagt (Playwright maakt het ontbrekende referentiebeeld aan) en
`tests/visual/player-setup.spec.ts-snapshots/player-setup-chromium-linux.png` verschijnt als
nieuw, ongetrackt bestand. Commit dit bestand.

**Alternatief zonder Docker**: als Docker niet beschikbaar is (bijv. in een sandboxed
dev-omgeving), kun je het echte Linux-screenshot ook uit een CI-run halen — dit is hoe de
initiële baseline van deze feature zelf tot stand kwam:

1. Push de branch/open een PR zonder referentiebeeld; de `visual-tests`-job faalt en uploadt
   `playwright-report` als artefact (zie § 5).
2. `gh run download <run-id> -n playwright-report -D /tmp/report` om het artefact te downloaden.
3. Het rapport bevat óf direct een `data/<hash>.png`-bestand, óf een self-contained
   `index.html` met een `<template id="playwrightReportBase64">data:application/zip;base64,...`
   — in dat laatste geval decodeer je die base64-string naar een `.zip`, pak je die uit, en vind
   je de screenshots (en attachment-metadata in `report.json`) daarin.
4. Kopieer de juiste `-actual.png` naar
   `tests/visual/player-setup.spec.ts-snapshots/player-setup-chromium-linux.png` en commit.

Dit is een eenmalige bootstrap-methode, geen vervanging van het Docker-commando als
standaardproces — de CI-job commit zelf nooit iets terug (zie research.md § 3).

## 3. Rood aantonen: een bewuste visuele wijziging simuleren

```bash
# Tijdelijk een zichtbare stylingwijziging maken, bv. een andere achtergrondkleur
# in src/features/players/PlayerSetupScreen.tsx
npx playwright test
```

**Verwacht resultaat**: de test faalt met een pixel-diff; `playwright-report/index.html` toont
referentie-, daadwerkelijk- en diff-afbeelding naast elkaar. Draai daarna
`git checkout -- src/features/players/PlayerSetupScreen.tsx` om de tijdelijke wijziging terug te
draaien.

## 4. Groen aantonen: referentiebeeld bewust bijwerken

Zelfde `<versie>`-eis als in stap 2 — exact gelijk aan `@playwright/test` in `package.json`.

```bash
docker run --rm -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v<versie>-jammy \
  npx playwright test --update-snapshots
npx playwright test
```

**Verwacht resultaat**: eerste run werkt het referentiebeeld bij; tweede run slaagt weer.

## 5. CI-integratie verifiëren

```bash
git push origin 006-playwright-visual-ci
```

Open de pull request in GitHub en verifieer:
- De `visual-tests`-job draait naast `lint-and-test`.
- Zonder wijzigingen aan `src/features/players/` slaagt de job.
- Bij een falende run staat het geüploade Playwright-rapport als artefact bij de Actions-run.

## 6. Stabiliteit aantonen (User Story 4 / SC-004)

```bash
npx playwright test
npx playwright test
```

**Verwacht resultaat**: beide runs geven hetzelfde resultaat (slagen), zonder onverklaarde diffs
— geen flakiness door bijvoorbeeld animaties of niet-geladen webfonts.
