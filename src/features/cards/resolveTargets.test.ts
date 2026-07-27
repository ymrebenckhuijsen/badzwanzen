import { describe, expect, it } from 'vitest'
import { resolveTargets } from './resolveTargets'
import type { Card } from './card.types'
import type { Player } from '../players/types'

function makePlayers(names: string[]): Player[] {
  return names.map((name, order) => ({ id: `p-${name}`, name, order }))
}

function makeCard(overrides: Partial<Card> & Pick<Card, 'targeting'>): Card {
  return {
    id: 'card-1',
    type: 'assignment',
    instructionText: '',
    ...overrides,
  }
}

describe('resolveTargets', () => {
  it('resolves a general card to all current player ids', () => {
    const players = makePlayers(['Alice', 'Bob', 'Chris'])
    const result = resolveTargets(makeCard({ targeting: { kind: 'general' } }), players)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.targetPlayerIds.sort()).toEqual(players.map((p) => p.id).sort())
    }
  })

  it('resolves a specific card to exactly count randomly-chosen player ids', () => {
    const players = makePlayers(['Alice', 'Bob', 'Chris'])
    const result = resolveTargets(
      makeCard({ targeting: { kind: 'specific', count: 2 } }),
      players,
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.targetPlayerIds).toHaveLength(2)
      expect(new Set(result.targetPlayerIds).size).toBe(2)
      const allIds = new Set(players.map((p) => p.id))
      expect(result.targetPlayerIds.every((id) => allIds.has(id))).toBe(true)
    }
  })

  it('reports unresolvable when a specific card needs more targets than available players', () => {
    const players = makePlayers(['Alice', 'Bob'])
    const result = resolveTargets(
      makeCard({ targeting: { kind: 'specific', count: 3 } }),
      players,
    )

    expect(result.ok).toBe(false)
  })
})
