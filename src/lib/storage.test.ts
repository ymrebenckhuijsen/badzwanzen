import { beforeEach, describe, expect, it } from 'vitest'
import type { Player } from '../features/players/types'
import { getPlayers, setPlayers } from './storage'

const STORAGE_KEY = 'badzwanzen:players'

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty array when nothing is stored yet', () => {
    expect(getPlayers()).toEqual([])
  })

  it('round-trips a player list through window.localStorage', () => {
    const players: Player[] = [
      { id: 'a1', name: 'Yara', order: 0 },
      { id: 'd4', name: 'Tom', order: 1 },
    ]

    setPlayers(players)

    expect(getPlayers()).toEqual(players)
  })

  it('persists under the badzwanzen:players key', () => {
    const players: Player[] = [{ id: 'a1', name: 'Yara', order: 0 }]

    setPlayers(players)

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual(players)
  })

  it('returns an empty array when the stored value is not valid JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json')

    expect(getPlayers()).toEqual([])
  })
})
