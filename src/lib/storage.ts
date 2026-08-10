import type { Player } from '../features/players/types'

const STORAGE_KEY = 'badzwanzen:players'
const CARD_SET_STORAGE_KEY = 'badzwanzen:selected-card-set-id'

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

export function getSelectedCardSetId(): string | null {
  return window.localStorage.getItem(CARD_SET_STORAGE_KEY)
}

export function setSelectedCardSetId(id: string): void {
  window.localStorage.setItem(CARD_SET_STORAGE_KEY, id)
}
