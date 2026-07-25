# Werken met git worktrees

## Overzicht

We werken soms tegelijk aan meerdere features. Met één gedeelde werkmap zou dat betekenen dat
je moet stashen of wisselen van branch elke keer dat je tussen features wisselt. Git
worktrees lossen dat op: elke feature krijgt zijn eigen werkmap (een aparte map op schijf) met
zijn eigen branch uitgecheckt, terwijl alles binnen dezelfde repository blijft — één `.git`,
gedeeld tussen alle werkmappen.

Twee scripts regelen dit: `worktree-add.sh` (nieuwe werkmap + branch aanmaken) en
`worktree-remove.sh` (opruimen na afronding). Beide staan in `.specify/scripts/bash/`.

## Een feature starten

Wil je aan een nieuwe feature werken zonder je huidige werkmap aan te raken (niet hoeven
stashen of van branch wisselen)? Draai:

```bash
.specify/scripts/bash/worktree-add.sh --short-name jouw-korte-naam "Omschrijving van de feature"
```

Dit doet drie dingen:

1. Haalt `origin` op en berekent het eerstvolgende vrije feature-nummer (zie hieronder).
2. Maakt een nieuwe werkmap aan op `../badzwanzen-worktrees/<NNN-jouw-korte-naam>/`, met een
   nieuwe branch `<NNN-jouw-korte-naam>` gebaseerd op `origin/main`.
3. Print de padnaam, de branchnaam, en de vervolgstappen.

**Belangrijk**: dependencies (`node_modules`) worden niet gedeeld tussen werkmappen — git
volgt alleen bestanden die in git zitten. Ga dus na het aanmaken altijd eerst naar de nieuwe
werkmap en installeer daar opnieuw:

```bash
cd ../badzwanzen-worktrees/<NNN-jouw-korte-naam>
npm install
```

Start daarna de spec-driven flow zoals gebruikelijk (`/speckit-specify ...`) vanuit die nieuwe
werkmap.

## Nummering over werkmappen heen

Het volgnummer van een nieuwe feature wordt berekend op basis van zowel de mappen onder
`specs/` in je huidige werkmap, als alle bestaande feature-branches — lokaal én op `origin`.
Zo krijgen twee features die tegelijk in verschillende werkmappen gestart worden nooit
hetzelfde nummer, ook niet als de ene branch nog niet is samengevoegd of nog niet lokaal is
opgehaald in de andere werkmap.

**Eén voorwaarde**: draai `git fetch origin` (of gebruik `worktree-add.sh`, die dit al voor je
doet) voordat je een nieuwe feature start, zodat branches van je teamgenoot die je nog niet
lokaal had ook meetellen.

## Opruimen

Is een feature afgerond en samengevoegd? Ruim de werkmap op met:

```bash
.specify/scripts/bash/worktree-remove.sh <branch-naam>
```

Dit verwijdert de werkmap, en verwijdert ook de lokale branch als die inmiddels in `main` is
samengevoegd (anders blijft de branch staan, met een melding).

Staan er nog niet-gecommitte wijzigingen in die werkmap? Dan weigert het script en toont het
welke bestanden het betreft — zo raak je nooit per ongeluk werk kwijt. Weet je zeker dat het
weg mag, gebruik dan:

```bash
.specify/scripts/bash/worktree-remove.sh <branch-naam> --force
```

## Bekende beperkingen

- **Dependencies zijn niet gedeeld**: `node_modules` (en elk ander niet-git-bestand) bestaat
  per werkmap. Dat kost extra schijfruimte en installatietijd per werkmap, geaccepteerd voor
  het voordeel van parallel werken (zie ook "Een feature starten" hierboven).
- **"Branch already checked out elsewhere"**: `worktree-add.sh` berekent bij elke aanroep
  opnieuw een vrij nummer, dus deze foutmelding treedt in de praktijk zelden op — alleen bij
  een echte race (twee aanroepen op (bijna) hetzelfde moment) of als iets buiten het script om
  die exacte branch al gebruikt. Als het gebeurt, noemt de foutmelding zowel de branchnaam als
  het pad van de werkmap die hem al gebruikt.
- **Werkt per ontwikkelaar/machine vanzelf**: git worktrees zijn altijd lokaal aan één clone.
  Niets in `worktree-add.sh`/`worktree-remove.sh` maakt onderscheid tussen ontwikkelaars — of
  jullie nu allebei op je eigen laptop zitten, of samen achter één laptop in aparte werkmappen,
  het werkt hetzelfde. Hier is geen extra code voor nodig.
- **Alleen lokaal, geen cloud-oplossing**: werkmappen leven op dezelfde machine als de
  hoofd-werkmap; er is geen ondersteuning voor gedeelde/remote werkmappen.
