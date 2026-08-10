import { getActivePlayers } from './activePlayers'
import { AddPlayerControl } from './AddPlayerControl'
import { LivePlayerList } from './LivePlayerList'
import type { AddPlayerResult, RemoveLivePlayerResult } from './usePlayers'
import type { Player } from './types'

const MIN_PLAYERS_TO_CONTINUE = 2
const MAX_PLAYERS = 20

interface LivePlayerManagementScreenProps {
  players: Player[]
  onAdd: (name: string) => AddPlayerResult
  onRetire: (id: string) => RemoveLivePlayerResult
  onClose: () => void
}

export function LivePlayerManagementScreen({
  players,
  onAdd,
  onRetire,
  onClose,
}: LivePlayerManagementScreenProps) {
  const activePlayers = getActivePlayers(players)
  const minPlayersReached = activePlayers.length <= MIN_PLAYERS_TO_CONTINUE

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col gap-6 bg-surface p-6 text-on-surface">
      <header className="flex items-center justify-between pt-4">
        <h1 className="font-display text-headline-lg-mobile text-on-surface">Spelers</h1>
        <button
          type="button"
          aria-label="Sluiten"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full text-2xl leading-none text-on-surface-variant"
        >
          &times;
        </button>
      </header>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-display text-label-bold text-on-surface-variant">
          <span>
            SPELERS ({activePlayers.length}/{MAX_PLAYERS})
          </span>
          {minPlayersReached && <span>Minimaal {MIN_PLAYERS_TO_CONTINUE} nodig</span>}
        </div>
        <LivePlayerList players={activePlayers} onRetire={onRetire} minPlayersReached={minPlayersReached} />
      </div>

      <AddPlayerControl onAdd={onAdd} />
    </div>
  )
}
