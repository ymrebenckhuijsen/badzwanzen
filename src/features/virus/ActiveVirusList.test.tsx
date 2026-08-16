import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ActiveVirusList } from './ActiveVirusList'
import type { ActiveVirusEffect } from './virus.types'
import type { Player } from '../players/types'
import type { Card, CardSet } from '../cards/card.types'

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

function makeCard(id: string, overrides: Partial<Card> = {}): Card {
  return {
    id,
    type: 'virus',
    instructionText: `Instructie voor ${id}`,
    liftText: `Einde van ${id}`,
    targeting: { kind: 'specific', count: 1 },
    ...overrides,
  }
}

const cardSet: CardSet = {
  id: 'set',
  name: 'Set',
  cards: [makeCard('virus-1')],
}

describe('ActiveVirusList', () => {
  it('shows one row per affected player', () => {
    const effects = [
      makeEffect({ id: 'e1', targetPlayerId: 'p-bob' }),
      makeEffect({ id: 'e2', targetPlayerId: 'p-chris' }),
    ]

    render(<ActiveVirusList effects={effects} players={players} cardSet={cardSet} />)

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

    render(<ActiveVirusList effects={effects} players={players} cardSet={cardSet} />)

    expect(screen.getByText('×2')).toBeInTheDocument()
    expect(screen.queryByText('×1')).not.toBeInTheDocument()
  })

  it('excludes lifted effects from the display', () => {
    const effects = [
      makeEffect({ id: 'e1', targetPlayerId: 'p-bob', status: 'lifted', liftReason: 'threshold' }),
    ]

    render(<ActiveVirusList effects={effects} players={players} cardSet={cardSet} />)

    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('groups a general-targeting virus into one shared "Iedereen" row instead of one per player', () => {
    const generalCardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [makeCard('virus-general', { targeting: { kind: 'general' } })],
    }
    const effects = [
      makeEffect({ id: 'e1', cardId: 'virus-general', targetPlayerId: 'p-bob' }),
      makeEffect({ id: 'e2', cardId: 'virus-general', targetPlayerId: 'p-chris' }),
      makeEffect({ id: 'e3', cardId: 'virus-general', targetPlayerId: 'p-dana' }),
    ]

    render(<ActiveVirusList effects={effects} players={players} cardSet={generalCardSet} />)

    expect(screen.getAllByText('Iedereen')).toHaveLength(1)
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    expect(screen.queryByText('Chris')).not.toBeInTheDocument()
    expect(screen.queryByText('Dana')).not.toBeInTheDocument()
  })

  it('shows a shared "Iedereen" row alongside a specific-player row, without merging or duplicating', () => {
    const mixedCardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [
        makeCard('virus-general', { targeting: { kind: 'general' } }),
        makeCard('virus-specific', { targeting: { kind: 'specific', count: 1 } }),
      ],
    }
    const effects = [
      makeEffect({ id: 'e1', cardId: 'virus-general', targetPlayerId: 'p-bob' }),
      makeEffect({ id: 'e2', cardId: 'virus-general', targetPlayerId: 'p-chris' }),
      makeEffect({ id: 'e3', cardId: 'virus-specific', targetPlayerId: 'p-dana' }),
    ]

    render(<ActiveVirusList effects={effects} players={players} cardSet={mixedCardSet} />)

    expect(screen.getAllByText('Iedereen')).toHaveLength(1)
    expect(screen.getByText('Dana')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    expect(screen.queryByText('Chris')).not.toBeInTheDocument()
  })

  it('shows no instruction text before any row is tapped', () => {
    const effects = [makeEffect({ id: 'e1', targetPlayerId: 'p-bob' })]

    render(<ActiveVirusList effects={effects} players={players} cardSet={cardSet} />)

    expect(screen.queryByText('Instructie voor virus-1')).not.toBeInTheDocument()
  })

  it('reveals a specific-player row\'s instructionText (not liftText) when tapped', async () => {
    const user = userEvent.setup()
    const effects = [makeEffect({ id: 'e1', targetPlayerId: 'p-bob' })]

    render(<ActiveVirusList effects={effects} players={players} cardSet={cardSet} />)

    await user.click(screen.getByText('Bob'))

    expect(screen.getByText('Instructie voor virus-1')).toBeInTheDocument()
    expect(screen.queryByText('Einde van virus-1')).not.toBeInTheDocument()
  })

  it('reveals the shared "Iedereen" row\'s instructionText when tapped', async () => {
    const user = userEvent.setup()
    const generalCardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [makeCard('virus-general', { targeting: { kind: 'general' } })],
    }
    const effects = [
      makeEffect({ id: 'e1', cardId: 'virus-general', targetPlayerId: 'p-bob' }),
      makeEffect({ id: 'e2', cardId: 'virus-general', targetPlayerId: 'p-chris' }),
    ]

    render(<ActiveVirusList effects={effects} players={players} cardSet={generalCardSet} />)

    await user.click(screen.getByText('Iedereen'))

    expect(screen.getByText('Instructie voor virus-general')).toBeInTheDocument()
  })

  it('reveals instructionText for every effect on a row with multiple simultaneous effects (×N)', async () => {
    const user = userEvent.setup()
    const twoCardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [makeCard('virus-1'), makeCard('virus-2')],
    }
    const effects = [
      makeEffect({ id: 'e1', cardId: 'virus-1', targetPlayerId: 'p-bob' }),
      makeEffect({ id: 'e2', cardId: 'virus-2', targetPlayerId: 'p-bob' }),
    ]

    render(<ActiveVirusList effects={effects} players={players} cardSet={twoCardSet} />)

    await user.click(screen.getByText('Bob'))

    expect(screen.getByText('Instructie voor virus-1')).toBeInTheDocument()
    expect(screen.getByText('Instructie voor virus-2')).toBeInTheDocument()
  })

  it('substitutes the {player} token in a specific-targeting card\'s instructionText with the actual player name when tapped', async () => {
    const user = userEvent.setup()
    const tokenCardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [
        makeCard('virus-token', {
          instructionText: '{player} moet vanaf nu fluisteren.',
          targeting: { kind: 'specific', count: 1 },
        }),
      ],
    }
    const effects = [makeEffect({ id: 'e1', cardId: 'virus-token', targetPlayerId: 'p-bob' })]

    render(<ActiveVirusList effects={effects} players={players} cardSet={tokenCardSet} />)

    await user.click(screen.getByText('Bob'))

    expect(screen.getByText('Bob moet vanaf nu fluisteren.')).toBeInTheDocument()
    expect(screen.queryByText('{player} moet vanaf nu fluisteren.')).not.toBeInTheDocument()
  })

  it('substitutes every {player} token using all currently-targeted players, even when tapping just one of their rows', async () => {
    const user = userEvent.setup()
    const multiCardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [
        makeCard('virus-multi', {
          instructionText: '{player} en {player} moeten stoeien.',
          targeting: { kind: 'specific', count: 2 },
        }),
      ],
    }
    const effects = [
      makeEffect({ id: 'e1', cardId: 'virus-multi', targetPlayerId: 'p-bob' }),
      makeEffect({ id: 'e2', cardId: 'virus-multi', targetPlayerId: 'p-chris' }),
    ]

    render(<ActiveVirusList effects={effects} players={players} cardSet={multiCardSet} />)

    await user.click(screen.getByText('Bob'))

    expect(screen.getByText('Bob en Chris moeten stoeien.')).toBeInTheDocument()
  })

  it('collapses an expanded row when tapped again', async () => {
    const user = userEvent.setup()
    const effects = [makeEffect({ id: 'e1', targetPlayerId: 'p-bob' })]

    render(<ActiveVirusList effects={effects} players={players} cardSet={cardSet} />)

    await user.click(screen.getByText('Bob'))
    expect(screen.getByText('Instructie voor virus-1')).toBeInTheDocument()

    await user.click(screen.getByText('Bob'))
    expect(screen.queryByText('Instructie voor virus-1')).not.toBeInTheDocument()
  })
})
