import type { Card, CardSet } from '../card.types'

const signatureAssignments: Card[] = [
  {
    id: 'opdracht-001',
    type: 'assignment',
    targeting: { kind: 'general' },
    instructionText: 'Iedereen neemt een slok van zijn drankje.',
  },
  {
    id: 'opdracht-002',
    type: 'assignment',
    targeting: { kind: 'general' },
    instructionText: 'Iedereen doet 5 kniebuigingen.',
  },
  {
    id: 'opdracht-003',
    type: 'assignment',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} moet 10 keer opdrukken.',
  },
  {
    id: 'opdracht-004',
    type: 'assignment',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} vertelt een gênante anekdote.',
  },
  {
    id: 'opdracht-005',
    type: 'assignment',
    targeting: { kind: 'specific', count: 2 },
    instructionText: '{player} en {player} armworstelen om het laatste stukje snack.',
  },
  {
    id: 'opdracht-006',
    type: 'assignment',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} moet de rest van de ronde alleen fluisterend praten.',
  },
  {
    id: 'opdracht-007',
    type: 'assignment',
    targeting: { kind: 'general' },
    instructionText: 'Iedereen wisselt van plaats met de persoon rechts van hen.',
  },
  {
    id: 'opdracht-008',
    type: 'assignment',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} moet een compliment geven aan iedereen in de kamer.',
  },
  {
    id: 'opdracht-009',
    type: 'assignment',
    targeting: { kind: 'specific', count: 2 },
    instructionText: '{player} en {player} doen samen een high five zonder te missen.',
  },
  {
    id: 'opdracht-010',
    type: 'assignment',
    targeting: { kind: 'general' },
    instructionText: 'Iedereen zingt de eerste regel van zijn lievelingsnummer.',
  },
]

const signatureGames: Card[] = [
  {
    id: 'spel-001',
    type: 'game',
    targeting: { kind: 'general' },
    instructionText: 'Iedereen doet een dansje op het volgende nummer dat gespeeld wordt.',
  },
  {
    id: 'spel-002',
    type: 'game',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} moet 30 seconden een willekeurig accent volhouden.',
  },
  {
    id: 'spel-003',
    type: 'game',
    targeting: { kind: 'specific', count: 2 },
    instructionText: '{player} en {player} doen een dance-off, de groep kiest de winnaar.',
  },
  {
    id: 'spel-004',
    type: 'game',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} moet een klein toneelstukje improviseren over de dag van vandaag.',
  },
  {
    id: 'spel-005',
    type: 'game',
    targeting: { kind: 'general' },
    instructionText: 'Iedereen speelt een ronde steen-papier-schaar tegen de persoon links van hen.',
  },
  {
    id: 'spel-006',
    type: 'game',
    targeting: { kind: 'specific', count: 3 },
    instructionText: '{player}, {player} en {player} vormen een menselijk standbeeld, de groep kiest een thema.',
  },
  {
    id: 'spel-007',
    type: 'game',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} moet een liedje neuriën en de rest raadt welk nummer het is.',
  },
  {
    id: 'spel-008',
    type: 'game',
    targeting: { kind: 'specific', count: 2 },
    instructionText: '{player} moet {player} imiteren tot iemand het doorheeft.',
  },
  {
    id: 'spel-009',
    type: 'game',
    targeting: { kind: 'general' },
    instructionText: 'Iedereen moet 1 minuut lang op 1 been blijven staan tijdens het gesprek.',
  },
  {
    id: 'spel-010',
    type: 'game',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} moet een spontaan gedichtje voordragen over de groep.',
  },
]

