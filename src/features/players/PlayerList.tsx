import type { Player } from './types'

interface PlayerListProps {
  players: Player[]
  onRemove: (id: string) => void
}

export function PlayerList({ players, onRemove }: PlayerListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {players.map((player) => (
        <li
          key={player.id}
          className="flex items-center justify-between rounded border border-gray-200 px-3 py-2"
        >
          <span>{player.name}</span>
          <button
            type="button"
            aria-label={`Verwijder ${player.name}`}
            onClick={() => onRemove(player.id)}
            className="text-red-600"
          >
            &times;
          </button>
        </li>
      ))}
    </ul>
  )
}
