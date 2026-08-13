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

function drawSync<Props>(
  hook: RenderHookResult<ReturnType<typeof useDrawPile>, Props>,
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

    const hook = renderHook(() => useDrawPile(pool, cardSet, players, 0))

    expect(drawSync(hook)?.cardId).toBe('a')
    expect(hook.result.current.remainingCount).toBe(2)

    expect(drawSync(hook)?.cardId).toBe('b')
    expect(hook.result.current.remainingCount).toBe(1)
  })

  it('defers — does not discard — a card whose specific targeting needs more players than exist, and immediately draws the next eligible one', () => {
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

    const hook = renderHook(() => useDrawPile(pool, cardSet, players, 0))

    const drawn = drawSync(hook)

    expect(drawn?.cardId).toBe('resolvable')
    // 'too-many' is retained in remainingCardIds rather than permanently discarded — a direct
    // consequence of the index-based removal needed for the virus-cap deferral (FR-004).
    expect(hook.result.current.remainingCount).toBe(1)
  })

  it('signals pool exhaustion once every card has been drawn or discarded', () => {
    const cardSet: CardSet = { id: 'set', name: 'Set', cards: [makeCard('a')] }
    const pool: SessionCardPool = {
      poolCardIds: ['a'],
      remainingCardIds: ['a'],
      hasEnded: false,
    }
    const players = makePlayers(['Alice', 'Bob'])

    const hook = renderHook(() => useDrawPile(pool, cardSet, players, 0))

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

    const hook = renderHook(() => useDrawPile(pool, cardSet, players, 0))

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

    const hook = renderHook(() => useDrawPile(pool, cardSet, players, 0))

    drawSync(hook)
    expect(drawSync(hook)).toBeNull()
    expect(hook.result.current.hasEnded).toBe(true)

    expect(drawSync(hook)).toBeNull()
    expect(hook.result.current.hasEnded).toBe(true)
    expect(hook.result.current.remainingCount).toBe(0)
  })
})

describe('useDrawPile — remainingCount is unaffected by virus-lift events (FR-003)', () => {
  it('leaves remainingCount unchanged when activeVirusCount changes without a draw() call', () => {
    // activeVirusCount dropping (e.g. from 2 to 1) is exactly what happens in App.tsx when a
    // virus lifts — this proves that transition alone never shrinks the draw pile; only an
    // actual draw() call does.
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

    const hook = renderHook(
      ({ activeVirusCount }: { activeVirusCount: number }) =>
        useDrawPile(pool, cardSet, players, activeVirusCount),
      { initialProps: { activeVirusCount: 2 } },
    )

    expect(hook.result.current.remainingCount).toBe(3)

    hook.rerender({ activeVirusCount: 1 })
    expect(hook.result.current.remainingCount).toBe(3)

    hook.rerender({ activeVirusCount: 0 })
    expect(hook.result.current.remainingCount).toBe(3)
  })
})

describe('useDrawPile — 4-virus concurrency cap (FR-002 through FR-004)', () => {
  const MAX_ACTIVE_VIRUSES = 4

  it('starts a virus card normally when fewer than 4 different viruses are active', () => {
    const cardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [makeCard('virus-a', { type: 'virus' })],
    }
    const pool: SessionCardPool = {
      poolCardIds: ['virus-a'],
      remainingCardIds: ['virus-a'],
      hasEnded: false,
    }
    const players = makePlayers(['Alice', 'Bob'])

    const hook = renderHook(() => useDrawPile(pool, cardSet, players, MAX_ACTIVE_VIRUSES - 1))

    const drawn = drawSync(hook)

    expect(drawn?.cardId).toBe('virus-a')
    expect(hook.result.current.remainingCount).toBe(0)
  })

  it('skips a virus card at the cap without discarding it, and draws the next eligible card instead', () => {
    const cardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [makeCard('virus-a', { type: 'virus' }), makeCard('assignment-a')],
    }
    const pool: SessionCardPool = {
      poolCardIds: ['virus-a', 'assignment-a'],
      remainingCardIds: ['virus-a', 'assignment-a'],
      hasEnded: false,
    }
    const players = makePlayers(['Alice', 'Bob'])

    const hook = renderHook(() => useDrawPile(pool, cardSet, players, MAX_ACTIVE_VIRUSES))

    const drawn = drawSync(hook)

    expect(drawn?.cardId).toBe('assignment-a')
    // 'virus-a' stays in the pool — deferred, not discarded (FR-004).
    expect(hook.result.current.remainingCount).toBe(1)
  })

  it('draws a previously-skipped virus card once the active count drops below the cap', () => {
    // A second, eligible card keeps this draw from ever hitting the pre-existing "nothing
    // eligible this call" exhaustion fallback (see spec.md edge cases) — that fallback is a
    // deliberate, separate behavior, not what this test is about.
    const cardSet: CardSet = {
      id: 'set',
      name: 'Set',
      cards: [makeCard('virus-a', { type: 'virus' }), makeCard('assignment-a')],
    }
    const pool: SessionCardPool = {
      poolCardIds: ['virus-a', 'assignment-a'],
      remainingCardIds: ['virus-a', 'assignment-a'],
      hasEnded: false,
    }
    const players = makePlayers(['Alice', 'Bob'])

    const hook = renderHook(
      ({ activeVirusCount }: { activeVirusCount: number }) =>
        useDrawPile(pool, cardSet, players, activeVirusCount),
      { initialProps: { activeVirusCount: MAX_ACTIVE_VIRUSES } },
    )

    expect(drawSync(hook)?.cardId).toBe('assignment-a')
    expect(hook.result.current.remainingCount).toBe(1)

    hook.rerender({ activeVirusCount: MAX_ACTIVE_VIRUSES - 1 })

    const drawn = drawSync(hook)
    expect(drawn?.cardId).toBe('virus-a')
    expect(hook.result.current.remainingCount).toBe(0)
  })
})
