import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EndOfGameScreen } from './EndOfGameScreen'
import type { Player } from '../players/types'

function makePlayers(names: string[]): Player[] {
  return names.map((name, order) => ({ id: `p-${name}`, name, order }))
}

describe('EndOfGameScreen (US1)', () => {
  it('shows a heading and every player from the session', () => {
    const players = makePlayers(['Yara', 'Tom', 'Sam'])

    render(<EndOfGameScreen players={players} onPlayAgain={vi.fn()} onChangePlayers={vi.fn()} />)

    expect(screen.getByText(/potje afgelopen/i)).toBeInTheDocument()
    expect(screen.getByText('Yara')).toBeInTheDocument()
    expect(screen.getByText('Tom')).toBeInTheDocument()
    expect(screen.getByText('Sam')).toBeInTheDocument()
  })
})

describe('EndOfGameScreen (US2)', () => {
  it('calls onPlayAgain when "Speel opnieuw" is pressed', async () => {
    const user = userEvent.setup()
    const onPlayAgain = vi.fn()
    render(
      <EndOfGameScreen
        players={makePlayers(['Yara', 'Tom'])}
        onPlayAgain={onPlayAgain}
        onChangePlayers={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /speel opnieuw/i }))

    expect(onPlayAgain).toHaveBeenCalledTimes(1)
  })

  it('calls onChangePlayers when "Spelers wijzigen" is pressed', async () => {
    const user = userEvent.setup()
    const onChangePlayers = vi.fn()
    render(
      <EndOfGameScreen
        players={makePlayers(['Yara', 'Tom'])}
        onPlayAgain={vi.fn()}
        onChangePlayers={onChangePlayers}
      />,
    )

    await user.click(screen.getByRole('button', { name: /spelers wijzigen/i }))

    expect(onChangePlayers).toHaveBeenCalledTimes(1)
  })
})

describe('EndOfGameScreen landscape layout (feature 013)', () => {
  it('root container carries the landscape/short responsive classes', () => {
    const { container } = render(
      <EndOfGameScreen
        players={makePlayers(['Yara', 'Tom'])}
        onPlayAgain={vi.fn()}
        onChangePlayers={vi.fn()}
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
