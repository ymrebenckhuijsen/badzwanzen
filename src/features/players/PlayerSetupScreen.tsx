import { InstallButton } from '../pwa-install/InstallButton'
import type { Player } from './types'
import { AddPlayerControl } from './AddPlayerControl'
import { PlayerList } from './PlayerList'
import { usePlayers } from './usePlayers'

const MIN_PLAYERS_TO_START = 2
const MAX_PLAYERS = 20

interface PlayerSetupScreenProps {
  onStartGame?: (players: Player[]) => void
}

export function PlayerSetupScreen({ onStartGame }: PlayerSetupScreenProps = {}) {
  const { players, addPlayer, removePlayer } = usePlayers()
  const canStart = players.length >= MIN_PLAYERS_TO_START

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col gap-6 bg-surface p-6 text-on-surface">
      <header className="flex flex-col gap-1 pt-4 text-center">
        <h1 className="font-display text-headline-lg-mobile text-on-surface">Badzwanzen</h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          Wie durft er mee te doen?
        </p>
      </header>

      <InstallButton />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-display text-label-bold text-on-surface-variant">
          <span>
            SPELERS ({players.length}/{MAX_PLAYERS})
          </span>
          {!canStart && <span>Minimaal {MIN_PLAYERS_TO_START} nodig</span>}
        </div>
        <PlayerList players={players} onRemove={removePlayer} />
      </div>

      <AddPlayerControl onAdd={addPlayer} />

      <button
        type="button"
        aria-label="Spel starten"
        disabled={!canStart}
        onClick={() => onStartGame?.(players)}
        className="mt-auto rounded-full border-b-4 border-secondary-fixed-dim bg-secondary-container px-6 py-4 font-display text-headline-lg-mobile text-on-secondary-container shadow-lg transition active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:border-b-2 disabled:border-outline-variant disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:opacity-70"
      >
        ▶ START HET SPEL
      </button>
    </div>
  )
}
