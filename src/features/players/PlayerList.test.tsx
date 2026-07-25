import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PlayerList } from './PlayerList'
import type { Player } from './types'

const players: Player[] = [
  { id: 'a1', name: 'Yara', order: 0 },
  { id: 'b2', name: 'Tom', order: 1 },
  { id: 'c3', name: 'Kim', order: 2 },
]

describe('PlayerList', () => {
  it('renders every player in the list at once', () => {
    render(<PlayerList players={players} onRemove={vi.fn()} />)

    expect(screen.getByText('Yara')).toBeInTheDocument()
    expect(screen.getByText('Tom')).toBeInTheDocument()
    expect(screen.getByText('Kim')).toBeInTheDocument()
  })

  it('renders a remove control per player', () => {
    render(<PlayerList players={players} onRemove={vi.fn()} />)

    expect(screen.getAllByRole('button', { name: /verwijder/i })).toHaveLength(3)
  })

  it('calls onRemove with the id of the removed player', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<PlayerList players={players} onRemove={onRemove} />)

    await user.click(screen.getByRole('button', { name: /verwijder tom/i }))

    expect(onRemove).toHaveBeenCalledWith('b2')
  })
})
