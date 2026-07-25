import type { Player } from '../features/players/types'

const STORAGE_KEY = 'badzwanzen:players'

export function getPlayers(): Player[] {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === null) return []

  try {
    return JSON.parse(raw) as Player[]
  } catch {
    return []
  }
}

export function setPlayers(players: Player[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
}
