import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VirusLiftCard } from './VirusLiftCard'
import type { Player } from '../players/types'

const players: Player[] = [{ id: 'p-bob', name: 'Bob', order: 0 }]

describe('VirusLiftCard', () => {
  it('renders the lift text with its {player} token replaced by the target player name', () => {
    render(
      <VirusLiftCard
        liftText="{player} mag weer gewoon met links drinken."
        targetPlayerId="p-bob"
        players={players}
      />,
    )

    expect(
      screen.getByText('Bob mag weer gewoon met links drinken.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('{player}')).not.toBeInTheDocument()
  })
})
