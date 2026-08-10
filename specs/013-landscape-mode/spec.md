# Feature Specification: Landscape-modus ondersteuning

**Feature Branch**: `013-landscape-mode`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "make sure the application can run correctly in landscape mode. Just do the responsive updates, no need for a new UI design."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Een volledige speelronde in landscape (Priority: P1)

Als speler die de telefoon in liggende stand houdt (bijvoorbeeld omdat die op tafel of in een
telefoonhouder ligt), kan ik een volledige speelronde doorlopen — kaarten trekken, actieve
virussen zien, een virus-einde bevestigen — zonder dat ik terug naar staande stand hoef te
draaien om bij een knop of stuk tekst te kunnen.

**Why this priority**: Dit is het hoofdscherm waar spelers de meeste tijd doorbrengen; als dit
scherm in landscape kapot is (knoppen buiten beeld, tekst afgesneden), is de rest van de feature
niet de moeite waard.

**Independent Test**: Volledig te testen door een apparaat (of de dev-tools device-emulatie) in
landscape te zetten, een spel te starten, meerdere kaarten te trekken (inclusief minstens één
virus tot en met de "einde virus"-melding), en te verifiëren dat alle tekst leesbaar en alle
knoppen bereikbaar blijven.

**Acceptance Scenarios**:

1. **Given** een lopend spel in landscape-oriëntatie, **When** de speler op "volgende kaart"
   drukt, **Then** blijft de knop na het tonen van de kaart bereikbaar en klikbaar, zonder dat
   de gebruiker moet scrollen buiten wat de inhoud van dat moment vereist.
2. **Given** een virus is actief en de speler staat in landscape, **When** het virus eindigt,
   **Then** is het bijbehorende eindbericht volledig leesbaar en de bevestigingsknop bereikbaar.
3. **Given** meerdere virussen tegelijk actief (tot het maximum van 4), **When** de speler de
   actieve-virussenlijst bekijkt in landscape, **Then** is de volledige lijst zichtbaar of
   scrollbaar, niet afgesneden.

---

### User Story 2 - Spel opzetten en spelers beheren in landscape (Priority: P2)

Als speler die het apparaat al in landscape houdt vóórdat het spel begint, kan ik spelers
toevoegen, een kaartenset kiezen, en spelers tijdens het spel toevoegen/verwijderen, allemaal
zonder terug te hoeven draaien naar staande stand.

**Why this priority**: Bouwt voort op dezelfde onderliggende laag-aanpassing als User Story 1,
maar betreft de opzetschermen — belangrijk voor consistentie, maar de kernbeleving (het spel
zelf) staat voorop.

**Independent Test**: Te testen door in landscape spelers toe te voegen op het opzetscherm, een
kaartenset te kiezen, en tijdens een lopend spel het spelersbeheerscherm te openen — allemaal
zonder oriëntatie te wijzigen, en te verifiëren dat elk scherm volledig bruikbaar is.

**Acceptance Scenarios**:

1. **Given** het opzetscherm voor spelers in landscape, **When** de speler namen invoert en op
   "start" drukt, **Then** blijft het invoerveld en de startknop bereikbaar, ook als het
   toetsenbord van het apparaat open staat.
2. **Given** het kaartensetkeuzescherm in landscape, **When** de speler door de beschikbare
   sets scrolt en er één kiest, **Then** blijft de bevestigingsactie bereikbaar.
3. **Given** het spelersbeheerscherm tijdens een lopend spel in landscape, **When** de speler
   een speler toevoegt of verwijdert, **Then** blijft de rest van de lijst en de sluitknop
   zichtbaar/bereikbaar.

---

### User Story 3 - Oriëntatie wisselen zonder voortgang te verliezen (Priority: P3)

Als speler die per ongeluk (of bewust) van staande naar liggende stand draait halverwege een
spel, wil ik dat het spel er gewoon uitziet zoals verwacht en mijn voortgang (spelers, huidige
kaart, actieve virussen) behouden blijft, zonder dat ik iets opnieuw hoef te doen.

**Why this priority**: Ondersteunt de vorige twee user stories (zonder deze zou een toevallige
draai het spel kunnen verstoren), maar is op zichzelf een kleiner, eenvoudig te verifiëren
randgeval bovenop het werkende landscape-scherm.

**Independent Test**: Te testen door een spel te starten in staande stand, een paar kaarten te
trekken, het apparaat naar landscape te draaien, en te verifiëren dat dezelfde spelsituatie
(spelers, huidige kaart, actieve virussen) intact blijft en het scherm zich herschikt naar de
landscape-indeling.

**Acceptance Scenarios**:

1. **Given** een lopend spel in staande stand met een getrokken kaart en actieve virussen,
   **When** het apparaat naar landscape gedraaid wordt, **Then** toont het scherm dezelfde
   kaart en dezelfde actieve virussen, nu in de landscape-indeling, zonder reset.

---

### Edge Cases

- Wat gebeurt er op een zeer lage landscape-hoogte (bijvoorbeeld een telefoon in landscape,
  ongeveer 320–360px hoog)? Inhoud die niet past MOET verticaal scrollbaar worden in plaats van
  afgesneden te worden.
- Wat gebeurt er op een tablet in landscape (veel meer breedte dan een telefoon)? De indeling
  mag niet extreem uitgerekt of grotendeels leeg ogen; de bestaande, smallere kolomindeling mag
  behouden blijven zolang niets onbereikbaar is.
