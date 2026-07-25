import type { Player } from './types'
import { AddPlayerControl } from './AddPlayerControl'
import { PlayerList } from './PlayerList'
import { usePlayers } from './usePlayers'

const MIN_PLAYERS_TO_START = 2

interface PlayerSetupScreenProps {
  onStartGame?: (players: Player[]) => void
}

export function PlayerSetupScreen({ onStartGame }: PlayerSetupScreenProps = {}) {
  const { players, addPlayer, removePlayer } = usePlayers()
  const canStart = players.length >= MIN_PLAYERS_TO_START

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Spelers</h1>
      <PlayerList players={players} onRemove={removePlayer} />
      <AddPlayerControl onAdd={addPlayer} />
      <button
        type="button"
        aria-label="Spel starten"
        disabled={!canStart}
        onClick={() => onStartGame?.(players)}
        className="rounded bg-green-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        ▶
      </button>
    </div>
  )
}
