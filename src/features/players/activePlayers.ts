import type { Player } from './types'

export function getActivePlayers(players: Player[]): Player[] {
  return players.filter((p) => p.status !== 'removed')
}
