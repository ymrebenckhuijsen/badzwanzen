# Feature Specification: Kortere, begrensde virusduur

**Feature Branch**: `017-virus-duration`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "start een nieuwe feature om te zorgen dat een virus maximaal 15-20 vragen duurt"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Een virus duurt hooguit 15-20 kaarten (Priority: P1)

Als speler die een virus meemaakt, wil ik dat het virus na hooguit 15-20 getrokken opdracht-/
spelkaarten afloopt, zodat een virus nooit onredelijk lang blijft hangen en het spel behapbaar
blijft.

**Why this priority**: Dit is de hele feature — vandaag kan een virus tot 50 kaarten duren
(feature 004's oorspronkelijke, destijds bewust ongelimiteerde bovengrens), wat in de praktijk
als te lang ervaren wordt.

**Independent Test**: Volledig te testen door een virus te trekken, opdracht-/spelkaarten te
blijven trekken, en te verifiëren dat het virus uiterlijk na 20 van zulke kaarten is afgelopen,
en nooit vóór de 15e.

**Acceptance Scenarios**:

1. **Given** een virus is zojuist getrokken, **When** opdracht-/spelkaarten getrokken worden,
   **Then** loopt het virus af na een aantal van dat soort kaarten dat ergens tussen de 15 en 20
   ligt (beide grenzen inbegrepen).
2. **Given** een virus is actief, **When** minder dan 15 opdracht-/spelkaarten sinds de start
   van dat virus getrokken zijn, **Then** is het virus nog niet afgelopen.
3. **Given** een virus is actief, **When** 20 opdracht-/spelkaarten sinds de start van dat virus
   getrokken zijn, **Then** is het virus in elk geval afgelopen (uiterlijk op dat punt).
4. **Given** de trekstapel raakt leeg terwijl een virus nog actief is (bestaand
   geforceerd-eindegedrag), **Then** eindigt het virus meteen, ongeacht of de 15-20-drempel al
   bereikt was — dit bestaande gedrag verandert niet.

---

### Edge Cases

- Wat gebeurt er met virussen die "iedereen" targeten (feature 016: gedeelde duur/eindmoment
  voor de hele groep)? De 15-20-begrenzing geldt per virusactivatie als geheel, dus voor zo'n
  virus geldt precies dezelfde, voor alle getroffen spelers gedeelde drempel — dit sluit aan bij
  het bestaande gedrag waarbij de drempel al één keer per activatie (niet per speler) bepaald
  wordt.
- Wat gebeurt er als er meerdere virussen tegelijk actief zijn (maximaal 3, feature 016)? Elk
  virus krijgt zijn eigen, onafhankelijk bepaalde duur binnen de 15-20-range; het aflopen van het
  ene virus staat los van de duur van een ander.
- Wat gebeurt er met een viruskaart die al eerder is gevalideerd/getest uitgaande van de oude
  10-50-range? Bestaande content blijft geldig; de duur wordt bepaald door de sessielogica, niet
  door iets dat in de kaartdata zelf is vastgelegd, dus geen kaartinhoud hoeft aangepast te
  worden.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Systeem MOET voor elke nieuw geactiveerde virus een duur (uitgedrukt in aantal
  getrokken opdracht-/spelkaarten voordat het virus afloopt) bepalen die tussen de 15 en 20
  (beide inbegrepen) ligt.
- **FR-002**: Systeem MOET de bestaande, willekeurige spreiding binnen die 15-20-range
  behouden — niet elk virus duurt exact even lang, zoals nu ook al het geval is binnen de (bredere)
  bestaande range.
- **FR-003**: Systeem MOET dit nieuwe maximum toepassen op elke virusactivatie na het uitrollen
  van deze feature; de aanpassing wijzigt geen kaartinhoud, alleen de sessielogica die de duur
  bepaalt.
- **FR-004**: Systeem MOET het bestaande gedrag voor "iedereen"-virussen (één gedeelde duur/
  eindmoment voor de hele groep, feature 015/016) en voor het geforceerd eindigen van nog actieve
  virussen bij het leegraken van de trekstapel (bestaand gedrag) ongewijzigd laten — alleen de
  onderliggende 15-20-begrenzing is nieuw.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% van de virusactivaties eindigt na minimaal 15 en maximaal 20 getrokken
  opdracht-/spelkaarten sinds de start van dat virus (los van een eventueel eerder, geforceerd
  einde door het leegraken van de trekstapel).
- **SC-002**: De duur van opeenvolgende virusactivaties varieert nog steeds (niet elke keer
  precies dezelfde duur), binnen de nieuwe, kortere bandbreedte.

## Assumptions

- Dit vervangt expliciet de eerdere, bewuste designbeslissing uit feature 004
  (`specs/004-assignments-and-viruses/research.md`: "virus lift threshold has no fixed maximum",
  ondergrens 10, geen bovengrens) door een nieuwe ondergrens (15) én bovengrens (20) — een
  bewuste herziening op basis van speelervaring, geen oversight.
- "Vragen" in de featurebeschrijving verwijst naar dezelfde eenheid die de bestaande
  virusduur-logica al gebruikt: getrokken opdracht- en spelkaarten (niet viruskaarten zelf, en
  niet virus-eindemeldingen — die tellen al niet mee, feature 015).
- Deze feature introduceert geen nieuwe UI-schermen of visueel ontwerp — het is een aanpassing
  van bestaande sessielogica (duurbepaling), niet zichtbaar als nieuw scherm of component.
