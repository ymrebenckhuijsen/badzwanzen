import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PlayerSetupScreen } from './PlayerSetupScreen'

async function addPlayer(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: /speler toevoegen/i }))
  await user.type(screen.getByRole('textbox'), name)
  await user.click(screen.getByRole('button', { name: /bevestigen/i }))
}

describe('PlayerSetupScreen (US1)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows a newly added player in the list', async () => {
    const user = userEvent.setup()
    render(<PlayerSetupScreen />)

    await addPlayer(user, 'Yara')

    expect(screen.getByText('Yara')).toBeInTheDocument()
  })

  it('shows both players after adding a second one', async () => {
    const user = userEvent.setup()
    render(<PlayerSetupScreen />)

    await addPlayer(user, 'Yara')
    await addPlayer(user, 'Tom')

    expect(screen.getByText('Yara')).toBeInTheDocument()
    expect(screen.getByText('Tom')).toBeInTheDocument()
  })
})

describe('PlayerSetupScreen (US3)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('disables the play button with 0 players', () => {
    render(<PlayerSetupScreen />)

    expect(screen.getByRole('button', { name: /spel starten/i })).toBeDisabled()
  })

  it('disables the play button with only 1 player', async () => {
    const user = userEvent.setup()
    render(<PlayerSetupScreen />)

    await addPlayer(user, 'Yara')

    expect(screen.getByRole('button', { name: /spel starten/i })).toBeDisabled()
  })

  it('enables the play button once 2 players are added', async () => {
    const user = userEvent.setup()
    render(<PlayerSetupScreen />)

    await addPlayer(user, 'Yara')
    await addPlayer(user, 'Tom')

    expect(screen.getByRole('button', { name: /spel starten/i })).toBeEnabled()
  })

  it('invokes onStartGame with the current player list when pressed', async () => {
    const user = userEvent.setup()
    const onStartGame = vi.fn()
    render(<PlayerSetupScreen onStartGame={onStartGame} />)

    await addPlayer(user, 'Yara')
    await addPlayer(user, 'Tom')
    await user.click(screen.getByRole('button', { name: /spel starten/i }))

    expect(onStartGame).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Yara' }),
      expect.objectContaining({ name: 'Tom' }),
    ])
  })
})
