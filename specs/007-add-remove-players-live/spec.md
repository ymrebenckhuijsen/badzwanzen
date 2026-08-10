# Feature Specification: Spelers tijdens het lopende spel toevoegen en verwijderen

**Feature Branch**: `007-add-remove-players-live`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Spelers tijdens het lopende spel toevoegen en verwijderen"

## Clarifications

### Session 2026-07-27

- Q: Deze feature veronderstelt een "lopende spelsessie" (beurtrotatie, score) die nog niet
  gebouwd is (feature 004 opdrachten-en-virussen, nog geen tasks.md). Moet feature 007 wachten
  tot feature 004 geïmplementeerd is, of moet 007 zijn eigen minimale beurt/score-model
  bevatten dat later kan integreren met feature 004? → A: Feature 007 bouwt voort op feature
  004's beurtrotatie-model (optie A: wachten/hergebruiken, geen eigen tussenmodel). Scoring
  wordt echter uit feature 004 gehaald en verhuist naar een aparte, nog te specificeren
  scoring-feature — feature 007 hergebruikt dus alleen de beurtrotatie van feature 004, niet
  een scoremodel, en hoeft niet te wachten op de scoring-feature.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Een speler toevoegen tijdens het spel (Priority: P1)

Als gebruiker die al een spelsessie gestart heeft, druk ik op een "+" knop terwijl het spel
loopt, voer ik de naam van een laatkomer in, en zie ik die speler daarna meedraaien in de
beurtrotatie zonder dat het lopende spel opnieuw hoeft te starten.

**Why this priority**: Dit is de belangrijkste reden om deze feature te bouwen — bij een
groepsspel als dit komen mensen vaak later binnen, en zonder deze mogelijkheid moet de hele
sessie opnieuw gestart worden, wat de voortgang (beurtrotatie) van de zittende spelers zou
wissen.

**Independent Test**: Volledig te testen door een spel te starten met 2+ spelers, tijdens het
spel op "+" te drukken, een nieuwe naam in te voeren en te bevestigen, en te verifiëren dat de
nieuwe speler in de actieve spelerslijst verschijnt en op enig moment aan de beurt komt.

**Acceptance Scenarios**:

1. **Given** een lopend spel met 3 spelers, **When** de gebruiker op "+" drukt, een nieuwe
   naam invoert en bevestigt, **Then** verschijnt de nieuwe speler in de actieve spelerslijst
   zonder dat het spel of de voortgang van de andere spelers gereset wordt.
2. **Given** een lopend spel, **When** de gebruiker een naam invoert die al in de actieve
   lijst staat, **Then** wordt de speler niet toegevoegd en krijgt de gebruiker dezelfde
   duidelijke melding als bij het vooraf toevoegen van spelers.
3. **Given** een lopend spel met al 20 spelers, **When** de gebruiker probeert een 21e speler
   toe te voegen, **Then** wordt de speler niet toegevoegd en krijgt de gebruiker een melding
   dat het maximum is bereikt.
4. **Given** een lopend spel, **When** een nieuwe speler wordt toegevoegd, **Then** start deze
   speler met dezelfde beginstatus in de beurtrotatie als waarmee spelers bij de start van het
   spel beginnen.

---

### User Story 2 - Een speler verwijderen tijdens het spel (Priority: P2)

Als gebruiker die een spelsessie begeleidt, verwijder ik een speler die vroegtijdig stopt
(bijvoorbeeld naar huis gaat) uit de lopende sessie, zodat deze speler niet meer aan de beurt
komt en de rest van de groep gewoon door kan spelen.

**Why this priority**: Bouwt voort op de kernwaarde van deze feature (de spelerslijst
levend houden tijdens het spel), maar is onafhankelijk waarneembaar en testbaar los van het
toevoegen van spelers.

**Independent Test**: Te testen door een spel te starten met 3+ spelers, één speler te
verwijderen tijdens het spel, en te verifiëren dat die speler niet meer in de beurtrotatie
voorkomt terwijl de overige spelers gewoon doorspelen.

**Acceptance Scenarios**:

1. **Given** een lopend spel met 4 spelers, **When** de gebruiker een speler verwijdert en dit
   bevestigt, **Then** verdwijnt deze speler uit de actieve spelerslijst en komt hij/zij niet
   meer aan de beurt voor de rest van de sessie.
