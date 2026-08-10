import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CardSet } from './card.types'
import { CardSetSelectionScreen } from './CardSetSelectionScreen'

function multiSetCatalog(): CardSet[] {
  return [
    { id: 'seed', name: 'Seed testset', cards: [] },
    { id: 'friends', name: 'Vrienden editie', cards: [] },
  ]
}

function singleSetCatalog(): CardSet[] {
  return [{ id: 'seed', name: 'Seed testset', cards: [] }]
}

describe('CardSetSelectionScreen', () => {
  it('renders one row per catalog entry, with the first selected by default', () => {
    render(<CardSetSelectionScreen catalog={multiSetCatalog()} onContinue={vi.fn()} />)

    expect(screen.getByText('Seed testset')).toBeInTheDocument()
    expect(screen.getByText('Vrienden editie')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /seed testset/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /vrienden editie/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('tapping a different row changes which one is selected', async () => {
    const user = userEvent.setup()
    render(<CardSetSelectionScreen catalog={multiSetCatalog()} onContinue={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /vrienden editie/i }))

    expect(screen.getByRole('button', { name: /vrienden editie/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /seed testset/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('tapping "START SPEL" calls onContinue with the currently selected set', async () => {
    const user = userEvent.setup()
    const catalog = multiSetCatalog()
    const onContinue = vi.fn()
    render(<CardSetSelectionScreen catalog={catalog} onContinue={onContinue} />)

    await user.click(screen.getByRole('button', { name: /vrienden editie/i }))
    await user.click(screen.getByRole('button', { name: /start spel/i }))

    expect(onContinue).toHaveBeenCalledWith(catalog[1])
  })

  it('with a single-entry catalog, renders nothing selectable and continues immediately', () => {
    const catalog = singleSetCatalog()
    const onContinue = vi.fn()
    render(<CardSetSelectionScreen catalog={catalog} onContinue={onContinue} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(onContinue).toHaveBeenCalledWith(catalog[0])
  })
})

describe('CardSetSelectionScreen (US2 — seed set always reachable)', () => {
  it('renders the seed test set among the choices and keeps it a single tap away, regardless of how many other sets exist', async () => {
    const user = userEvent.setup()
    const catalog: CardSet[] = [
      { id: 'seed', name: 'Seed testset', cards: [] },
      { id: 'friends', name: 'Vrienden editie', cards: [] },
      { id: 'werkborrel', name: 'Werkborrel editie', cards: [] },
      { id: 'familie', name: 'Familie editie', cards: [] },
    ]
    const onContinue = vi.fn()
    render(<CardSetSelectionScreen catalog={catalog} onContinue={onContinue} />)

    expect(screen.getByText('Seed testset')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /seed testset/i }))
    await user.click(screen.getByRole('button', { name: /start spel/i }))

    expect(onContinue).toHaveBeenCalledWith(catalog[0])
  })
})
