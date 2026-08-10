import type { Player } from '../players/types'

interface EndOfGameScreenProps {
  players: Player[]
  onPlayAgain: () => void
  onChangePlayers: () => void
}

export function EndOfGameScreen({ players, onPlayAgain, onChangePlayers }: EndOfGameScreenProps) {
  return (
    <div className="mx-auto flex min-h-svh max-w-md landscape:max-w-2xl flex-col gap-6 overflow-y-auto bg-surface p-6 text-on-surface short:gap-3 short:p-4">
      <header className="flex flex-col items-center gap-2 pt-4 text-center">
        <span className="font-display text-label-bold w-fit rounded-full bg-tertiary-container px-3 py-1 text-on-tertiary-container">
          GAME OVER
        </span>
        <h1 className="font-display text-headline-lg-mobile text-on-surface">Potje afgelopen!</h1>
        <p className="font-body text-body-md text-on-surface-variant">
          Bedankt voor het spelen! 🎉
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-xl bg-surface-container-high p-4">
        <span className="font-display text-label-bold text-on-surface-variant">
          Wie deden er mee?
        </span>
        <ul className="flex flex-wrap gap-2">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-2 rounded-full bg-surface-container px-3 py-2 text-on-surface"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                {player.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-body text-body-md">{player.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onPlayAgain}
        className="mt-auto rounded-full border-b-4 border-primary-fixed-dim bg-primary-container px-6 py-4 font-display text-headline-lg-mobile text-on-primary-container shadow-lg transition active:translate-y-0.5 active:border-b-2"
      >
        SPEEL OPNIEUW
      </button>
      <button
        type="button"
        onClick={onChangePlayers}
        className="rounded-full border-b-4 border-outline-variant bg-surface-container-high px-6 py-3 font-body text-body-lg text-on-surface-variant transition active:translate-y-0.5 active:border-b-2"
      >
        Spelers wijzigen
      </button>
    </div>
  )
}