2. **Given** een lopend spel, **When** de gebruiker een verwijderactie start, **Then** vraagt
   het systeem eerst om bevestiging voordat de speler daadwerkelijk verwijderd wordt.
3. **Given** het is op dit moment de beurt van de speler die verwijderd wordt, **When** de
   verwijdering bevestigd wordt, **Then** gaat het spel automatisch door naar de eerstvolgende
   overgebleven speler zonder verdere actie van de gebruiker.

---

### User Story 3 - De actieve spelerslijst blijven zien tijdens het spel (Priority: P3)

Als gebruiker die een spelsessie begeleidt, wil ik op elk moment tijdens het spel kunnen zien
wie er op dat moment actief meespeelt, zodat wijzigingen (toevoegen/verwijderen) direct
zichtbaar en controleerbaar zijn.

**Why this priority**: Ondersteunt User Story 1 en 2 (zonder zichtbare, actuele lijst is niet
te verifiëren of een toevoeging/verwijdering gelukt is), maar is op zichzelf een eenvoudig
waarneembaar en testbaar onderdeel.

**Independent Test**: Te testen door tijdens een lopend spel spelers toe te voegen en te
verwijderen, en te verifiëren dat de zichtbare lijst na elke wijziging direct de actuele
situatie weergeeft.

**Acceptance Scenarios**:

1. **Given** een lopend spel, **When** een speler wordt toegevoegd of verwijderd, **Then**
   toont de zichtbare spelerslijst direct de bijgewerkte samenstelling, zonder dat de pagina
   herladen hoeft te worden.

---

### Edge Cases

- Wat gebeurt er als de gebruiker een speler probeert te verwijderen terwijl er nog maar het
  minimum aantal spelers over is om het spel te kunnen voortzetten?
- Wat gebeurt er als de gebruiker alle spelers op één na verwijdert tijdens het spel?
- Wat gebeurt er bij een paginaherlading (refresh) midden in het spel, nadat spelers zijn
  toegevoegd of verwijderd? (Vergelijkbaar met de bestaande opslag van de spelerslijst vóór
  het spel.)
- Wat gebeurt er als de gebruiker een nieuwe naam invoert die exact overeenkomt met de naam
  van een eerder tijdens dit spel verwijderde speler?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Systeem MOET het toevoegen van een speler toestaan terwijl een spel al bezig is,
  via dezelfde "+"-invoerflow als vóór de start van het spel.
- **FR-002**: Systeem MOET een tijdens het spel ingevoerde spelersnaam op dezelfde manier
  valideren als vóór het spel (niet leeg, uniek binnen de actieve lijst, maximum van 20
  spelers in totaal).
- **FR-003**: Systeem MOET een nieuw toegevoegde speler invoegen aan het eind van de huidige
  beurtrotatie, zodat deze pas aan de beurt komt nadat alle op dat moment actieve spelers hun
  huidige ronde hebben afgerond.
- **FR-004**: Een nieuw toegevoegde speler MOET starten met dezelfde beginstatus in de
  beurtrotatie waarmee spelers bij de start van het spel beginnen; de nieuwe speler wordt niet
  met terugwerkende kracht overgeslagen of bevoordeeld voor beurten die al gespeeld zijn vóór
  toevoeging. (Scoretoekenning is geen onderdeel van deze specificatie — zie Assumptions.)
- **FR-005**: Systeem MOET het verwijderen van een speler toestaan terwijl een spel bezig is.
- **FR-006**: Systeem MOET, zodra een speler verwijderd wordt, deze onmiddellijk uit de
  beurtrotatie halen zodat deze speler niet meer aan de beurt wordt geroepen.
- **FR-007**: Systeem MOET, als de te verwijderen speler op het moment van verwijderen aan de
  beurt is, automatisch doorgaan naar de eerstvolgende overgebleven speler zonder aanvullende
  actie van de gebruiker.
- **FR-008**: Systeem MOET vóór het daadwerkelijk verwijderen van een speler een expliciete
  bevestiging van de gebruiker vragen, om onbedoeld verwijderen tijdens het spelen te
  voorkomen.
- **FR-009**: Systeem MOET verhinderen dat het aantal actieve spelers door verwijdering onder
  de 2 zakt; zodra nog maar 2 spelers over zijn, wordt de verwijderoptie voor die laatste 2
  spelers uitgeschakeld (het spel heeft minimaal 2 spelers nodig om door te kunnen gaan).
