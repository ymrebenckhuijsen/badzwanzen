import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActiveVirusList } from './ActiveVirusList'
import type { ActiveVirusEffect } from './virus.types'
import type { Player } from '../players/types'

const players: Player[] = [
  { id: 'p-bob', name: 'Bob', order: 0 },
  { id: 'p-chris', name: 'Chris', order: 1 },
  { id: 'p-dana', name: 'Dana', order: 2 },
]

function makeEffect(overrides: Partial<ActiveVirusEffect>): ActiveVirusEffect {
  return {
    id: 'effect-1',
    cardId: 'virus-1',
    targetPlayerId: 'p-bob',
    startedAtDraw: 0,
    liftThreshold: 10,
    assignmentGameDrawsSinceStart: 0,
    status: 'active',
    liftReason: null,
    ...overrides,
  }
}

describe('ActiveVirusList', () => {
  it('shows one row per affected player', () => {
    const effects = [
      makeEffect({ id: 'e1', targetPlayerId: 'p-bob' }),
      makeEffect({ id: 'e2', targetPlayerId: 'p-chris' }),
    ]

    render(<ActiveVirusList effects={effects} players={players} />)

    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Chris')).toBeInTheDocument()
    expect(screen.queryByText('Dana')).not.toBeInTheDocument()
  })

  it('shows a count badge only when a player has more than one active effect', () => {
    const effects = [
      makeEffect({ id: 'e1', targetPlayerId: 'p-bob' }),
      makeEffect({ id: 'e2', targetPlayerId: 'p-bob' }),
      makeEffect({ id: 'e3', targetPlayerId: 'p-chris' }),
    ]

    render(<ActiveVirusList effects={effects} players={players} />)

    expect(screen.getByText('×2')).toBeInTheDocument()
    expect(screen.queryByText('×1')).not.toBeInTheDocument()
  })

  it('excludes lifted effects from the display', () => {
    const effects = [
      makeEffect({ id: 'e1', targetPlayerId: 'p-bob', status: 'lifted', liftReason: 'threshold' }),
    ]

    render(<ActiveVirusList effects={effects} players={players} />)

    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })
})
