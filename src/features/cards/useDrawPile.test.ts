import { act, renderHook, type RenderHookResult } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDrawPile } from './useDrawPile'
import type { Card, CardSet, DrawnCard, SessionCardPool } from './card.types'
import type { Player } from '../players/types'

function makePlayers(names: string[]): Player[] {
  return names.map((name, order) => ({ id: `p-${name}`, name, order }))
}

function makeCard(id: string, overrides: Partial<Card> = {}): Card {
  return {
    id,
    type: 'assignment',
    instructionText: 'Doe iets',
    targeting: { kind: 'general' },
    ...overrides,
  }
}

function drawSync(
  hook: RenderHookResult<ReturnType<typeof useDrawPile>, unknown>,
): DrawnCard | null {
  let drawn: DrawnCard | null = null
  act(() => {
    drawn = hook.result.current.draw()
  })
  return drawn
}

describe('useDrawPile', () => {
  it('draws one card at a time, removing it from remainingCardIds', () => {
    const cardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [makeCard('a'), makeCard('b'), makeCard('c')],
    }
    const pool: SessionCardPool = {
      poolCardIds: ['a', 'b', 'c'],
      remainingCardIds: ['a', 'b', 'c'],
      hasEnded: false,
    }
    const players = makePlayers(['Alice', 'Bob'])

    const hook = renderHook(() => useDrawPile(pool, cardSet, players))

    expect(drawSync(hook)?.cardId).toBe('a')
    expect(hook.result.current.remainingCount).toBe(2)

    expect(drawSync(hook)?.cardId).toBe('b')
    expect(hook.result.current.remainingCount).toBe(1)
  })

  it('discards a card whose specific targeting needs more players than exist, and immediately draws the next one', () => {
    const cardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [
        makeCard('too-many', { targeting: { kind: 'specific', count: 3 } }),
        makeCard('resolvable', { targeting: { kind: 'general' } }),
      ],
    }
    const pool: SessionCardPool = {
      poolCardIds: ['too-many', 'resolvable'],
      remainingCardIds: ['too-many', 'resolvable'],
      hasEnded: false,
    }
    const players = makePlayers(['Alice', 'Bob'])

    const hook = renderHook(() => useDrawPile(pool, cardSet, players))

    const drawn = drawSync(hook)

    expect(drawn?.cardId).toBe('resolvable')
    expect(hook.result.current.remainingCount).toBe(0)
  })

  it('signals pool exhaustion once every card has been drawn or discarded', () => {
    const cardSet: CardSet = { id: 'set', name: 'Set', cards: [makeCard('a')] }
    const pool: SessionCardPool = {
      poolCardIds: ['a'],
      remainingCardIds: ['a'],
      hasEnded: false,
    }
    const players = makePlayers(['Alice', 'Bob'])

    const hook = renderHook(() => useDrawPile(pool, cardSet, players))

    drawSync(hook)
    expect(hook.result.current.hasEnded).toBe(false)

    expect(drawSync(hook)).toBeNull()
    expect(hook.result.current.hasEnded).toBe(true)
  })

  it('assigns a monotonically increasing drawnAt sequence to successfully drawn cards', () => {
    const cardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [makeCard('a'), makeCard('b')],
    }
    const pool: SessionCardPool = {
      poolCardIds: ['a', 'b'],
      remainingCardIds: ['a', 'b'],
      hasEnded: false,
    }
    const players = makePlayers(['Alice', 'Bob'])

    const hook = renderHook(() => useDrawPile(pool, cardSet, players))

    const first = drawSync(hook)
    const second = drawSync(hook)

    expect(second!.drawnAt).toBeGreaterThan(first!.drawnAt)
  })

  it('refuses further draws once the pool has ended, without throwing', () => {
    const cardSet: CardSet = { id: 'set', name: 'Set', cards: [makeCard('a')] }
    const pool: SessionCardPool = {
      poolCardIds: ['a'],
      remainingCardIds: ['a'],
      hasEnded: false,
    }
    const players = makePlayers(['Alice', 'Bob'])

    const hook = renderHook(() => useDrawPile(pool, cardSet, players))

    drawSync(hook)
    expect(drawSync(hook)).toBeNull()
    expect(hook.result.current.hasEnded).toBe(true)

    expect(drawSync(hook)).toBeNull()
    expect(hook.result.current.hasEnded).toBe(true)
    expect(hook.result.current.remainingCount).toBe(0)
  })
})
