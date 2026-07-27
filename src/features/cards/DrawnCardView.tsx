import type { Card } from './card.types'
import type { Player } from '../players/types'
import { renderCardText } from './renderCardText'

interface DrawnCardViewProps {
  card: Card
  targetPlayerIds: string[]
  players: Player[]
}

const MODE_CHIP: Record<Card['type'], { label: string; bg: string }> = {
  assignment: { label: 'OPDRACHT', bg: 'bg-primary-container' },
  game: { label: 'SPEL', bg: 'bg-secondary-container' },
  virus: { label: 'VIRUS', bg: 'bg-tertiary-container' },
}

export function DrawnCardView({ card, targetPlayerIds, players }: DrawnCardViewProps) {
  const { label, bg } = MODE_CHIP[card.type]

  const names = targetPlayerIds
    .map((id) => players.find((p) => p.id === id)?.name)
    .filter((name): name is string => Boolean(name))

  const text =
    card.targeting.kind === 'general'
      ? card.instructionText
      : renderCardText(card.instructionText, names)

  return (
    <div className={`${bg} rounded-xl p-6 text-on-primary-container`}>
      <div className="flex items-center gap-2">
        <span className="font-display text-label-bold rounded-full bg-surface/20 px-3 py-1 tracking-wide">
          {label}
        </span>
        {card.targeting.kind === 'general' && (
          <span className="font-display text-label-bold rounded-full bg-surface/20 px-3 py-1 tracking-wide">
            IEDEREEN
          </span>
        )}
      </div>
      <p className="font-display text-display-xl mt-4">{text}</p>
    </div>
  )
}
