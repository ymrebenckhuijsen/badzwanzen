import { useState } from 'react'
import type { Player } from './features/players/types'
import { PlayerSetupScreen } from './features/players/PlayerSetupScreen'
import { buildSessionCardPool } from './features/cards/buildSessionCardPool'
import { CardSetSelectionScreen } from './features/cards/CardSetSelectionScreen'
import { useDrawPile } from './features/cards/useDrawPile'
import { DrawnCardView } from './features/cards/DrawnCardView'
import type { CardSet, DrawnCard, SessionCardPool } from './features/cards/card.types'
import { useVirusEffects } from './features/virus/useVirusEffects'
import { ActiveVirusList } from './features/virus/ActiveVirusList'
import { VirusLiftCard } from './features/virus/VirusLiftCard'
import type { ActiveVirusEffect } from './features/virus/virus.types'
import { EndOfGameScreen } from './features/end-of-game/EndOfGameScreen'

interface GameScreenProps {
  players: Player[]
  cardSet: CardSet
  onPlayAgain: () => void
  onChangePlayers: () => void
}

function GameScreen({ players, cardSet, onPlayAgain, onChangePlayers }: GameScreenProps) {
  const [pool] = useState<SessionCardPool>(() => buildSessionCardPool(cardSet))
  const { effects, startEffects, advanceOnAssignmentGameDraw, forceLiftAll } = useVirusEffects()
  const activeVirusCount = new Set(
    effects.filter((e) => e.status === 'active').map((e) => e.cardId),
  ).size
  const { draw, hasEnded } = useDrawPile(pool, cardSet, players, activeVirusCount)
  const [current, setCurrent] = useState<DrawnCard | null>(null)
  const [liftQueue, setLiftQueue] = useState<ActiveVirusEffect[]>([])

  function handleDraw() {
    const drawn = draw()
    setCurrent(drawn)

    if (!drawn) {
      // Pool just ran out (or already had) — force-lift any effects still active (FR-018).
      const forced = forceLiftAll()
      if (forced.length > 0) {
        setLiftQueue((prev) => [...prev, ...forced])
      }
      return
    }

    if (drawn.type === 'virus') {
      startEffects(drawn.cardId, drawn.targetPlayerIds, drawn.drawnAt)
    } else {
      const lifted = advanceOnAssignmentGameDraw()
      if (lifted.length > 0) {
        setLiftQueue((prev) => [...prev, ...lifted])
      }
    }
  }

  function handleAcknowledgeLift() {
    setLiftQueue((prev) => prev.slice(1))
  }

  const currentLift = liftQueue[0]
  const currentLiftCard = currentLift
    ? cardSet.cards.find((c) => c.id === currentLift.cardId)
    : null

  const currentCard = current ? cardSet.cards.find((c) => c.id === current.cardId) : null

  // Pending virus lifts (from FR-018's forced end-of-session lift) must be acknowledged first —
  // the end-of-game screen replaces the whole card-loop screen, so it only takes over once the
  // lift queue has drained.
  if (!currentLift && hasEnded) {
    return (
      <EndOfGameScreen players={players} onPlayAgain={onPlayAgain} onChangePlayers={onChangePlayers} />
    )
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col gap-6 bg-surface p-6 text-on-surface">
      <header className="pt-4 text-center">
        <h1 className="font-display text-headline-lg-mobile text-on-surface">Badzwanzen</h1>
      </header>

      {currentLift && currentLiftCard ? (
        <>
          <VirusLiftCard
            liftText={currentLiftCard.liftText ?? ''}
            targetPlayerId={currentLift.targetPlayerId}
            players={players}
          />
          <ActiveVirusList effects={effects} players={players} />
          <button
            type="button"
            onClick={handleAcknowledgeLift}
            className="mt-auto flex items-center justify-center gap-2 rounded-full border-b-4 border-secondary-fixed-dim bg-secondary-container px-6 py-4 font-display text-headline-lg-mobile text-on-secondary-container shadow-lg transition active:translate-y-0.5 active:border-b-2"
          >
            VERDER →
          </button>
        </>
      ) : (
        <>
          {current && currentCard && (
            <DrawnCardView
              card={currentCard}
              targetPlayerIds={current.targetPlayerIds}
              players={players}
            />
          )}

          <ActiveVirusList effects={effects} players={players} />

          <button
            type="button"
            onClick={handleDraw}
            className="mt-auto flex items-center justify-center gap-2 rounded-full border-b-4 border-primary-fixed-dim bg-primary-container px-6 py-4 font-display text-headline-lg-mobile text-on-primary-container shadow-lg transition active:translate-y-0.5 active:border-b-2"
          >
            VOLGENDE KAART →
          </button>
        </>
      )}
    </div>
  )
}

function App() {
  const [players, setPlayers] = useState<Player[] | null>(null)
  const [cardSet, setCardSet] = useState<CardSet | null>(null)
  const [sessionKey, setSessionKey] = useState(0)

  if (!players) {
    return <PlayerSetupScreen onStartGame={setPlayers} />
  }

  if (!cardSet) {
    return <CardSetSelectionScreen onContinue={setCardSet} />
  }

  return (
    <GameScreen
      key={sessionKey}
      players={players}
      cardSet={cardSet}
      onPlayAgain={() => setSessionKey((k) => k + 1)}
      onChangePlayers={() => {
        setPlayers(null)
        setCardSet(null)
      }}
    />
  )
}

export default App