const virusCards: Card[] = [
  {
    id: 'virus-001',
    type: 'virus',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} mag vanaf nu niet meer met links drinken.',
    liftText: '{player} mag weer gewoon met links drinken.',
  },
  {
    id: 'virus-002',
    type: 'virus',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} moet vanaf nu altijd "alsjeblieft" zeggen na elke zin.',
    liftText: '{player} hoeft niet meer "alsjeblieft" te zeggen na elke zin.',
  },
  {
    id: 'virus-003',
    type: 'virus',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} mag vanaf nu geen namen meer noemen van andere spelers.',
    liftText: '{player} mag weer gewoon namen van andere spelers noemen.',
  },
  {
    id: 'virus-004',
    type: 'virus',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} moet vanaf nu staan bij het praten.',
    liftText: '{player} mag weer gewoon zitten bij het praten.',
  },
  {
    id: 'virus-005',
    type: 'virus',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} mag vanaf nu niet meer lachen, wat er ook gebeurt.',
    liftText: '{player} mag weer gewoon lachen.',
  },
  {
    id: 'virus-006',
    type: 'virus',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} moet vanaf nu elke vraag beantwoorden met een tegenvraag.',
    liftText: '{player} mag vragen weer gewoon direct beantwoorden.',
  },
  {
    id: 'virus-007',
    type: 'virus',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} mag vanaf nu niemand meer aanraken.',
    liftText: '{player} mag weer gewoon anderen aanraken.',
  },
  {
    id: 'virus-008',
    type: 'virus',
    targeting: { kind: 'specific', count: 1 },
    instructionText: '{player} moet vanaf nu bij elke slok drinken ook proosten.',
    liftText: '{player} hoeft niet meer te proosten bij elke slok.',
  },
]

interface BulkTemplate {
  type: Card['type']
  targeting: { kind: 'general' } | { kind: 'specific'; count: 1 }
  instructionText: string
}

const bulkTemplates: BulkTemplate[] = [
  { type: 'assignment', targeting: { kind: 'general' }, instructionText: 'Iedereen klapt drie keer in zijn handen.' },
  { type: 'assignment', targeting: { kind: 'general' }, instructionText: 'Iedereen strekt zijn armen omhoog en geeuwt overdreven.' },
  { type: 'assignment', targeting: { kind: 'specific', count: 1 }, instructionText: '{player} moet een dierengeluid nadoen.' },
  { type: 'assignment', targeting: { kind: 'specific', count: 1 }, instructionText: '{player} moet een tongbreker driemaal snel achter elkaar zeggen.' },
  { type: 'assignment', targeting: { kind: 'specific', count: 1 }, instructionText: '{player} moet een selfie maken met een rare gezichtsuitdrukking.' },
  { type: 'assignment', targeting: { kind: 'general' }, instructionText: 'Iedereen deelt zijn favoriete emoji met de groep.' },
  { type: 'assignment', targeting: { kind: 'specific', count: 1 }, instructionText: '{player} moet een bekende quote citeren.' },
  { type: 'assignment', targeting: { kind: 'general' }, instructionText: 'Iedereen telt hardop mee tot 10 in een andere taal.' },
  { type: 'game', targeting: { kind: 'specific', count: 1 }, instructionText: '{player} moet een minipresentatie geven over een willekeurig voorwerp in de kamer.' },
  { type: 'game', targeting: { kind: 'general' }, instructionText: 'Iedereen doet 10 seconden een robotdans.' },
  { type: 'game', targeting: { kind: 'specific', count: 1 }, instructionText: '{player} moet een rijmpje maken op de naam van de speler links van hen.' },
  { type: 'game', targeting: { kind: 'general' }, instructionText: 'Iedereen maakt een groepsfoto met een gekke pose.' },
]

function buildBulkCards(count: number, startIndex: number): Card[] {
  return Array.from({ length: count }, (_, i) => {
    const template = bulkTemplates[(startIndex + i) % bulkTemplates.length]
    return {
      id: `extra-${String(startIndex + i + 1).padStart(3, '0')}`,
      type: template.type,
      targeting: template.targeting,
      instructionText: template.instructionText,
    }
  })
}

export const seedCardSet: CardSet = {
  id: 'badzwanzen-default',
  name: 'Badzwanzen — Standaard set',
  cards: [
    ...signatureAssignments,
    ...signatureGames,
    ...virusCards,
    ...buildBulkCards(52, 0),
  ],
}
