# Feature Specification: Deployment naar Vercel

**Feature Branch**: `005-deployment`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "Deployment van de Badzwanzen app naar Vercel. De app (Vite + React static site) moet automatisch deployen vanaf de main branch op GitHub — dus bij elke push/merge naar main triggert Vercel een nieuwe productie-deployment. Gebruiker heeft nog geen Vercel account, dit moet als onderdeel van de feature opgezet worden (account aanmaken/koppelen aan GitHub repo, project instellingen, build configuratie)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatische productie-deployment bij merge naar main (Priority: P1)

Als projecteigenaar wil ik dat, zodra een pull request naar de `main` branch wordt gemerged
(of er rechtstreeks naar `main` wordt gepusht), de laatste versie van de app automatisch
gebouwd en live gezet wordt op een publiek bereikbare URL, zonder dat ik zelf handmatig iets
hoef te deployen.

**Why this priority**: Dit is de kern van de feature — zonder automatische deployment vanaf
`main` is er geen werkende "deployment pipeline", en heeft de rest van de feature geen nut.

**Independent Test**: Volledig te testen door een wijziging naar `main` te pushen (of een PR
te mergen) en te verifiëren dat binnen enkele minuten de live URL de nieuwe versie toont.

**Acceptance Scenarios**:

1. **Given** de Vercel-koppeling met de GitHub-repository staat correct ingesteld, **When**
   een commit naar `main` wordt gepusht (direct of via een gemergede PR), **Then** start
   Vercel automatisch een nieuwe productie-build en -deployment.
2. **Given** een productie-build is succesvol afgerond, **When** een gebruiker de live URL
   opent, **Then** ziet de gebruiker de laatste gepushte versie van de app.
3. **Given** een build van een push naar `main` faalt (bijvoorbeeld door een build-fout),
   **When** de build mislukt, **Then** blijft de vorige succesvolle productie-deployment
   live staan en wordt de gefaalde build niet gepubliceerd.

---

### User Story 2 - Vercel-account en project opzetten en koppelen aan GitHub (Priority: P1)

Als projecteigenaar die nog geen Vercel-account heeft, wil ik een account aanmaken en de
GitHub-repository van Badzwanzen koppelen aan een nieuw Vercel-project, zodat Vercel toegang
heeft om de repository te bouwen en te deployen.

**Why this priority**: Zonder account en koppeling kan er helemaal geen deployment
plaatsvinden — dit is een randvoorwaarde voor User Story 1.

**Independent Test**: Volledig te testen door in te loggen op Vercel, te controleren dat het
project zichtbaar is in het Vercel-dashboard, gekoppeld aan de juiste GitHub-repository, en
dat een eerste handmatige of automatische deployment succesvol afrondt.

**Acceptance Scenarios**:

1. **Given** de gebruiker heeft nog geen Vercel-account, **When** de gebruiker zich
   registreert (bij voorkeur via "inloggen met GitHub" voor directe koppeling), **Then**
   heeft de gebruiker toegang tot een Vercel-dashboard.
2. **Given** de gebruiker is ingelogd op Vercel, **When** de gebruiker een nieuw project
   aanmaakt en de Badzwanzen GitHub-repository selecteert, **Then** herkent Vercel het
   project als een Vite-project en stelt de juiste build- en outputinstellingen voor.
3. **Given** het Vercel-project is gekoppeld aan de repository, **When** de koppeling wordt
   opgeslagen, **Then** krijgt de repository automatisch de Vercel GitHub-integratie
   (deployment checks/status op commits en pull requests).

---

### User Story 3 - Preview-deployment per pull request (Priority: P2)

Als projecteigenaar wil ik dat elke pull request automatisch een eigen preview-omgeving
krijgt, zodat een wijziging bekeken kan worden vóórdat deze naar `main` wordt gemerged.

**Why this priority**: Dit is waardevol voor het reviewen van werk, maar niet strikt
noodzakelijk om de kernbehoefte (automatische productie-deployment vanaf `main`) te
vervullen — daarom lagere prioriteit dan User Story 1 en 2.

**Independent Test**: Volledig te testen door een pull request te openen en te verifiëren dat
Vercel een unieke preview-URL genereert en deze als check/comment op de PR toont.

**Acceptance Scenarios**:

1. **Given** een nieuwe pull request wordt geopend tegen `main`, **When** Vercel de
   preview-build afrondt, **Then** verschijnt er een unieke preview-URL gekoppeld aan die PR.
2. **Given** een pull request krijgt een nieuwe commit, **When** de preview-build opnieuw
   draait, **Then** wordt dezelfde preview-URL bijgewerkt met de nieuwste wijzigingen.

---

### Edge Cases

