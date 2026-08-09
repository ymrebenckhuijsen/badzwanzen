import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { buildSessionCardPool } from './features/cards/buildSessionCardPool'

vi.mock('./features/cards/buildSessionCardPool')
const mockedBuildSessionCardPool = vi.mocked(buildSessionCardPool)

const CARD_A_TEXT = 'Iedereen neemt een slok van zijn drankje.' // opdracht-001

function onePlayerPool() {
  return { poolCardIds: ['opdracht-001'], remainingCardIds: ['opdracht-001'], hasEnded: false }
}

function twoCardPool() {
  return {
    poolCardIds: ['opdracht-001', 'opdracht-002'],
    remainingCardIds: ['opdracht-001', 'opdracht-002'],
    hasEnded: false,
  }
}

async function addPlayer(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: /speler toevoegen/i }))
  await user.type(screen.getByRole('textbox'), name)
  await user.click(screen.getByRole('button', { name: /bevestigen/i }))
}

async function startSession(user: ReturnType<typeof userEvent.setup>, names: string[]) {
  for (const name of names) {
    await addPlayer(user, name)
  }
  await user.click(screen.getByRole('button', { name: /spel starten/i }))
}

function draw(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole('button', { name: /volgende kaart/i }))
}

describe('App end-of-game screen (US1)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockedBuildSessionCardPool.mockReset()
  })

  it('shows a drawn card, not the end-of-game screen, while cards remain', async () => {
    mockedBuildSessionCardPool.mockReturnValue(twoCardPool())
    const user = userEvent.setup()
    render(<App />)

    await startSession(user, ['Yara', 'Tom'])
    await draw(user)

    expect(screen.getByText(CARD_A_TEXT)).toBeInTheDocument()
    expect(screen.queryByText(/potje afgelopen/i)).not.toBeInTheDocument()
  })

  it('shows the last card normally, then the end-of-game screen only on the next draw', async () => {
    mockedBuildSessionCardPool.mockReturnValue(onePlayerPool())
    const user = userEvent.setup()
    render(<App />)

    await startSession(user, ['Yara', 'Tom'])

    await draw(user)
    expect(screen.getByText(CARD_A_TEXT)).toBeInTheDocument()
    expect(screen.queryByText(/potje afgelopen/i)).not.toBeInTheDocument()

    await draw(user)
    expect(screen.getByText(/potje afgelopen/i)).toBeInTheDocument()
    expect(screen.getByText('Yara')).toBeInTheDocument()
    expect(screen.getByText('Tom')).toBeInTheDocument()
  })
})

describe('App end-of-game screen (US2)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockedBuildSessionCardPool.mockReset()
  })

  it('"Speel opnieuw" starts a fresh session with the same players', async () => {
    mockedBuildSessionCardPool.mockReturnValue(onePlayerPool())
    const user = userEvent.setup()
    render(<App />)

    await startSession(user, ['Yara', 'Tom'])
    await draw(user)
    await draw(user)
    expect(screen.getByText(/potje afgelopen/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /speel opnieuw/i }))

    expect(screen.queryByText(/potje afgelopen/i)).not.toBeInTheDocument()
    await draw(user)
    expect(screen.getByText(CARD_A_TEXT)).toBeInTheDocument()
  })

  it('"Spelers wijzigen" returns to player setup, pre-filled with the same players', async () => {
    mockedBuildSessionCardPool.mockReturnValue(onePlayerPool())
    const user = userEvent.setup()
    render(<App />)

    await startSession(user, ['Yara', 'Tom'])
    await draw(user)
    await draw(user)
    expect(screen.getByText(/potje afgelopen/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /spelers wijzigen/i }))

    expect(screen.getByRole('button', { name: /spel starten/i })).toBeInTheDocument()
    expect(screen.getByText('Yara')).toBeInTheDocument()
    expect(screen.getByText('Tom')).toBeInTheDocument()
  })
})
