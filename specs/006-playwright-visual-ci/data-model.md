# Data Model: Playwright visuele UI-tests in CI

Deze feature heeft geen applicatie-datamodel (geen database, geen nieuwe entiteiten in de app
zelf — Principle IV blijft ongewijzigd). De "entiteiten" hieronder zijn bestand-gebaseerde
testartefacten uit spec.md § Key Entities, hier uitgewerkt als concrete bestandsvormen.

## Visuele testcase

Een Playwright-testbestand onder `tests/visual/`, één per gedekt scherm/staat.

| Veld | Beschrijving |
|---|---|
| Bestandsnaam | `tests/visual/<scherm-slug>.spec.ts`, bijv. `player-setup.spec.ts` |
| Scherm | Welk React-component/route wordt gerenderd (v1: `PlayerSetupScreen`) |
| Staat | Welke staat van het scherm (v1: uitsluitend de standaard/initiële staat, zie
  Clarifications in spec.md) |
| Viewport | Vast: 390×844 (mobiel), zie research.md § 5 |
| Assertie | `expect(page).toHaveScreenshot()` tegen het bijbehorende referentiebeeld |

**Levenscyclus**: aangemaakt zodra een scherm wordt toegevoegd aan de dekking; gewijzigd wanneer
een nieuwe staat van hetzelfde scherm dekking krijgt; nooit stilzwijgend verwijderd zonder ook
het bijbehorende referentiebeeld te verwijderen.

## Referentiebeeld (baseline-screenshot)

Een PNG-bestand, automatisch aangemaakt/benoemd door Playwright.

| Veld | Beschrijving |
|---|---|
| Locatie | `tests/visual/<scherm-slug>.spec.ts-snapshots/<naam>-chromium-<platform>.png` |
| Platform-suffix | Door Playwright zelf toegevoegd (bijv. `-linux` voor CI, `-darwin` voor
  lokaal macOS) — zie research.md § 3 voor waarom dit bewust platform-specifiek is |
| Bron van waarheid | De `-linux`-variant is wat CI daadwerkelijk vergelijkt; dat is de enige
  variant die in de repository gecommit hoeft te worden |
| Bijwerken | `npx playwright test --update-snapshots` (bij voorkeur via het Docker-image uit
  research.md § 3), gevolgd door een normale git-commit van het gewijzigde PNG-bestand |

**Levenscyclus**: ontstaat bij de eerste testrun zonder bestaand referentiebeeld (Playwright
maakt 'm dan aan en laat de test slagen); wordt bewust vervangen via `--update-snapshots` wanneer
een visuele wijziging gewenst is (User Story 2); wijzigt nooit stilzwijgend als bijeffect van een
gewone testrun.

## Diff-rapport

Geen apart bestand dat deze feature zelf ontwerpt — het is Playwright's ingebouwde HTML-rapport
(`playwright-report/`), dat bij een falende visuele testcase automatisch de referentie-, de
daadwerkelijke en de diff-afbeelding naast elkaar toont.

| Veld | Beschrijving |
|---|---|
| Locatie (CI) | Geüpload als GitHub Actions-artefact door de `visual-tests`-job wanneer die
  faalt (zie research.md § 6) |
| Locatie (lokaal) | `playwright-report/index.html`, lokaal te openen na een falende testrun |
| Inhoud | Per falende testcase: referentiebeeld, daadwerkelijk screenshot, pixel-diff-overlay |

Geen state transitions van toepassing — het rapport is een resultaat van één testrun, geen
persistente entiteit.
