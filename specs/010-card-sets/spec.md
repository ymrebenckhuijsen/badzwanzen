# Feature Specification: Kaartensets

**Feature Branch**: `010-card-sets`

**Created**: 2026-08-09

**Status**: Draft

**Input**: User description: "Kaartensets: het spel moet meerdere, benoemde sets van kaarten (opdrachten/spelletjes/virussen) kunnen bevatten in plaats van één vaste seed-set. Bij het opzetten van een spel kan de gebruiker kiezen welke kaartenset gebruikt wordt. Er is altijd een \"seed\"-testset beschikbaar (de huidige voorbeeldkaarten, bedoeld om te testen/ontwikkelen), en daarnaast kunnen er een of meer \"echte\" sets zijn met vragen die passen bij een specifiek gezelschap — de gebruiker kan dus per speelsessie een passende set kiezen. Elke set heeft een naam. De daadwerkelijke inhoud van een nieuwe, echte set wordt door de gebruiker apart aangeleverd (een bestand met bedachte vragen) en moet naar het juiste kaartformaat omgezet worden; die inhoud wordt na het specificeren/plannen toegevoegd, dus de feature moet het mechanisme (meerdere sets, benoemd, selecteerbaar) opleveren, niet per se de content van één specifieke echte set."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Een kaartenset kiezen bij het opzetten van een spel (Priority: P1)

Als gebruiker die een spelsessie opzet, zie ik een lijst van beschikbare, benoemde kaartensets
en kies ik welke set gebruikt wordt voor deze sessie, zodat de vragen/opdrachten passen bij het
gezelschap dat aan het spelen is.

**Why this priority**: Dit is de kern van de feature — zonder een keuzemoment blijft het spel
vastzitten aan één vaste kaartenset, en kan de gebruiker de inhoud nooit aanpassen aan het
gezelschap.

**Independent Test**: Volledig te testen door een spel op te zetten, een set te kiezen uit de
beschikbare opties, het spel te starten, en te verifiëren dat de getoonde kaarten uit de gekozen
set komen (niet uit een andere set).

**Acceptance Scenarios**:

1. **Given** er zijn meerdere kaartensets beschikbaar, **When** de gebruiker een spel opzet,
   **Then** ziet de gebruiker de namen van alle beschikbare sets en kan er één kiezen voordat
   het spel start.
2. **Given** de gebruiker heeft een specifieke set gekozen, **When** het spel start en kaarten
   getrokken worden, **Then** komen alle getrokken kaarten uitsluitend uit de gekozen set.
3. **Given** er is maar één kaartenset beschikbaar, **When** de gebruiker een spel opzet,
   **Then** wordt die ene set automatisch gebruikt zonder dat een verplichte keuzestap in de weg
   zit.

---

### User Story 2 - Altijd kunnen testen met de seed-testset (Priority: P2)

Als ontwikkelaar of tester wil ik altijd de bekende seed-testset kunnen kiezen, ongeacht hoeveel
"echte" sets er inmiddels zijn toegevoegd, zodat ik het spel kan testen zonder afhankelijk te
zijn van (nog niet aangeleverde of nog niet goedgekeurde) echte vraageninhoud.

**Why this priority**: Bouwt voort op User Story 1 (het keuzemechanisme moet al bestaan), maar
is losstaand waardevol en testbaar: het garandeert dat er nooit een moment is waarop alleen
onvolledige of niet-goedgekeurde echte sets beschikbaar zijn.

**Independent Test**: Te testen door willekeurig veel echte kaartensets toe te voegen aan de
catalogus en te verifiëren dat de seed-testset nog steeds als keuze verschijnt en identiek werkt
aan de huidige (feature 004) situatie.

**Acceptance Scenarios**:

1. **Given** er zijn nul of meer echte kaartensets toegevoegd, **When** de gebruiker de lijst
   met beschikbare sets bekijkt, **Then** staat de seed-testset altijd in die lijst.
2. **Given** de seed-testset is gekozen, **When** het spel gespeeld wordt, **Then** gedraagt het
   spel zich functioneel identiek aan de huidige situatie vóór deze feature (dezelfde
   voorbeeldkaarten, dezelfde regels).

---

### User Story 3 - De laatst gekozen set onthouden (Priority: P3)

Als gebruiker die vaker met dezelfde groep speelt, wil ik dat de app de laatst gekozen
kaartenset onthoudt, zodat ik bij een nieuwe sessie met diezelfde groep niet elke keer opnieuw
hoef te kiezen.

