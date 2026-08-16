import { useRef, useState } from 'react'
import type { CardSet, DrawnCard, SessionCardPool } from './card.types'
import type { Player } from '../players/types'
import { resolveTargets } from './resolveTargets'

const MAX_ACTIVE_VIRUSES = 3

export function useDrawPile(
  pool: SessionCardPool,
  cardSet: CardSet,
  players: Player[],
  activeVirusCount: number,
) {
  const [remainingCardIds, setRemainingCardIds] = useState(pool.remainingCardIds)
  const [hasEnded, setHasEnded] = useState(pool.hasEnded)
  const drawCounter = useRef(0)

  function draw(): DrawnCard | null {
    for (let i = 0; i < remainingCardIds.length; i++) {
      const id = remainingCardIds[i]
      const card = cardSet.cards.find((c) => c.id === id)

      if (!card) continue
      if (card.type === 'virus' && activeVirusCount >= MAX_ACTIVE_VIRUSES) continue

      const resolution = resolveTargets(card, players)
      if (!resolution.ok) continue

      // Remove only the drawn card's id — every other candidate scanned this call (skipped for
      // failing resolveTargets or for the virus cap) is retained, not discarded (FR-004).
      setRemainingCardIds(remainingCardIds.filter((_, idx) => idx !== i))
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
