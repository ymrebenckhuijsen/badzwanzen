import type { Player } from './types'

interface PlayerListProps {
  players: Player[]
  onRemove: (id: string) => void
}

export function PlayerList({ players, onRemove }: PlayerListProps) {
  return (
    <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
      {players.map((player) => (
        <li
          key={player.id}
          className="flex items-center justify-between rounded-md bg-surface-container px-4 py-3 text-on-surface"
        >
          <span className="font-body text-body-lg truncate">{player.name}</span>
          <button
            type="button"
            aria-label={`Verwijder ${player.name}`}
            onClick={() => onRemove(player.id)}
            className="flex size-8 items-center justify-center rounded-full text-lg text-error"
          >
            &times;
          </button>
        </li>
      ))}
    </ul>
  )
}
