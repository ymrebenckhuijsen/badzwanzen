import type { ActiveVirusEffect } from './virus.types'
import type { Player } from '../players/types'

interface ActiveVirusListProps {
  effects: ActiveVirusEffect[]
  players: Player[]
}

export function ActiveVirusList({ effects, players }: ActiveVirusListProps) {
  const activeByPlayer = new Map<string, ActiveVirusEffect[]>()
  for (const effect of effects) {
    if (effect.status !== 'active') continue
    const list = activeByPlayer.get(effect.targetPlayerId) ?? []
    list.push(effect)
    activeByPlayer.set(effect.targetPlayerId, list)
  }

  const rows = players
    .map((player) => ({ player, playerEffects: activeByPlayer.get(player.id) ?? [] }))
    .filter(({ playerEffects }) => playerEffects.length > 0)

  if (rows.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-label-bold text-on-surface-variant">
        ACTIEVE VIRUSSEN
      </span>
      <ul className="flex flex-col gap-2">
        {rows.map(({ player, playerEffects }) => (
          <li
            key={player.id}
            className="flex items-center gap-3 rounded-full bg-surface-container px-4 py-2 text-on-surface"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
              {player.name.charAt(0).toUpperCase()}
            </span>
            <span className="font-body text-body-lg flex-1 truncate">{player.name}</span>
            {playerEffects.length > 1 && (
              <span className="rounded-full bg-tertiary-container px-2 py-1 text-xs text-on-tertiary-container">
                ×{playerEffects.length}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
