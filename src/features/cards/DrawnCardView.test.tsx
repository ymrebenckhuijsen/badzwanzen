import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DrawnCardView } from './DrawnCardView'
import type { Card } from './card.types'
import type { Player } from '../players/types'

const players: Player[] = [
  { id: 'p-alice', name: 'Alice', order: 0 },
  { id: 'p-bob', name: 'Bob', order: 1 },
]

describe('DrawnCardView', () => {
  it('shows the OPDRACHT label and blue styling for a general assignment card', () => {
    const card: Card = {
      id: 'a1',
      type: 'assignment',
      targeting: { kind: 'general' },
      instructionText: 'Iedereen klapt drie keer',
    }

    const { container } = render(
      <DrawnCardView card={card} targetPlayerIds={players.map((p) => p.id)} players={players} />,
    )

    expect(screen.getByText('OPDRACHT')).toBeInTheDocument()
    expect(screen.getByText('Iedereen klapt drie keer')).toBeInTheDocument()
    expect(container.querySelector('.bg-primary-container')).not.toBeNull()
  })

  it('shows the SPEL label, green styling, and the resolved player name for a specific game card', () => {
    const card: Card = {
      id: 'g1',
      type: 'game',
      targeting: { kind: 'specific', count: 1 },
      instructionText: '{player} moet een dansje doen',
    }

    const { container } = render(
      <DrawnCardView card={card} targetPlayerIds={['p-alice']} players={players} />,
    )

    expect(screen.getByText('SPEL')).toBeInTheDocument()
    expect(screen.getByText('Alice moet een dansje doen')).toBeInTheDocument()
    expect(screen.queryByText('{player}')).not.toBeInTheDocument()
    expect(container.querySelector('.bg-secondary-container')).not.toBeNull()
  })

  it('shows the VIRUS label, red styling, and no separate target list for a specific virus card', () => {
    const card: Card = {
      id: 'v1',
      type: 'virus',
      targeting: { kind: 'specific', count: 1 },
      instructionText: '{player} mag niet meer met links drinken',
      liftText: '{player} is genezen',
    }

    const { container } = render(
      <DrawnCardView card={card} targetPlayerIds={['p-bob']} players={players} />,
    )

    expect(screen.getByText('VIRUS')).toBeInTheDocument()
    expect(screen.getByText('Bob mag niet meer met links drinken')).toBeInTheDocument()
    expect(screen.queryByText(/Targets:/i)).not.toBeInTheDocument()
    expect(container.querySelector('.bg-tertiary-container')).not.toBeNull()
  })

  it('never renders GELUKT or MISLUKT controls', () => {
    const card: Card = {
      id: 'a2',
      type: 'assignment',
      targeting: { kind: 'general' },
      instructionText: 'Iedereen klapt drie keer',
    }

    render(
      <DrawnCardView card={card} targetPlayerIds={players.map((p) => p.id)} players={players} />,
    )

    expect(screen.queryByText(/gelukt/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/mislukt/i)).not.toBeInTheDocument()
  })
})
