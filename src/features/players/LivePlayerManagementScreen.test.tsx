import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LivePlayerManagementScreen } from './LivePlayerManagementScreen'
import type { AddPlayerResult, RemoveLivePlayerResult } from './usePlayers'
import type { Player } from './types'

function makePlayers(names: string[]): Player[] {
  return names.map((name, order) => ({ id: `p-${name}`, name, order, status: 'active' }))
}

async function openAddForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /speler toevoegen/i }))
}

describe('LivePlayerManagementScreen (US1)', () => {
  it('renders a "Spelers" heading, the active player count, and every active player', () => {
    render(
      <LivePlayerManagementScreen
        players={makePlayers(['Yara', 'Tom', 'Mila'])}
        onAdd={vi.fn()}
        onRetire={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: /spelers/i })).toBeInTheDocument()
    expect(screen.getByText('SPELERS (3/20)')).toBeInTheDocument()
    expect(screen.getByText('Yara')).toBeInTheDocument()
    expect(screen.getByText('Tom')).toBeInTheDocument()
    expect(screen.getByText('Mila')).toBeInTheDocument()
  })

  it('excludes players with status "removed" from the visible list and count', () => {
    const players = makePlayers(['Yara', 'Tom'])
    players.push({ id: 'p-Mila', name: 'Mila', order: 2, status: 'removed' })

    render(<LivePlayerManagementScreen players={players} onAdd={vi.fn()} onRetire={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByText('SPELERS (2/20)')).toBeInTheDocument()
    expect(screen.queryByText('Mila')).not.toBeInTheDocument()
  })

  it('calls onAdd with the entered name via the same "+" flow used pre-game (FR-001)', async () => {
    const onAdd = vi.fn().mockReturnValue({ ok: true })
    const user = userEvent.setup()
    render(<LivePlayerManagementScreen players={makePlayers(['Yara'])} onAdd={onAdd} onRetire={vi.fn()} onClose={vi.fn()} />)

    await openAddForm(user)
    await user.type(screen.getByRole('textbox'), 'Nieuwkomer')
    await user.click(screen.getByRole('button', { name: /bevestigen/i }))

    expect(onAdd).toHaveBeenCalledWith('Nieuwkomer')
  })

  it('surfaces the same duplicate-name error copy used pre-game (US1 AC2, FR-002)', async () => {
    const onAdd = vi.fn().mockReturnValue({ ok: false, reason: 'duplicate' })
    const user = userEvent.setup()
    render(<LivePlayerManagementScreen players={makePlayers(['Yara'])} onAdd={onAdd} onRetire={vi.fn()} onClose={vi.fn()} />)

    await openAddForm(user)
    await user.type(screen.getByRole('textbox'), 'Yara')
    await user.click(screen.getByRole('button', { name: /bevestigen/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('Deze naam bestaat al.')
  })

  it('surfaces the same max-players error copy used pre-game (US1 AC3, FR-002)', async () => {
    const onAdd = vi.fn().mockReturnValue({ ok: false, reason: 'max' })
    const user = userEvent.setup()
    render(<LivePlayerManagementScreen players={makePlayers(['Yara'])} onAdd={onAdd} onRetire={vi.fn()} onClose={vi.fn()} />)

    await openAddForm(user)
    await user.type(screen.getByRole('textbox'), 'Iemand')
    await user.click(screen.getByRole('button', { name: /bevestigen/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('Maximum van 20 spelers bereikt.')
  })

  it('calls onClose when the close action is used', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<LivePlayerManagementScreen players={makePlayers(['Yara', 'Tom'])} onAdd={vi.fn()} onRetire={vi.fn()} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /sluiten/i }))

    expect(onClose).toHaveBeenCalled()
  })
})

describe('LivePlayerManagementScreen (US2)', () => {
  it('removes a player from the visible list when their removal is confirmed', async () => {
    const onRetire = vi.fn().mockReturnValue({ ok: true })
    const user = userEvent.setup()
    render(
      <LivePlayerManagementScreen
        players={makePlayers(['Yara', 'Tom', 'Mila'])}
        onAdd={vi.fn()}
        onRetire={onRetire}
        onClose={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /verwijder tom/i }))
    await user.click(screen.getByRole('button', { name: /^ja$/i }))

    expect(onRetire).toHaveBeenCalled()
  })

  it('passes minPlayersReached to disable removal once only 2 active players remain (FR-009)', () => {
    render(
      <LivePlayerManagementScreen
        players={makePlayers(['Yara', 'Tom'])}
        onAdd={vi.fn()}
        onRetire={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /verwijder yara/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /verwijder tom/i })).toBeDisabled()
  })
})

function StatefulWrapper({ initialPlayers }: { initialPlayers: Player[] }) {
  const [players, setPlayers] = useState(initialPlayers)

  function onAdd(name: string): AddPlayerResult {
    setPlayers((prev) => [...prev, { id: `p-${name}`, name, order: prev.length, status: 'active' }])
    return { ok: true }
  }

  function onRetire(id: string): RemoveLivePlayerResult {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'removed' } : p)))
    return { ok: true }
  }

  return <LivePlayerManagementScreen players={players} onAdd={onAdd} onRetire={onRetire} onClose={vi.fn()} />
}

describe('LivePlayerManagementScreen (US3)', () => {
  it('reflects an add immediately followed by a remove, with no unmount/remount (FR-011)', async () => {
    const user = userEvent.setup()
    render(<StatefulWrapper initialPlayers={makePlayers(['Yara', 'Tom'])} />)

    expect(screen.getByText('SPELERS (2/20)')).toBeInTheDocument()

    await openAddForm(user)
    await user.type(screen.getByRole('textbox'), 'Nieuwkomer')
    await user.click(screen.getByRole('button', { name: /bevestigen/i }))

    expect(screen.getByText('SPELERS (3/20)')).toBeInTheDocument()
    expect(screen.getByText('Nieuwkomer')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /verwijder nieuwkomer/i }))
    await user.click(screen.getByRole('button', { name: /^ja$/i }))

    expect(screen.getByText('SPELERS (2/20)')).toBeInTheDocument()
    expect(screen.queryByText('Nieuwkomer')).not.toBeInTheDocument()
  })
})

describe('LivePlayerManagementScreen landscape layout (feature 013)', () => {
  it('root container carries the landscape/short responsive classes', () => {
    const { container } = render(
      <LivePlayerManagementScreen
        players={makePlayers(['Yara', 'Tom'])}
        onAdd={vi.fn()}
        onRetire={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(container.firstChild).toHaveClass(
      'min-h-svh',
      'max-w-md',
      'landscape:max-w-2xl',
      'overflow-y-auto',
      'short:gap-3',
      'short:p-4',
    )
  })
})
