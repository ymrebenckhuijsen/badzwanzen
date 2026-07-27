import type { Card } from './card.types'
import type { Player } from '../players/types'

export type TargetResolution = { ok: true; targetPlayerIds: string[] } | { ok: false }

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

export function resolveTargets(card: Card, players: Player[]): TargetResolution {
  if (card.targeting.kind === 'general') {
    return { ok: true, targetPlayerIds: players.map((p) => p.id) }
  }

  const { count } = card.targeting
  if (players.length < count) {
    return { ok: false }
  }

  return { ok: true, targetPlayerIds: pickRandom(players.map((p) => p.id), count) }
}