**Why this priority**: Verhoogt het gebruiksgemak en sluit aan bij hoe de spelerslijst al
persistent wordt opgeslagen, maar de kernfunctionaliteit (kunnen kiezen) werkt ook zonder dit —
de gebruiker kan dan gewoon elke keer opnieuw kiezen.

**Independent Test**: Te testen door een set te kiezen, een spel te spelen, de pagina te
verversen of een nieuwe sessie te starten, en te verifiëren dat dezelfde set al vooraf
geselecteerd staat.

**Acceptance Scenarios**:

1. **Given** de gebruiker heeft eerder een specifieke set gekozen, **When** een nieuwe sessie
   wordt opgezet (bijvoorbeeld via "opnieuw spelen" of na een paginaherlading), **Then** staat
   die eerder gekozen set al vooraf geselecteerd, met de mogelijkheid om een andere te kiezen.

---

### Edge Cases

- Wat gebeurt er als een kaartenset niet voldoet aan de bestaande minimale eisen (minimaal
  aantal kaarten, minimaal aantal virus-kaarten)? Zo'n set mag niet als keuze verschijnen.
- Wat gebeurt er als twee kaartensets dezelfde naam hebben? De namen moeten uniek zijn binnen de
  catalogus, zodat de gebruiker de sets altijd van elkaar kan onderscheiden.
- Wat gebeurt er als de eerder gekozen set (zie User Story 3) niet meer bestaat op het moment
  van een nieuwe sessie (bijvoorbeeld verwijderd door een update van de app)? De app valt dan
  terug op de seed-testset als standaardkeuze.
