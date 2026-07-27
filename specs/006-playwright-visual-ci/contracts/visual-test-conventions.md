# Contract: visuele-testconventies

Dit is de afspraak waar toekomstige features zich aan houden wanneer ze een nieuw scherm of een
nieuwe staat aan de visuele testsuite toevoegen (FR-006, User Story 3 — "uitbreidbaar zijn
naarmate er nieuwe schermen bijkomen").

## Eén testbestand per scherm

- Nieuw scherm → nieuw bestand `tests/visual/<scherm-slug>.spec.ts`.
- Nieuwe, relevante staat van een al gedekt scherm (bijv. "gevuld" i.p.v. alleen "leeg") → een
  extra test binnen datzelfde bestand, niet een heel nieuw bestand.
- `<scherm-slug>` is een korte, leesbare kebab-case naam die het scherm identificeert (bijv.
  `player-setup`), niet de React-componentnaam letterlijk.

## Referentiebeelden zijn platform-specifiek (Linux telt)

- Playwright hangt automatisch een platform-suffix aan elk referentiebeeld
  (`-linux`, `-darwin`, …). **Alleen de `-linux`-variant** is wat de CI-job vergelijkt en dus
  wat gecommit moet worden.
- Genereer/werk referentiebeelden bij via Playwright's officiële Docker-image
  (`mcr.microsoft.com/playwright:v<versie>-jammy`), niet door lokaal op macOS
  `--update-snapshots` te draaien — dat produceert een `-darwin`-bestand dat CI negeert.
- De Docker-image-tag `<versie>` MUST exact overeenkomen met de `@playwright/test`-versie in
  `package.json` (harde Playwright-compatibiliteitseis) — een mismatch geeft net genoeg
  rendeverschil om dezelfde platform-flakiness te introduceren die deze aanpak juist moet
  voorkomen.
- Zie `quickstart.md` voor het exacte commando.

## CI-job-contract

- Job-naam: `visual-tests`, in `.github/workflows/ci.yml`, naast (niet binnen) de bestaande
  `lint-and-test`-job — zodat een visuele regressie in de GitHub PR-UI direct te onderscheiden is
  van een lint/unit-testfout (FR-008).
- Trigger: dezelfde als de rest van de workflow — elke push naar `main` en elke pull request.
- Bij falen: het Playwright HTML-rapport (`playwright-report/`) wordt geüpload als
  GitHub Actions-artefact, zodat een reviewer de diff kan bekijken zonder lokaal te hoeven
  reproduceren (FR-004).
- Een falende `visual-tests`-job telt als een falende CI-run in de zin van Constitution
  Principle V ("merging is blocked while CI is red") — geen apart, losser beleid voor visuele
  tests dan voor de rest van CI.

## Bijwerken van een referentiebeeld (bewuste UI-wijziging)

1. Bekijk het Playwright-rapport (lokaal of het CI-artefact) om te bevestigen dat het verschil
   gewenst is.
2. Genereer het nieuwe referentiebeeld via het Docker-commando uit `quickstart.md`.
3. Commit het gewijzigde `-linux.png`-bestand als onderdeel van dezelfde pull request als de
   UI-wijziging zelf — geen los, ongerelateerd commit/PR nodig.
