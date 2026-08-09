import type { Player } from '../players/types'
import { renderCardText } from '../cards/renderCardText'

interface VirusLiftCardProps {
  liftText: string
  targetPlayerId: string
  players: Player[]
}

export function VirusLiftCard({ liftText, targetPlayerId, players }: VirusLiftCardProps) {
  const name = players.find((p) => p.id === targetPlayerId)?.name ?? ''

  return (
    <div className="rounded-xl border-2 border-secondary bg-surface-container-high p-6 text-on-surface">
      <span className="font-display text-label-bold rounded-full bg-secondary-container px-3 py-1 tracking-wide text-on-secondary-container">
        VIRUS OPGEHEVEN
      </span>
      <p className="font-display text-display-xl mt-4">{renderCardText(liftText, [name])}</p>
    </div>
  )
}
