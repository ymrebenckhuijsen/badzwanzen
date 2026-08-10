import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LivePlayerList } from './LivePlayerList'
import type { Player } from './types'

function makePlayers(names: string[]): Player[] {
  return names.map((name, order) => ({ id: `p-${name}`, name, order, status: 'active' }))
}

describe('LivePlayerList (US2)', () => {
  it('shows an inline confirmation instead of removing immediately when a delete icon is tapped (FR-008)', async () => {
    const onRetire = vi.fn().mockReturnValue({ ok: true })
    const user = userEvent.setup()
    render(
      <LivePlayerList
        players={makePlayers(['Yara', 'Tom', 'Mila'])}
        onRetire={onRetire}
        minPlayersReached={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: /verwijder mila/i }))

    expect(screen.getByText(/verwijder mila\?/i)).toBeInTheDocument()
    expect(onRetire).not.toHaveBeenCalled()
    // Other rows are unaffected.
    expect(screen.queryByText(/verwijder yara\?/i)).not.toBeInTheDocument()
  })

  it('cancels without calling onRetire when "Nee" is tapped', async () => {
    const onRetire = vi.fn()
    const user = userEvent.setup()
    render(
      <LivePlayerList
        players={makePlayers(['Yara', 'Tom'])}
        onRetire={onRetire}
        minPlayersReached={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: /verwijder yara/i }))
    await user.click(screen.getByRole('button', { name: /^nee$/i }))

    expect(onRetire).not.toHaveBeenCalled()
    expect(screen.queryByText(/verwijder yara\?/i)).not.toBeInTheDocument()
    expect(screen.getByText('Yara')).toBeInTheDocument()
  })

  it('calls onRetire with the player id when "Ja" is tapped', async () => {
    const onRetire = vi.fn().mockReturnValue({ ok: true })
    const user = userEvent.setup()
    const players = makePlayers(['Yara', 'Tom'])
    render(<LivePlayerList players={players} onRetire={onRetire} minPlayersReached={false} />)

    await user.click(screen.getByRole('button', { name: /verwijder yara/i }))
    await user.click(screen.getByRole('button', { name: /^ja$/i }))

    expect(onRetire).toHaveBeenCalledWith(players[0].id)
  })

  it('disables every delete icon and does not open confirmation when minPlayersReached (FR-009)', async () => {
    const onRetire = vi.fn()
    const user = userEvent.setup()
    render(
      <LivePlayerList
        players={makePlayers(['Yara', 'Tom'])}
        onRetire={onRetire}
        minPlayersReached
      />,
    )

    const deleteButton = screen.getByRole('button', { name: /verwijder yara/i })
    expect(deleteButton).toBeDisabled()

    await user.click(deleteButton)

    expect(screen.queryByText(/verwijder yara\?/i)).not.toBeInTheDocument()
    expect(onRetire).not.toHaveBeenCalled()
  })
})
