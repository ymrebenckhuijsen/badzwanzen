import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useVirusEffects } from './useVirusEffects'

describe('useVirusEffects — starting effects', () => {
  it('creates one independent active effect per resolved target player', () => {
    const { result } = renderHook(() => useVirusEffects())

    act(() => {
      result.current.startEffects('virus-1', ['p-alice', 'p-bob'], 0)
    })

    const effects = result.current.effects
    expect(effects).toHaveLength(2)
    expect(effects.map((e) => e.targetPlayerId).sort()).toEqual(['p-alice', 'p-bob'])
    for (const effect of effects) {
      expect(effect.cardId).toBe('virus-1')
      expect(effect.status).toBe('active')
      expect(effect.liftReason).toBeNull()
      expect(effect.assignmentGameDrawsSinceStart).toBe(0)
      expect(effect.liftThreshold).toBeGreaterThanOrEqual(10)
    }
  })

  it('adds an independent effect when a player already has an active effect, leaving the first untouched', () => {
    const { result } = renderHook(() => useVirusEffects())

    act(() => {
      result.current.startEffects('virus-1', ['p-alice'], 0)
    })
    const firstEffectId = result.current.effects[0]!.id

    act(() => {
      result.current.startEffects('virus-2', ['p-alice'], 3)
    })

    const effects = result.current.effects
    expect(effects).toHaveLength(2)
    expect(effects.find((e) => e.id === firstEffectId)).toBeTruthy()
    expect(effects.filter((e) => e.targetPlayerId === 'p-alice')).toHaveLength(2)
  })
})

describe('useVirusEffects — simultaneous lift for a shared activation (FR-001)', () => {
  it('gives every effect from the same startEffects call the same liftThreshold', () => {
    const { result } = renderHook(() => useVirusEffects())

    act(() => {
      result.current.startEffects('virus-1', ['p-alice', 'p-bob', 'p-carol'], 0)
    })

    const thresholds = result.current.effects.map((e) => e.liftThreshold)
    expect(new Set(thresholds).size).toBe(1)
  })

  it('lifts all effects from the same "iedereen" activation on the same advanceOnAssignmentGameDraw call', () => {
    const { result } = renderHook(() => useVirusEffects())

    act(() => {
      result.current.startEffects('virus-1', ['p-alice', 'p-bob', 'p-carol'], 0)
    })

    let lastLifted: ReturnType<typeof result.current.advanceOnAssignmentGameDraw> = []
    // 50 draws guarantees the threshold (max possible is 10 + 40) has been reached
    for (let i = 0; i < 50; i++) {
      act(() => {
        lastLifted = result.current.advanceOnAssignmentGameDraw()
      })
      if (result.current.effects[0]!.status === 'lifted') break
    }

    expect(result.current.effects.every((e) => e.status === 'lifted')).toBe(true)
    expect(lastLifted.map((e) => e.targetPlayerId).sort()).toEqual(['p-alice', 'p-bob', 'p-carol'])
  })
})

describe('useVirusEffects — advancing and threshold-lifting', () => {
  it('increments assignmentGameDrawsSinceStart for active effects on each assignment/game draw', () => {
    const { result } = renderHook(() => useVirusEffects())

    act(() => {
      result.current.startEffects('virus-1', ['p-alice'], 0)
    })
    act(() => {
      result.current.advanceOnAssignmentGameDraw()
    })
    act(() => {
      result.current.advanceOnAssignmentGameDraw()
    })

    expect(result.current.effects[0]!.assignmentGameDrawsSinceStart).toBe(2)
  })

  it('does not lift an effect before its threshold is reached', () => {
    const { result } = renderHook(() => useVirusEffects())

    act(() => {
      result.current.startEffects('virus-1', ['p-alice'], 0)
    })
    // 9 draws can never reach a threshold, since the minimum threshold is 10
    for (let i = 0; i < 9; i++) {
      act(() => {
        result.current.advanceOnAssignmentGameDraw()
      })
    }

    expect(result.current.effects[0]!.status).toBe('active')
    expect(result.current.effects[0]!.liftReason).toBeNull()
  })

  it('lifts an effect with liftReason "threshold" once its threshold is reached, and reports it as newly lifted', () => {
    const { result } = renderHook(() => useVirusEffects())

    act(() => {
      result.current.startEffects('virus-1', ['p-alice'], 0)
    })

    let lastLifted: ReturnType<typeof result.current.advanceOnAssignmentGameDraw> = []
    // 50 draws guarantees the threshold (max possible is 10 + 40) has been reached
    for (let i = 0; i < 50; i++) {
      act(() => {
        lastLifted = result.current.advanceOnAssignmentGameDraw()
      })
      if (result.current.effects[0]!.status === 'lifted') break
    }

    const effect = result.current.effects[0]!
    expect(effect.status).toBe('lifted')
    expect(effect.liftReason).toBe('threshold')
    expect(lastLifted.some((e) => e.id === effect.id)).toBe(true)
  })

  it('does not keep incrementing a lifted effect on further draws', () => {
    const { result } = renderHook(() => useVirusEffects())

    act(() => {
      result.current.startEffects('virus-1', ['p-alice'], 0)
    })
    for (let i = 0; i < 50; i++) {
      act(() => {
        result.current.advanceOnAssignmentGameDraw()
      })
    }
    const valueAtLift = result.current.effects[0]!.assignmentGameDrawsSinceStart

    act(() => {
      result.current.advanceOnAssignmentGameDraw()
    })

    expect(result.current.effects[0]!.assignmentGameDrawsSinceStart).toBe(valueAtLift)
  })
})

describe('useVirusEffects — forcing all active effects to lift', () => {
  it('sets every still-active effect to lifted with liftReason "forced-end", ignoring liftThreshold', () => {
    const { result } = renderHook(() => useVirusEffects())

    act(() => {
      result.current.startEffects('virus-1', ['p-alice'], 0)
    })

    let forced: ReturnType<typeof result.current.forceLiftAll> = []
    act(() => {
      forced = result.current.forceLiftAll()
    })

    expect(result.current.effects[0]!.status).toBe('lifted')
    expect(result.current.effects[0]!.liftReason).toBe('forced-end')
    expect(forced).toHaveLength(1)
    expect(forced[0]!.id).toBe(result.current.effects[0]!.id)
  })

  it('leaves already-lifted effects untouched and excludes them from the returned list', () => {
    const { result } = renderHook(() => useVirusEffects())

    act(() => {
      result.current.startEffects('virus-1', ['p-alice'], 0)
    })
    for (let i = 0; i < 50; i++) {
      act(() => {
        result.current.advanceOnAssignmentGameDraw()
      })
    }
    expect(result.current.effects[0]!.liftReason).toBe('threshold')

    let forced: ReturnType<typeof result.current.forceLiftAll> = []
    act(() => {
      forced = result.current.forceLiftAll()
    })

    expect(forced).toHaveLength(0)
    expect(result.current.effects[0]!.liftReason).toBe('threshold')
  })

  it('returns forced-lifted effects ordered by startedAtDraw ascending', () => {
    const { result } = renderHook(() => useVirusEffects())

    act(() => {
      result.current.startEffects('virus-2', ['p-bob'], 5)
    })
    act(() => {
      result.current.startEffects('virus-1', ['p-alice'], 1)
    })

    let forced: ReturnType<typeof result.current.forceLiftAll> = []
    act(() => {
      forced = result.current.forceLiftAll()
    })

    expect(forced.map((e) => e.targetPlayerId)).toEqual(['p-alice', 'p-bob'])
  })
})
