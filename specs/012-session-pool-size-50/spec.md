# Feature Specification: Kleinere sessie-kaartpoel (50-55 kaarten)

**Feature Branch**: `012-session-pool-size-50`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "maak dat nu de maximum aantal kaarten tussen 50-55 kaarten zit"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Een kortere, voorspelbaardere spelsessie (Priority: P1)

Als groep die een spelsessie speelt, wil ik dat een sessie een kleiner en voorspelbaarder aantal
kaarten bevat dan nu, zodat een volledige sessie (van start tot uitgeputte trekstapel) beter past
binnen de tijd die de groep wil spelen.

**Why this priority**: Dit is de kern van de feature — het aanpassen van de bandbreedte waarbinnen
het aantal kaarten in de trekstapel van een sessie willekeurig gekozen wordt, van de huidige 60-80
naar 50-55.

**Independent Test**: Volledig te testen door meerdere nieuwe spelsessies op te zetten vanuit een
geldige kaartenset en voor elke sessie te tellen hoeveel kaarten in de trekstapel zitten;
verifiëren dat dit aantal steeds tussen 50 en 55 (inclusief) ligt.

**Acceptance Scenarios**:

1. **Given** een geldige kaartenset, **When** een nieuwe spelsessie start, **Then** wordt een
   trekstapel opgebouwd met een willekeurig aantal kaarten tussen 50 en 55 (inclusief).
2. **Given** de trekstapel die voor een sessie wordt opgebouwd, **When** de willekeurige selectie
   gemaakt wordt, **Then** blijft de bestaande garantie van minimaal 4 virus-kaarten in de
   trekstapel behouden, aangevuld met niet-virus-kaarten tot het gekozen totaal (50-55).
3. **Given** twee verschillende spelsessies gestart vanuit dezelfde kaartenset, **When** hun
   trekstapels vergeleken worden, **Then** mogen de aantallen en/of de precieze samenstelling
   van elkaar verschillen, zolang beide binnen de 50-55 bandbreedte vallen.
4. **Given** een sessie waarvan de trekstapel is opgebouwd volgens de nieuwe bandbreedte,
   **When** de groep kaarten blijft trekken tot de stapel leeg is, **Then** eindigt de sessie na
   het trekken van maximaal 55 en minimaal 50 kaarten, zonder herschudden om door te gaan
   (ongewijzigd bestaand gedrag).

---

### Edge Cases

- Wat gebeurt er als de onderliggende kaartenset minder dan 55 kaarten bevat? Dit kan niet
  voorkomen zolang de bestaande minimale geldigheidseis voor kaartensets (zie Assumptions)
  ongewijzigd blijft, want die eis ligt ruim boven 55.
- Wat gebeurt er met de bestaande garantie van minimaal 4 virus-kaarten wanneer de bovengrens van
  de trekstapel kleiner wordt? Die garantie blijft ongewijzigd van kracht; 4 virus-kaarten passen
  ruimschoots binnen een trekstapel van 50-55 kaarten.
- Wat gebeurt er met een sessie die al bezig is op het moment dat deze wijziging wordt
  doorgevoerd? Niet van toepassing — de trekstapel wordt telkens opnieuw opgebouwd bij het starten
  van een sessie en niet tussen sessies bewaard, dus er is geen migratie van bestaande, lopende
  trekstapels nodig.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Systeem MOET bij het starten van een nieuwe spelsessie een trekstapel opbouwen met
  een willekeurig aantal kaarten tussen 50 en 55 (inclusief), in plaats van de huidige bandbreedte
  van 60 tot 80.
- **FR-002**: Systeem MOET, ongeacht het gekozen aantal binnen de 50-55 bandbreedte, altijd
  minimaal 4 virus-kaarten in de trekstapel opnemen (bestaande, ongewijzigde eis).
- **FR-003**: Systeem MOET de resterende plekken in de trekstapel, na de gegarandeerde
  virus-kaarten, willekeurig aanvullen met overige kaarten uit de gekozen kaartenset tot het
  gekozen totaal (50-55) bereikt is.
- **FR-004**: Systeem MOET, wanneer twee verschillende sessies vanuit dezelfde kaartenset
  gestart worden, onafhankelijk van elkaar een nieuw willekeurig aantal (binnen 50-55) en een
  nieuwe willekeurige samenstelling bepalen.
- **FR-005**: Systeem MOET het bestaande gedrag rond het uitputten van de trekstapel (sessie
  eindigt zodra de trekstapel leeg is, zonder herschudden) ongewijzigd laten — alleen de
  bandbreedte van de startgrootte verandert.

### Key Entities

- **Sessie-trekstapel (Session Draw Pool)**: bestaande entiteit — de deelverzameling kaarten uit
  de gekozen kaartenset die bij het starten van een sessie willekeurig samengesteld wordt en
  waaruit de groep tijdens die sessie trekt. In deze feature verandert alleen de bandbreedte
  waarbinnen de grootte van deze deelverzameling willekeurig gekozen wordt (van 60-80 naar
  50-55); de rest van het gedrag (minimaal 4 virus-kaarten, geen herschudden) blijft ongewijzigd.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Bij 100 nieuw gestarte spelsessies vanuit een geldige kaartenset bevat elke
  gegenereerde trekstapel tussen 50 en 55 kaarten (inclusief) — 0 sessies buiten deze
  bandbreedte.
- **SC-002**: Elke gegenereerde trekstapel bevat nog steeds minimaal 4 virus-kaarten — 0
  sessies met minder dan 4 virus-kaarten in de trekstapel.
- **SC-003**: Een gemiddelde spelsessie duurt hierdoor merkbaar korter dan voorheen (uitgedrukt
  in aantal getrokken kaarten: circa 50-55 in plaats van 60-80), zodat een sessie beter binnen
  een kortere speelavond past.

## Assumptions

- De bestaande minimale geldigheidseis voor een kaartenset als geheel (minimaal aantal kaarten in
  de volledige set, en minimaal aantal virus-kaarten in de volledige set) blijft ongewijzigd; deze
  feature verandert alleen de bandbreedte van de *sessie-trekstapel* (de deelselectie per sessie),
  niet de minimale omvang die een kaartenset zelf moet hebben om geldig te zijn.
- De minimale garantie van 4 virus-kaarten per trekstapel (ongeacht poolgrootte) blijft
  ongewijzigd; de gebruiker heeft alleen om een kleinere bovengrens voor het totale aantal
  kaarten gevraagd, niet om een aanpassing van het aantal gegarandeerde virus-kaarten.
- Deze wijziging geldt voor alle kaartensets (zowel de seed-testset als "echte" sets, zie feature
  010), niet alleen voor één specifieke set.
- Er is geen migratie of speciale afhandeling nodig voor lopende sessies, omdat de trekstapel niet
  persistent wordt opgeslagen tussen paginaherladingen — elke nieuwe sessie bouwt een verse
  trekstapel op volgens de dan geldende bandbreedte.
