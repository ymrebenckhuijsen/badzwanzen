import { useRef, useState } from 'react'
import type { CardSet, DrawnCard, SessionCardPool } from './card.types'
import type { Player } from '../players/types'
import { resolveTargets } from './resolveTargets'

export function useDrawPile(pool: SessionCardPool, cardSet: CardSet, players: Player[]) {
  const [remainingCardIds, setRemainingCardIds] = useState(pool.remainingCardIds)
  const [hasEnded, setHasEnded] = useState(pool.hasEnded)
  const drawCounter = useRef(0)

  function draw(): DrawnCard | null {
    let ids = remainingCardIds

    while (ids.length > 0) {
      const [nextId, ...rest] = ids
      const card = cardSet.cards.find((c) => c.id === nextId)

      if (!card) {
        ids = rest
        continue
      }

      const resolution = resolveTargets(card, players)
      if (!resolution.ok) {
        ids = rest
        continue
      }

      setRemainingCardIds(rest)
      const drawnAt = drawCounter.current++
      return {
        cardId: card.id,
        type: card.type,
        targetPlayerIds: resolution.targetPlayerIds,
        drawnAt,
      }
    }

    setRemainingCardIds([])
    setHasEnded(true)
    return null
  }

  return { draw, hasEnded, remainingCount: remainingCardIds.length }
}
