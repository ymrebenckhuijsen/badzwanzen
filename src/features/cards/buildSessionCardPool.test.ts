import { describe, expect, it } from 'vitest'
import { buildSessionCardPool } from './buildSessionCardPool'
import { seedCardSet } from './data/seed-card-set'

describe('buildSessionCardPool', () => {
  it('produces a pool sized between 60 and 80 cards, inclusive', () => {
    for (let i = 0; i < 20; i++) {
      const pool = buildSessionCardPool(seedCardSet)
      expect(pool.poolCardIds.length).toBeGreaterThanOrEqual(60)
      expect(pool.poolCardIds.length).toBeLessThanOrEqual(80)
    }
  })

  it('always includes at least 4 virus card ids', () => {
    const virusIds = new Set(
      seedCardSet.cards.filter((c) => c.type === 'virus').map((c) => c.id),
    )

    for (let i = 0; i < 20; i++) {
      const pool = buildSessionCardPool(seedCardSet)
      const virusInPool = pool.poolCardIds.filter((id) => virusIds.has(id))
      expect(virusInPool.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('only includes ids that exist in the given card set', () => {
    const allIds = new Set(seedCardSet.cards.map((c) => c.id))
    const pool = buildSessionCardPool(seedCardSet)
    expect(pool.poolCardIds.every((id) => allIds.has(id))).toBe(true)
  })

  it('never includes duplicate ids', () => {
    const pool = buildSessionCardPool(seedCardSet)
    expect(new Set(pool.poolCardIds).size).toBe(pool.poolCardIds.length)
  })

  it('initializes remainingCardIds equal to poolCardIds and hasEnded to false', () => {
    const pool = buildSessionCardPool(seedCardSet)
    expect(pool.remainingCardIds).toEqual(pool.poolCardIds)
    expect(pool.hasEnded).toBe(false)
  })

  it('produces different pools across repeated calls on the same card set', () => {
    const sizes = new Set<number>()
    const compositions = new Set<string>()
    for (let i = 0; i < 15; i++) {
      const pool = buildSessionCardPool(seedCardSet)
      sizes.add(pool.poolCardIds.length)
      compositions.add([...pool.poolCardIds].sort().join(','))
    }
    expect(sizes.size).toBeGreaterThan(1)
    expect(compositions.size).toBeGreaterThan(1)
  })
})
