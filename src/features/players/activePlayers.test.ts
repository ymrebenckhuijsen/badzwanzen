import { describe, expect, it } from 'vitest'
import { getActivePlayers } from './activePlayers'
import type { Player } from './types'

describe('getActivePlayers', () => {
  it('excludes players with status "removed"', () => {
    const players: Player[] = [
      { id: 'a', name: 'Anna', order: 0, status: 'active' },
      { id: 'b', name: 'Bram', order: 1, status: 'removed' },
    ]

    expect(getActivePlayers(players)).toEqual([players[0]])
  })

  it('includes players with status "active" or no status field at all', () => {
    const players: Player[] = [
      { id: 'a', name: 'Anna', order: 0, status: 'active' },
      { id: 'b', name: 'Bram', order: 1 },
    ]

    expect(getActivePlayers(players)).toEqual(players)
  })
})