- Wat gebeurt er als de build faalt door een lint- of testfout? (De bestaande CI-workflow
  draait lint en tests al bij elke push/PR — de Vercel-build zelf voert alleen `npm run
  build` uit; een falende `tsc`/Vite-build moet de deployment blokkeren zonder de vorige
  live versie te vervangen.)
- Wat gebeurt er als er per ongeluk direct naar `main` gepusht wordt in plaats van via een
  PR? (Dit triggert alsnog automatisch een productie-deployment, zoals gespecificeerd.)
- Wat gebeurt er als de Vercel-omgeving of het GitHub-account (nog) geen betaald plan heeft?
  (Voor een klein hobbyproject zoals dit volstaat het gratis Vercel Hobby-plan; dit wordt als
  aanname vastgelegd.)
- Wat gebeurt er als iemand de repository lokaal kloont zonder Vercel-toegang? (De app moet
  onafhankelijk van Vercel lokaal te draaien blijven via de bestaande `npm run dev` /
  `npm run build` scripts.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Er MOET een Vercel-account bestaan dat gekoppeld is aan de GitHub-organisatie/
  het GitHub-account waaronder de Badzwanzen-repository staat.
- **FR-002**: Er MOET een Vercel-project zijn aangemaakt dat gekoppeld is aan de Badzwanzen
  GitHub-repository, met de `main` branch ingesteld als productie-branch.
- **FR-003**: Het systeem MOET bij elke push of gemergede pull request naar `main`
  automatisch een nieuwe productie-build starten en, bij succes, publiceren op de live
  productie-URL.
- **FR-004**: Het systeem MOET de build uitvoeren met het bestaande build-commando van het
  project (`npm run build`) en de gebouwde statische bestanden serveren.
- **FR-005**: Het systeem MOET bij een falende build de vorige succesvolle productie-
  deployment ongewijzigd live laten staan (geen gedeeltelijke of kapotte deployment
  publiceren).
- **FR-006**: Het systeem MOET voor elke pull request een aparte preview-deployment met een
  unieke URL genereren, zonder de productie-deployment te beïnvloeden.
- **FR-007**: De deploymentstatus (succes/mislukt, met link naar logs) MOET zichtbaar zijn
  vanuit GitHub (via commit status of PR-check), zodat een falende deployment opvalt zonder
  dat de gebruiker apart moet inloggen op Vercel.
- **FR-008**: De productie-URL MOET publiek toegankelijk zijn zonder login of wachtwoord.
- **FR-009**: Configuratie die nodig is om het project reproduceerbaar te deployen (bijv.
  build-/outputinstellingen) MOET, waar mogelijk, als bestand in de repository worden
  vastgelegd in plaats van uitsluitend als losse instelling in het Vercel-dashboard.

### Key Entities

- **Vercel-project**: De koppeling tussen de GitHub-repository en Vercel; bepaalt
  build-instellingen, environment en welke branch als productie geldt.
- **Deployment**: Eén gebouwde versie van de app, hetzij een productie-deployment (vanaf
  `main`) hetzij een preview-deployment (vanaf een pull request), met een eigen URL en status
  (in aanbouw / geslaagd / mislukt).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Na het mergen van een pull request naar `main` is de wijziging binnen 5 minuten
  zichtbaar op de live productie-URL, zonder handmatige actie.
- **SC-002**: 100% van de commits/PR's naar `main` resulteert in een zichtbare
  deployment-status in GitHub (geslaagd of mislukt), zonder dat iemand apart bij Vercel hoeft
  te kijken.
- **SC-003**: Een falende build laat de eerder werkende productieversie ononderbroken
  bereikbaar, gemeten over minstens 3 opeenvolgende deployments waarvan er één opzettelijk
  faalt.
- **SC-004**: Een nieuwe bijdrager kan, uitsluitend op basis van de vastgelegde
  projectdocumentatie/configuratie, zonder extra mondelinge uitleg begrijpen hoe een
  deployment tot stand komt.

## Assumptions

- De gebruiker heeft (of maakt) een GitHub-account dat toegang heeft tot de Badzwanzen-
  repository; dit wordt gebruikt om in te loggen bij Vercel.
- Het gratis Vercel "Hobby"-plan is voldoende voor dit project (geen custom domain-,
  team- of enterprise-vereisten in scope van deze feature).
- Er is geen backend/server-side rendering nodig — de app is een volledig statische
  build (Vite + React), dus geen serverless functions, database- of environment-
  secrets-configuratie is vereist voor deze feature.
- Een custom domein is geen harde eis voor deze feature; de door Vercel toegekende
  `*.vercel.app`-URL is in eerste instantie voldoende als productie-URL.
- De bestaande GitHub Actions CI-workflow (lint + test) blijft naast Vercel's eigen build
  bestaan en wordt niet vervangen door deze feature.
