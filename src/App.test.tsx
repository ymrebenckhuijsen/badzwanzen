import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { buildSessionCardPool } from './features/cards/buildSessionCardPool'
import type { Card, CardSet } from './features/cards/card.types'
import { cardSetCatalog } from './features/cards/data/card-set-catalog'
import { seedCardSet } from './features/cards/data/seed-card-set'

vi.mock('./features/cards/buildSessionCardPool')
const mockedBuildSessionCardPool = vi.mocked(buildSessionCardPool)

vi.mock('./features/cards/data/card-set-catalog', () => ({ cardSetCatalog: [] as CardSet[] }))

function twoSetCatalog(): CardSet[] {
  return [
    {
      id: 'seed',
      name: 'Seed testset',
      cards: [
        {
          id: 'seed-001',
          type: 'assignment',
          targeting: { kind: 'general' },
          instructionText: 'Seed fixture card',
        },
      ],
    },
    {
      id: 'friends',
      name: 'Vrienden editie',
      cards: [
        {
          id: 'friends-001',
          type: 'assignment',
          targeting: { kind: 'general' },
          instructionText: 'Vrienden fixture card',
        },
      ],
    },
  ]
}

function setCatalog(sets: CardSet[]) {
  cardSetCatalog.length = 0
  cardSetCatalog.push(...sets)
}

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

// Default catalog for every test below: a single entry (the real seed set), so
// CardSetSelectionScreen auto-skips and tests that don't care about card-set choice keep
// behaving exactly as they did before feature 010 (FR-007). Tests that DO care override this
// via setCatalog(...) in their own beforeEach/body.
beforeEach(() => {
  setCatalog([seedCardSet])
})

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

describe('App card-set selection (US1, feature 010)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockedBuildSessionCardPool.mockReset()
    setCatalog(twoSetCatalog())
  })

  it('shows the card-set selection screen before the first draw, and draws only from the chosen set', async () => {
    mockedBuildSessionCardPool.mockReturnValue({
      poolCardIds: ['friends-001'],
      remainingCardIds: ['friends-001'],
      hasEnded: false,
    })
    const user = userEvent.setup()
    render(<App />)

    await startSession(user, ['Yara', 'Tom'])

    expect(screen.getByText('Kaartenset')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /volgende kaart/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /vrienden editie/i }))
    await user.click(screen.getByRole('button', { name: /start spel/i }))

    expect(mockedBuildSessionCardPool).toHaveBeenCalledWith(expect.objectContaining({ id: 'friends' }))

    await draw(user)
    expect(screen.getByText('Vrienden fixture card')).toBeInTheDocument()
  })

  it('skips the selection screen and starts immediately when only one set is available', async () => {
    setCatalog([seedCardSet])
    mockedBuildSessionCardPool.mockReturnValue(onePlayerPool())
    const user = userEvent.setup()
    render(<App />)

    await startSession(user, ['Yara', 'Tom'])

    expect(screen.queryByText('Kaartenset')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /volgende kaart/i })).toBeInTheDocument()
  })
})

describe('App card-set selection lock across replay (US1, FR-012)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockedBuildSessionCardPool.mockReset()
    setCatalog(twoSetCatalog())
  })

  async function playToEndOfGameWithFriendsSet(user: ReturnType<typeof userEvent.setup>) {
    mockedBuildSessionCardPool.mockReturnValue({
      poolCardIds: ['friends-001'],
      remainingCardIds: ['friends-001'],
      hasEnded: false,
    })
    render(<App />)

    await startSession(user, ['Yara', 'Tom'])
    await user.click(screen.getByRole('button', { name: /vrienden editie/i }))
    await user.click(screen.getByRole('button', { name: /start spel/i }))
    await draw(user)
    await draw(user)
    expect(screen.getByText(/potje afgelopen/i)).toBeInTheDocument()
  }

  it('"SPEEL OPNIEUW" keeps the previously chosen set without re-showing the selection screen', async () => {
    const user = userEvent.setup()
    await playToEndOfGameWithFriendsSet(user)

    mockedBuildSessionCardPool.mockClear()
    await user.click(screen.getByRole('button', { name: /speel opnieuw/i }))

    expect(screen.queryByText('Kaartenset')).not.toBeInTheDocument()
    expect(mockedBuildSessionCardPool).toHaveBeenCalledWith(expect.objectContaining({ id: 'friends' }))
  })

  it('"Spelers wijzigen" returns to setup and re-prompts for a card set', async () => {
    const user = userEvent.setup()
    await playToEndOfGameWithFriendsSet(user)

    await user.click(screen.getByRole('button', { name: /spelers wijzigen/i }))
    expect(screen.getByRole('button', { name: /spel starten/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /spel starten/i }))
    expect(screen.getByText('Kaartenset')).toBeInTheDocument()
  })
})

describe('App virus concurrency cap (US1, feature 011)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockedBuildSessionCardPool.mockReset()
  })

  it('caps concurrently active viruses at 4 — a 5th virus card is skipped and the next eligible card is drawn instead', async () => {
    const virusCards: Card[] = Array.from({ length: 5 }, (_, i) => ({
      id: `virus-${i + 1}`,
      type: 'virus',
      targeting: { kind: 'general' },
      instructionText: `Virus effect nummer ${i + 1} is nu actief.`,
      liftText: `{player} is genezen van virus nummer ${i + 1}.`,
    }))
    const assignmentCard: Card = {
      id: 'assignment-a',
      type: 'assignment',
      targeting: { kind: 'general' },
      instructionText: 'De volgende opdracht wordt uitgevoerd.',
    }
    const capTestSet: CardSet = {
      id: 'cap-test-set',
      name: 'Cap test set',
      cards: [...virusCards, assignmentCard],
    }

    setCatalog([capTestSet])
    mockedBuildSessionCardPool.mockReturnValue({
      poolCardIds: [...virusCards.map((c) => c.id), assignmentCard.id],
      remainingCardIds: [...virusCards.map((c) => c.id), assignmentCard.id],
      hasEnded: false,
    })

    const user = userEvent.setup()
    render(<App />)

    await startSession(user, ['Yara', 'Tom', 'Sam'])

    // Draw the first 4 virus cards — each becomes active for all 3 players.
    for (let i = 0; i < 4; i++) {
      await draw(user)
    }
    expect(screen.getAllByText('×4').length).toBeGreaterThan(0)

    // The 5th virus card is skipped (cap is full); the assignment card is shown instead, and
    // the active-virus badge never reaches ×5.
    await draw(user)

    expect(screen.getByText(assignmentCard.instructionText)).toBeInTheDocument()
    expect(screen.queryByText('×5')).not.toBeInTheDocument()
    expect(screen.getAllByText('×4').length).toBeGreaterThan(0)
  })
})
