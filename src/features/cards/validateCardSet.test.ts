import { describe, expect, it } from 'vitest'
import { validateCardSet } from './validateCardSet'
import type { Card, CardSet } from './card.types'

function makeCard(overrides: Partial<Card> & Pick<Card, 'id' | 'type' | 'targeting'>): Card {
  return {
    instructionText: 'Doe iets leuks',
    ...overrides,
  }
}

function makeValidCardSet(): CardSet {
  const cards: Card[] = []

  cards.push(
    makeCard({
      id: 'general-1',
      type: 'assignment',
      targeting: { kind: 'general' },
      instructionText: 'Iedereen klapt drie keer',
    }),
  )
  cards.push(
    makeCard({
      id: 'specific-1',
      type: 'assignment',
      targeting: { kind: 'specific', count: 1 },
      instructionText: '{player} moet 10 keer opdrukken',
    }),
  )
  cards.push(
    makeCard({
      id: 'specific-2',
      type: 'game',
      targeting: { kind: 'specific', count: 2 },
      instructionText: '{player} en {player} doen een dansje',
    }),
  )

  for (let i = 0; i < 4; i++) {
    cards.push(
      makeCard({
        id: `virus-${i}`,
        type: 'virus',
        targeting: { kind: 'specific', count: 1 },
        instructionText: '{player} mag niet meer met links drinken',
        liftText: `{player} is genezen van virus ${i}`,
      }),
    )
  }

  while (cards.length < 80) {
    cards.push(
      makeCard({
        id: `filler-${cards.length}`,
        type: 'assignment',
        targeting: { kind: 'general' },
        instructionText: 'Doe iets leuks',
      }),
    )
  }

  return { id: 'set-1', name: 'Test Set', cards }
}

describe('validateCardSet', () => {
  it('returns no errors for a fully valid card set', () => {
    expect(validateCardSet(makeValidCardSet())).toEqual([])
  })

  it('errors when a specific card has fewer {player} tokens than its target count', () => {
    const cardSet = makeValidCardSet()
    cardSet.cards[2] = makeCard({
      id: 'specific-2',
      type: 'game',
      targeting: { kind: 'specific', count: 2 },
      instructionText: 'Alleen {player} doet een dansje',
    })

    const errors = validateCardSet(cardSet)
    expect(errors.some((e) => e.cardId === 'specific-2')).toBe(true)
  })

  it('errors when a general card contains a {player} token', () => {
    const cardSet = makeValidCardSet()
    cardSet.cards[0] = makeCard({
      id: 'general-1',
      type: 'assignment',
      targeting: { kind: 'general' },
      instructionText: '{player} moet klappen',
    })

    const errors = validateCardSet(cardSet)
    expect(errors.some((e) => e.cardId === 'general-1')).toBe(true)
  })

  it('errors when a virus card lift text has zero {player} tokens', () => {
    const cardSet = makeValidCardSet()
    cardSet.cards[3] = makeCard({
      id: 'virus-0',
      type: 'virus',
      targeting: { kind: 'specific', count: 1 },
      instructionText: '{player} mag niet meer met links drinken',
      liftText: 'De regel is nu opgeheven',
    })

    const errors = validateCardSet(cardSet)
    expect(errors.some((e) => e.cardId === 'virus-0')).toBe(true)
  })

  it('errors when a virus card lift text has more than one {player} token', () => {
    const cardSet = makeValidCardSet()
    cardSet.cards[3] = makeCard({
      id: 'virus-0',
      type: 'virus',
      targeting: { kind: 'specific', count: 1 },
      instructionText: '{player} mag niet meer met links drinken',
      liftText: '{player} en {player} zijn genezen',
    })

    const errors = validateCardSet(cardSet)
    expect(errors.some((e) => e.cardId === 'virus-0')).toBe(true)
  })

  it('errors when the card set has fewer than 80 cards', () => {
    const cardSet = makeValidCardSet()
    cardSet.cards = cardSet.cards.slice(0, 70)

    const errors = validateCardSet(cardSet)
    expect(errors.some((e) => e.cardId === undefined)).toBe(true)
  })

  it('errors when two virus cards share the same lift text', () => {
    const cardSet = makeValidCardSet()
    cardSet.cards[4] = makeCard({
      id: 'virus-1',
      type: 'virus',
      targeting: { kind: 'specific', count: 1 },
      instructionText: '{player} mag niet meer met links drinken',
      liftText: '{player} is genezen van virus 0', // same as virus-0's liftText
    })

    const errors = validateCardSet(cardSet)
    expect(errors.some((e) => e.cardId === 'virus-0')).toBe(true)
    expect(errors.some((e) => e.cardId === 'virus-1')).toBe(true)
  })

  it('accepts a general-targeted virus card whose lift text has zero {player} tokens', () => {
    const cardSet = makeValidCardSet()
    cardSet.cards[3] = makeCard({
      id: 'virus-0',
      type: 'virus',
      targeting: { kind: 'general' },
      instructionText: 'Iedereen mag niet meer met links drinken',
      liftText: 'Iedereen is genezen van dit virus',
    })

    const errors = validateCardSet(cardSet)
    expect(errors.some((e) => e.cardId === 'virus-0')).toBe(false)
  })

  it('errors when a general-targeted virus card lift text has one {player} token', () => {
    const cardSet = makeValidCardSet()
    cardSet.cards[3] = makeCard({
      id: 'virus-0',
      type: 'virus',
      targeting: { kind: 'general' },
      instructionText: 'Iedereen mag niet meer met links drinken',
      liftText: '{player} is genezen van dit virus',
    })

    const errors = validateCardSet(cardSet)
    expect(errors.some((e) => e.cardId === 'virus-0')).toBe(true)
  })

  it('errors when the card set has fewer than 4 virus cards', () => {
    const cardSet = makeValidCardSet()
    cardSet.cards = cardSet.cards.filter((c) => c.type !== 'virus')
    // pad back to 80 with non-virus cards so only the virus-count check fires
    while (cardSet.cards.length < 80) {
      cardSet.cards.push(
        makeCard({
          id: `pad-${cardSet.cards.length}`,
          type: 'assignment',
          targeting: { kind: 'general' },
        }),
      )
    }

    const errors = validateCardSet(cardSet)
    expect(errors.some((e) => e.cardId === undefined)).toBe(true)
  })
})
