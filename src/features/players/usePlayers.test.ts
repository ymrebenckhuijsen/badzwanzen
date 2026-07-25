import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getPlayers } from '../../lib/storage'
import { usePlayers } from './usePlayers'

describe('usePlayers', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts with an empty player list', () => {
    const { result } = renderHook(() => usePlayers())

    expect(result.current.players).toEqual([])
  })

  it('adds a player with a trimmed name', () => {
    const { result } = renderHook(() => usePlayers())

    act(() => {
      result.current.addPlayer('  Yara  ')
    })

    expect(result.current.players).toHaveLength(1)
    expect(result.current.players[0]).toMatchObject({ name: 'Yara', order: 0 })
  })

  it('adds multiple players in order', () => {
    const { result } = renderHook(() => usePlayers())

    act(() => {
      result.current.addPlayer('Yara')
    })
    act(() => {
      result.current.addPlayer('Tom')
    })

    expect(result.current.players.map((p) => p.name)).toEqual(['Yara', 'Tom'])
    expect(result.current.players.map((p) => p.order)).toEqual([0, 1])
  })

  it('rejects an empty name', () => {
    const { result } = renderHook(() => usePlayers())

    let outcome: ReturnType<typeof result.current.addPlayer> | undefined
    act(() => {
      outcome = result.current.addPlayer('')
    })

    expect(result.current.players).toEqual([])
    expect(outcome).toEqual({ ok: false, reason: 'empty' })
  })

  it('rejects a whitespace-only name', () => {
    const { result } = renderHook(() => usePlayers())

    let outcome: ReturnType<typeof result.current.addPlayer> | undefined
    act(() => {
      outcome = result.current.addPlayer('   ')
    })

    expect(result.current.players).toEqual([])
    expect(outcome).toEqual({ ok: false, reason: 'empty' })
  })

  it('rejects a case-sensitive duplicate name', () => {
    const { result } = renderHook(() => usePlayers())

    act(() => {
      result.current.addPlayer('Yara')
    })

    let outcome: ReturnType<typeof result.current.addPlayer> | undefined
    act(() => {
      outcome = result.current.addPlayer('Yara')
    })

    expect(result.current.players).toHaveLength(1)
    expect(outcome).toEqual({ ok: false, reason: 'duplicate' })
  })

  it('allows names differing only in case', () => {
    const { result } = renderHook(() => usePlayers())

    act(() => {
      result.current.addPlayer('Yara')
    })
    act(() => {
      result.current.addPlayer('yara')
    })

    expect(result.current.players.map((p) => p.name)).toEqual(['Yara', 'yara'])
  })

  it('rejects the 21st player once 20 are already added', () => {
    const { result } = renderHook(() => usePlayers())

    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.addPlayer(`Player ${i}`)
      }
    })
    expect(result.current.players).toHaveLength(20)

    let outcome: ReturnType<typeof result.current.addPlayer> | undefined
    act(() => {
      outcome = result.current.addPlayer('One too many')
    })

    expect(result.current.players).toHaveLength(20)
    expect(outcome).toEqual({ ok: false, reason: 'max' })
  })

  it('persists to storage after every successful add', () => {
    const { result } = renderHook(() => usePlayers())

    act(() => {
      result.current.addPlayer('Yara')
    })
    expect(getPlayers()).toEqual(result.current.players)

    act(() => {
      result.current.addPlayer('Tom')
    })
    expect(getPlayers()).toEqual(result.current.players)
  })

  it('does not persist a rejected add', () => {
    const { result } = renderHook(() => usePlayers())

    act(() => {
      result.current.addPlayer('Yara')
    })
    act(() => {
      result.current.addPlayer('Yara')
    })

    expect(getPlayers()).toHaveLength(1)
  })

  it('removes the player with the given id, leaving the rest intact', () => {
    const { result } = renderHook(() => usePlayers())

    act(() => {
      result.current.addPlayer('Yara')
    })
    act(() => {
      result.current.addPlayer('Tom')
    })
    act(() => {
      result.current.addPlayer('Kim')
    })
    const [, tom] = result.current.players

    act(() => {
      result.current.removePlayer(tom.id)
    })

    expect(result.current.players.map((p) => p.name)).toEqual(['Yara', 'Kim'])
  })

  it('keeps the relative order of the remaining players after a removal', () => {
    const { result } = renderHook(() => usePlayers())

    act(() => {
      result.current.addPlayer('Yara')
    })
    act(() => {
      result.current.addPlayer('Tom')
    })
    act(() => {
      result.current.addPlayer('Kim')
    })
    const [yara] = result.current.players

    act(() => {
      result.current.removePlayer(yara.id)
    })

    expect(result.current.players.map((p) => p.name)).toEqual(['Tom', 'Kim'])
    expect(result.current.players.map((p) => p.order)).toEqual([0, 1])
  })

  it('persists the change after removing a player', () => {
    const { result } = renderHook(() => usePlayers())

    act(() => {
      result.current.addPlayer('Yara')
    })
    act(() => {
      result.current.addPlayer('Tom')
    })
    const [yara] = result.current.players

    act(() => {
      result.current.removePlayer(yara.id)
    })

    expect(getPlayers()).toEqual(result.current.players)
  })
})