- **FR-010**: De deelnamegeschiedenis van een verwijderde speler (welke beurten gespeeld zijn
  vóór verwijdering) MOET behouden blijven en gemarkeerd worden als "vroegtijdig gestopt", in
  plaats van volledig gewist te worden. (Hoe dit samen met score wordt getoond in een
  eindresultaat is onderdeel van de aparte scoring-feature, buiten de scope van deze
  specificatie.)
- **FR-011**: Systeem MOET de actieve spelerslijst tijdens het spel direct bijwerken en
  zichtbaar houden, zodat de gebruiker op elk moment kan zien wie er op dat moment meespeelt.
- **FR-012**: Wijzigingen aan de spelerslijst tijdens een lopend spel MOETEN persistent
  opgeslagen worden (bijvoorbeeld via dezelfde lokale opslag als vóór het spel), zodat een
  paginaherlading tijdens het spel de wijzigingen niet ongedaan maakt.
- **FR-013**: Systeem MOET toestaan dat een nieuwe speler dezelfde naam gebruikt als een eerder
  tijdens dezelfde sessie verwijderde speler, aangezien de verwijderde naam niet meer in de
  actieve lijst voorkomt.

### Key Entities

- **Speler (Player)**: bestaande entiteit (naam, volgorde) uit de spelersopzet-feature,
  binnen deze feature uitgebreid met een status tijdens het lopende spel: actief (speelt mee
  en komt aan de beurt) of verwijderd/vroegtijdig gestopt (telt niet meer mee voor de
  beurtrotatie, maar de deelnamegeschiedenis blijft bewaard).
- **Lopende spelsessie (Game Session)**: de staat van het bezig zijnde spel (huidige beurt,
  beurtrotatie) waarin deze feature ingrijpt; dit is de spelkern die in de feature voor
  opdrachten en virussen wordt gespecificeerd en waarvan deze feature het bestaan als
  vertrekpunt neemt. Score maakt geen deel uit van deze spelsessie-entiteit — dat wordt
  behandeld in een aparte, nog te specificeren scoring-feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Een gebruiker kan een laatkomer binnen 15 seconden toevoegen aan een lopend
  spel, zonder de sessie opnieuw te hoeven starten.
- **SC-002**: Een gebruiker kan een speler binnen 10 seconden verwijderen uit een lopend spel,
  inclusief de bevestigingsstap, zonder dat de beurt van overige spelers verstoord raakt.
- **SC-003**: 100% van de beurten na een verwijdering slaat de verwijderde speler over — een
  verwijderde speler wordt binnen dezelfde sessie nooit meer voor een beurt opgeroepen.
- **SC-004**: Gebruikers hoeven een spelsessie niet meer opnieuw te starten wanneer de
  samenstelling van de groep tijdens het spel verandert (kwalitatief, te toetsen via
  gebruikersfeedback).

## Assumptions

- Deze feature bouwt voort op het bestaan van een "lopend spel" met een beurtrotatie, zoals
  gespecificeerd in de feature voor opdrachten en virussen; die spelkern is nog niet
  geïmplementeerd op het moment van schrijven, maar wordt hier als vertrekpunt aangenomen
  (feature 007 wordt gepland/gebouwd op basis van feature 004's beurtrotatie-model, niet
  ernaast met een eigen tussenmodel).
- Score maakt geen deel meer uit van feature 004 en valt buiten de scope van deze
  specificatie; scoring wordt behandeld in een aparte, nog te specificeren scoring-feature
  waarop deze feature niet hoeft te wachten.
- Validatieregels voor het toevoegen van een speler (niet-leeg, uniek, maximum 20) zijn
  hergebruikt van de bestaande spelersopzet-feature en gelden identiek tijdens het spel.
- Er is één gedeeld apparaat (telefoon/laptop) dat rondgaat; gelijktijdige synchronisatie
  tussen meerdere apparaten is geen onderdeel van deze feature (conform de architectuurregel
  voor een volledig client-side, gratis te hosten applicatie).
- "Verwijderen" tijdens het spel betekent uitsluiten van verdere beurten voor de rest van de
  sessie, niet het met terugwerkende kracht wissen van de reeds gespeelde beurten van die
  speler.