- Wat gebeurt er als het schermtoetsenbord open staat tijdens naam-invoer in landscape (waar al
  weinig verticale ruimte is)? Het invoerveld en de bevestigingsactie MOETEN zichtbaar/bereikbaar
  blijven.
- Wat gebeurt er met de dynamische adresbalk van mobiele browsers (die de zichtbare hoogte
  tijdens scrollen laat veranderen) in landscape? De indeling MOET hiermee om kunnen gaan zonder
  dat knoppen intermitterend onbereikbaar worden.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Systeem MOET de volledige spellus (kaart trekken, actieve virussen bekijken,
  virus-einde bevestigen) volledig bruikbaar maken in landscape-oriëntatie.
- **FR-002**: Systeem MOET de opzetschermen (spelersopzet, kaartensetkeuze) en het
  spelersbeheerscherm tijdens het spel volledig bruikbaar maken in landscape-oriëntatie.
- **FR-003**: Systeem MOET voorkomen dat essentiële bedieningselementen (bijvoorbeeld
  "volgende kaart", "start", "toevoegen") buiten beeld of onbereikbaar raken in landscape;
  inhoud die niet past MOET scrollbaar worden in plaats van afgesneden te worden.
- **FR-004**: Systeem MOET de bestaande sessiestatus (spelerslijst, huidige kaart, actieve
  virus-effecten, huidig scherm) behouden bij een oriëntatiewissel — draaien van het apparaat
  MAG de voortgang niet resetten of verliezen.
- **FR-005**: Systeem MOET de beschikbare horizontale ruimte in landscape effectiever benutten
  dan simpelweg dezelfde smalle, staande-stand-kolom met grote lege zijmarges te tonen.
- **FR-006**: Deze feature MAG GEEN nieuwe schermen, nieuwe visuele ontwerpen of nieuwe
  componenten introduceren — het past uitsluitend het bestaande, responsieve (CSS/lay-out)
  gedrag van bestaande schermen aan.
- **FR-007**: Systeem MOET in staande stand exact zo blijven werken als vóór deze feature —
  landscape-ondersteuning MAG de bestaande staande-stand-ervaring niet aantasten.
- **FR-008**: Systeem MOET landscape-indelingen ondersteunen over het gangbare bereik van
  telefoon- en tablet-landscape-hoogtes, inclusief lage hoogtes (vanaf ongeveer 320–360px),
  zonder essentiële inhoud of bediening af te snijden.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Een volledige spelsessie (van start tot het eindscherm) kan volledig in
  landscape-oriëntatie doorlopen worden zonder dat enige bediening onbereikbaar is of inhoud
  wordt afgesneden.
- **SC-002**: Het draaien van het apparaat tussen staande en liggende stand, op elk moment
  tijdens een sessie, verliest nooit spelerslijst-, kaart-, of virusstatus.
- **SC-003**: Op de kleinste gangbare landscape-hoogte (telefoon-landscape, circa 360px) blijft
  de primaire actieknop van elk scherm bereikbaar zonder meer dan normaal scrollen.
- **SC-004**: Het bestaande gedrag in staande stand verandert niet — alle schermen zien er na
  deze feature identiek uit en gedragen zich identiek in staande stand.

## Assumptions

- "Landscape-modus" verwijst naar de fysieke/CSS-oriëntatie van het apparaat (breedte > hoogte),
  automatisch gedetecteerd via responsieve CSS (bijvoorbeeld hoogte- of oriëntatie-gebaseerde
  media queries), niet een handmatige in-app schakelaar. De gebruiker doet niets anders dan het
  apparaat draaien.
- Zoals expliciet aangegeven in de featurebeschrijving is er geen nieuwe UI-ontwerpstap nodig
  (geen nieuwe Stitch-schermen/DESIGN.md-aanpassing) — dit is een aanpassing van de bestaande,
  al goedgekeurde schermen aan responsief gedrag, geen nieuw visueel ontwerp. Dit wordt bij de
  design-workflow-gate gemarkeerd als "No UI Impact" (vergelijkbaar met feature 011).
- Scope omvat alle bestaande schermen die momenteel dezelfde staande-stand-gerichte
  lay-outstructuur delen (`min-h-svh`, smalle `max-w-md`-kolom, gecentreerd): spelersopzet,
  kaartensetkeuze, de hoofdspellus, spelersbeheer tijdens het spel, en het eindscherm.
- Er wordt geen oriëntatie-vergrendeling toegevoegd — de applicatie blijft zowel staande als
  liggende stand ondersteunen; deze feature verhelpt alleen het huidige, niet-afgehandelde
  landscape-gedrag, zonder een voorkeursoriëntatie af te dwingen.
- Tablet-landscape (grotere breedtes) valt binnen scope omdat dezelfde lay-outstructuur over
  schermgroottes heen gebruikt wordt, maar telefoon-landscape blijft het primaire doel, passend
  bij het mobile-first, één-gedeeld-apparaat gebruiksmodel van het project.
- De aanpassing blijft binnen de bestaande visuele stijl (kleuren, typografie, componenten) —
  er worden geen nieuwe visuele elementen toegevoegd, alleen lay-out/ruimteverdeling aangepast
  aan de beschikbare hoogte/breedte.
