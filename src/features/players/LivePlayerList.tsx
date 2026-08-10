import { useState } from 'react'
import type { RemoveLivePlayerResult } from './usePlayers'
import type { Player } from './types'

interface LivePlayerListProps {
  players: Player[]
  onRetire: (id: string) => RemoveLivePlayerResult
  minPlayersReached: boolean
}

export function LivePlayerList({ players, onRetire, minPlayersReached }: LivePlayerListProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
      {players.map((player) => (
        <li
          key={player.id}
          className="flex items-center justify-between rounded-md bg-surface-container px-4 py-3 text-on-surface"
        >
          {confirmingId === player.id ? (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="font-body text-body-md truncate text-error">
                Verwijder {player.name}?
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingId(null)
                    onRetire(player.id)
                  }}
                  className="rounded-full bg-error px-3 py-1 font-display text-label-bold text-on-error"
                >
                  Ja
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingId(null)}
                  className="rounded-full bg-surface-container-high px-3 py-1 font-display text-label-bold text-on-surface"
                >
                  Nee
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="font-body text-body-lg truncate">{player.name}</span>
              <button
                type="button"
                aria-label={`Verwijder ${player.name}`}
                disabled={minPlayersReached}
                onClick={() => setConfirmingId(player.id)}
                className="flex size-8 items-center justify-center rounded-full text-lg text-error disabled:cursor-not-allowed disabled:text-on-surface-variant disabled:opacity-50"
              >
                &times;
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}
