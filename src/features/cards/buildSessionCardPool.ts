import type { CardSet, SessionCardPool } from './card.types'

const MIN_POOL_SIZE = 60
const MAX_POOL_SIZE = 80
const MIN_VIRUS_IN_POOL = 4

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function buildSessionCardPool(cardSet: CardSet): SessionCardPool {
  const poolSize =
    MIN_POOL_SIZE + Math.floor(Math.random() * (MAX_POOL_SIZE - MIN_POOL_SIZE + 1))

  const virusIds = shuffle(cardSet.cards.filter((c) => c.type === 'virus').map((c) => c.id))
  const guaranteedVirusIds = virusIds.slice(0, MIN_VIRUS_IN_POOL)

  const remainingCandidateIds = shuffle(
    cardSet.cards.map((c) => c.id).filter((id) => !guaranteedVirusIds.includes(id)),
  )

  const fillCount = poolSize - guaranteedVirusIds.length
  const poolCardIds = shuffle([
    ...guaranteedVirusIds,
    ...remainingCandidateIds.slice(0, fillCount),
  ])

  return {
    poolCardIds,
    remainingCardIds: [...poolCardIds],
    hasEnded: false,
  }
}
