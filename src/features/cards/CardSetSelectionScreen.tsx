import { useEffect } from 'react'
import type { CardSet } from './card.types'
import { useCardSetSelection } from './useCardSetSelection'

interface CardSetSelectionScreenProps {
  onContinue: (cardSet: CardSet) => void
  catalog?: CardSet[]
}

export function CardSetSelectionScreen({ onContinue, catalog }: CardSetSelectionScreenProps) {
  const { sets, resolvedCardSet, select } = useCardSetSelection(catalog)

  useEffect(() => {
    if (sets.length === 1) {
      select(sets[0].id)
      onContinue(sets[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sets])

  if (sets.length === 1) {
    return null
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col gap-6 bg-surface p-6 text-on-surface">
      <header className="flex flex-col gap-1 pt-4 text-center">
        <h1 className="font-display text-headline-lg-mobile text-on-surface">Kaartenset</h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          Kies welke set kaarten deze sessie gebruikt.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {sets.map((set) => {
          const isSelected = set.id === resolvedCardSet.id
          return (
            <button
              key={set.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => select(set.id)}
              className={`flex items-center justify-between rounded-xl border-2 p-4 text-left transition ${
                isSelected
                  ? 'border-primary bg-surface-container-high'
                  : 'border-outline-variant bg-surface-container-low'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-body text-body-lg text-on-surface">{set.name}</span>
                <span className="font-display text-label-bold text-on-surface-variant">
                  {set.cards.length} kaarten
                </span>
              </div>
              <span
                className={`size-6 rounded-full border-2 ${
                  isSelected ? 'border-primary bg-primary' : 'border-outline'
                }`}
              />
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onContinue(resolvedCardSet)}
        className="mt-auto rounded-full border-b-4 border-secondary-fixed-dim bg-secondary-container px-6 py-4 font-display text-headline-lg-mobile text-on-secondary-container shadow-lg transition active:translate-y-0.5 active:border-b-2"
      >
        ▶ START SPEL
      </button>
    </div>
  )
}
