import { describe, expect, it } from 'vitest'
import type { CardSet } from '../card.types'
import { validateCardSet } from '../validateCardSet'
import { cardSetCatalog } from './card-set-catalog'
import { seedCardSet } from './seed-card-set'

describe('cardSetCatalog', () => {
  it('contains at least one card set', () => {
    expect(cardSetCatalog.length).toBeGreaterThanOrEqual(1)
  })

  it('every entry passes validateCardSet with zero errors', () => {
    for (const set of cardSetCatalog) {
      expect(validateCardSet(set)).toEqual([])
    }
  })

  it('no two entries share a name', () => {
    const names = cardSetCatalog.map((set) => set.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('cardSetCatalog (US2 — seed set always present)', () => {
  it('keeps the seed test set present even alongside several other sets', () => {
    const fixtureSets: CardSet[] = [
      { id: 'fixture-1', name: 'Fixture set 1', cards: [] },
      { id: 'fixture-2', name: 'Fixture set 2', cards: [] },
    ]
    const grownCatalog = [...cardSetCatalog, ...fixtureSets]

    expect(grownCatalog.some((set) => set.id === seedCardSet.id)).toBe(true)
  })
})
