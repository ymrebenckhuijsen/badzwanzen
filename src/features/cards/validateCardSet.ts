import type { Card, CardSet } from './card.types'

const MIN_CARDS = 80
const MIN_VIRUS_CARDS = 4

export interface ValidationError {
  cardId?: string
  message: string
}

function countPlayerTokens(text: string): number {
  return (text.match(/\{player\}/g) ?? []).length
}

function expectedTokenCount(card: Card): number {
  return card.targeting.kind === 'specific' ? card.targeting.count : 0
}

export function validateCardSet(cardSet: CardSet): ValidationError[] {
  const errors: ValidationError[] = []

  for (const card of cardSet.cards) {
    const expected = expectedTokenCount(card)
    const actual = countPlayerTokens(card.instructionText)
    if (actual !== expected) {
      errors.push({
        cardId: card.id,
        message: `Card "${card.id}" has ${actual} {player} token(s) in instructionText, expected ${expected}`,
      })
    }

    if (card.type === 'virus') {
      const liftTokens = countPlayerTokens(card.liftText ?? '')
      if (liftTokens !== 1) {
        errors.push({
          cardId: card.id,
          message: `Virus card "${card.id}" has ${liftTokens} {player} token(s) in liftText, expected exactly 1`,
        })
      }
    }
  }

  const virusCardsByLiftText = new Map<string, Card[]>()
  for (const card of cardSet.cards) {
    if (card.type !== 'virus' || !card.liftText) continue
    const group = virusCardsByLiftText.get(card.liftText) ?? []
    group.push(card)
    virusCardsByLiftText.set(card.liftText, group)
  }
  for (const group of virusCardsByLiftText.values()) {
    if (group.length < 2) continue
    for (const card of group) {
      errors.push({
        cardId: card.id,
        message: `Virus card "${card.id}" shares its liftText with ${group.length - 1} other virus card(s); every virus's liftText must be unique`,
      })
    }
  }

  if (cardSet.cards.length < MIN_CARDS) {
    errors.push({
      message: `Card set "${cardSet.id}" has ${cardSet.cards.length} cards, expected at least ${MIN_CARDS}`,
    })
  }

  const virusCount = cardSet.cards.filter((c) => c.type === 'virus').length
  if (virusCount < MIN_VIRUS_CARDS) {
    errors.push({
      message: `Card set "${cardSet.id}" has ${virusCount} virus cards, expected at least ${MIN_VIRUS_CARDS}`,
    })
  }

  return errors
}
