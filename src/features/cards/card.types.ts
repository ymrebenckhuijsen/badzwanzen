export type CardType = 'assignment' | 'game' | 'virus'

export type TargetingRule = { kind: 'general' } | { kind: 'specific'; count: number }

export interface Card {
  id: string
  type: CardType
  instructionText: string
  liftText?: string
  targeting: TargetingRule
}

export interface CardSet {
  id: string
  name: string
  cards: Card[]
}

export interface SessionCardPool {
  poolCardIds: string[]
  remainingCardIds: string[]
  hasEnded: boolean
}

export interface DrawnCard {
  cardId: string
  type: CardType
  targetPlayerIds: string[]
  drawnAt: number
}
