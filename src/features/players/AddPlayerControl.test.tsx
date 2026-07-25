import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AddPlayerControl } from './AddPlayerControl'
import type { AddPlayerResult } from './usePlayers'

function renderControl(onAdd: (name: string) => AddPlayerResult) {
  return render(<AddPlayerControl onAdd={onAdd} />)
}

describe('AddPlayerControl', () => {
  it('does not show a name input until "+" is pressed', () => {
    renderControl(() => ({ ok: true }))

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /speler toevoegen/i })).toBeInTheDocument()
  })

  it('opens the name input after pressing "+"', async () => {
    const user = userEvent.setup()
    renderControl(() => ({ ok: true }))

    await user.click(screen.getByRole('button', { name: /speler toevoegen/i }))

    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onAdd with the typed name when confirmed', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn(() => ({ ok: true }) as AddPlayerResult)
    renderControl(onAdd)

    await user.click(screen.getByRole('button', { name: /speler toevoegen/i }))
    await user.type(screen.getByRole('textbox'), 'Yara')
    await user.click(screen.getByRole('button', { name: /bevestigen/i }))

    expect(onAdd).toHaveBeenCalledWith('Yara')
  })

  it('rejects an empty name without calling onAdd, showing a message', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn(() => ({ ok: true }) as AddPlayerResult)
    renderControl(onAdd)

    await user.click(screen.getByRole('button', { name: /speler toevoegen/i }))
    await user.click(screen.getByRole('button', { name: /bevestigen/i }))

    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/vul een naam in/i)
  })

  it('shows a duplicate-name message returned from onAdd', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn(() => ({ ok: false, reason: 'duplicate' }) as AddPlayerResult)
    renderControl(onAdd)

    await user.click(screen.getByRole('button', { name: /speler toevoegen/i }))
    await user.type(screen.getByRole('textbox'), 'Yara')
    await user.click(screen.getByRole('button', { name: /bevestigen/i }))

    expect(onAdd).toHaveBeenCalledWith('Yara')
    expect(screen.getByRole('alert')).toHaveTextContent(/bestaat al/i)
  })

  it('shows a max-reached message returned from onAdd', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn(() => ({ ok: false, reason: 'max' }) as AddPlayerResult)
    renderControl(onAdd)

    await user.click(screen.getByRole('button', { name: /speler toevoegen/i }))
    await user.type(screen.getByRole('textbox'), 'Yara')
    await user.click(screen.getByRole('button', { name: /bevestigen/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/maximum/i)
  })
})