- Wat gebeurt er als een gebruiker halverwege een lopende sessie een andere set zou willen
  kiezen? Dat kan niet — de gekozen set ligt vast voor de duur van een sessie; wisselen kan pas
  bij het opzetten van een nieuwe sessie (zie Assumptions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Systeem MOET meerdere, losstaande kaartensets kunnen bevatten in plaats van één
  vaste, hardgecodeerde set.
- **FR-002**: Elke kaartenset MOET een naam hebben die aan de gebruiker getoond wordt.
- **FR-003**: Systeem MOET altijd een "seed"-testset beschikbaar houden, onafhankelijk van
  hoeveel echte sets er zijn toegevoegd, functioneel gelijk aan de huidige voorbeeldkaarten.
- **FR-004**: Gebruikers MOETEN bij het opzetten van een spelsessie kunnen kiezen welke
  beschikbare kaartenset voor die sessie gebruikt wordt.
- **FR-005**: Systeem MOET, zodra een set gekozen is, uitsluitend kaarten uit die gekozen set
  gebruiken voor het opbouwen van de trekstapel en de rest van de sessie.
- **FR-006**: Systeem MOET alleen kaartensets als keuze aanbieden die voldoen aan de bestaande
  geldigheidseisen (minimaal aantal kaarten, minimaal aantal virus-kaarten); ongeldige sets zijn
  niet selecteerbaar.
- **FR-007**: Systeem MOET, wanneer er maar één geldige kaartenset beschikbaar is, deze
  automatisch gebruiken zonder een verplichte extra keuzestap.
- **FR-008**: Systeem MOET de namen van kaartensets uniek houden binnen de catalogus van
  beschikbare sets.
- **FR-009**: Systeem MOET het toevoegen van een nieuwe, geldige kaartenset aan de catalogus
  mogelijk maken zonder dat de keuze- of sessielogica zelf aangepast hoeft te worden — alleen de
  setdata zelf wordt toegevoegd.
- **FR-010**: Systeem MOET de laatst gekozen kaartenset onthouden (op dezelfde manier als de
  bestaande spelerslijst persistent wordt opgeslagen) en deze vooraf selecteren bij een
  volgende sessie-opzet, met de mogelijkheid voor de gebruiker om een andere set te kiezen.
- **FR-011**: Systeem MOET, als de onthouden laatst-gekozen set niet meer bestaat (of als er nog
  nooit een keuze is gemaakt), terugvallen op de primaire/standaard set van de catalogus.
  *(Bijgewerkt 2026-08-09, nadat de echte "Badzwanzen"-set is toegevoegd: die set is de
  standaardkeuze in productie; de seed-testset blijft altijd beschikbaar als keuze (FR-003)
  maar is niet langer het terugval-doel zodra echte inhoud bestaat — zie Assumptions.)*
- **FR-012**: De gekozen kaartenset MOET vastliggen voor de duur van een spelsessie; wisselen
  van set is alleen mogelijk bij het opzetten van een nieuwe sessie, niet tijdens een lopende
  sessie.

### Key Entities

- **Kaartenset (Card Set)**: bestaande entiteit (id, naam, kaarten) uit de opdrachten/virussen-
  feature, in deze feature uitgebreid van "één vaste set" naar "één van meerdere, benoemde sets
  waaruit gekozen kan worden". De naam is het onderscheidende, gebruiker-zichtbare kenmerk.
- **Kaartensetcatalogus (Card Set Catalog)**: de verzameling van alle beschikbare, benoemde
  sets (de seed-testset plus eventuele echte sets) waaruit bij het opzetten van een sessie
  gekozen kan worden.
- **Sessie-setkeuze (Session Card Set Selection)**: welke kaartenset voor de huidige/nieuwste
  sessie gekozen is; onderdeel van de sessie-opzet naast de spelerslijst, en de bron die bepaalt
  welke kaarten in de trekstapel van die sessie terechtkomen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Een gebruiker kan bij het opzetten van een spel binnen 10 seconden een kaartenset
  kiezen uit de beschikbare, benoemde opties.
- **SC-002**: 100% van de spelsessies gebruikt uitsluitend kaarten uit de door de gebruiker
  gekozen set — geen enkele sessie mengt kaarten uit meerdere sets of gebruikt een andere set
  dan gekozen.
- **SC-003**: Een tester kan, ongeacht hoeveel echte kaartensets zijn toegevoegd, in maximaal
  één keuzestap de seed-testset selecteren.
- **SC-004**: Een nieuwe, geldige kaartenset kan aan de keuzelijst toegevoegd worden zonder dat
  andere onderdelen van de app (keuzeflow, sessieopbouw) aangepast hoeven te worden.
- **SC-005**: Gebruikers die vaker met dezelfde groep spelen, hoeven de kaartenset niet elke
  sessie opnieuw te kiezen (kwalitatief, te toetsen doordat de laatst gekozen set standaard
  vooraf geselecteerd staat).

## Assumptions

- Het aanmaken/bewerken van kaartinhoud via een in-app formulier valt buiten scope van deze
  feature. Nieuwe "echte" sets worden door een ontwikkelaar toegevoegd op basis van apart
  aangeleverde content (een bestand met vragen), omgezet naar het bestaande kaartformaat — deze
  feature levert het mechanisme (meerdere, benoemde, selecteerbare sets), niet een
  content-auteursomgeving.
- De inhoud van de eerste "echte" set (het bestand dat de gebruiker apart aanlevert) wordt na
  het specificeren/plannen van deze feature toegevoegd, en moet voldoen aan dezelfde
  geldigheidseisen als de bestaande seed-testset (minimaal aantal kaarten, minimaal aantal
  virus-kaarten, correcte `{player}`-tokens).
- De bestaande validatieregels voor kaartensets (`validateCardSet`, o.a. minimaal 80 kaarten en
  minimaal 4 virus-kaarten) blijven ongewijzigd van toepassing op elke set, seed én echt.
- **Content-toevoeging (2026-08-09)**: de eerste echte set, "Badzwanzen" (386 kaarten,
  omgezet uit `specs/010-card-sets/badzwanzen.txt`), is toegevoegd en is de standaardkeuze in
  productie (FR-011, herzien) — de seed-testset blijft altijd beschikbaar (FR-003) maar is dat
  niet meer als terugval-doel. Op expliciete instructie van de developer is vrijwel de volledige
  brontekst overgenomen; de ene regel met een letterlijke scheldwoord-vorm (racistisch
  scheldwoord) had de developer zelf al uit het brontekstbestand verwijderd voordat de
  conversie plaatsvond.
- Er is één gedeeld apparaat dat rondgaat; net als bij de rest van de app is er geen
  synchronisatie van setkeuze tussen meerdere apparaten nodig (client-side, geen backend).
- De setkeuze wordt onderdeel van dezelfde lokale opslag als de bestaande spelerslijst-
  persistentie, niet van een apart opslagmechanisme.
- Er wordt geen leeftijds- of inhoudsclassificatie (zoals een expliciete "geschiktheid"-
  indicator) aan sets toegevoegd in deze feature — de naam van de set is voldoende voor de
  gebruiker om de juiste set voor het gezelschap te herkennen; verdere metadata (bijvoorbeeld
  een korte omschrijving) kan een latere uitbreiding zijn.
