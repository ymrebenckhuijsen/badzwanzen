import { useRef, useState } from 'react'
import type { ActiveVirusEffect } from './virus.types'

const MIN_LIFT_THRESHOLD = 10
const LIFT_THRESHOLD_RANDOM_SPREAD = 41 // yields liftThreshold in [10, 50] — see research.md: no fixed maximum by design

function randomLiftThreshold(): number {
  return MIN_LIFT_THRESHOLD + Math.floor(Math.random() * LIFT_THRESHOLD_RANDOM_SPREAD)
}

export function useVirusEffects() {
  const [effects, setEffects] = useState<ActiveVirusEffect[]>([])
  const idCounter = useRef(0)

  function startEffects(
    cardId: string,
    targetPlayerIds: string[],
    startedAtDraw: number,
  ): ActiveVirusEffect[] {
    // One shared roll per activation (not per target player) is what makes every player hit by
    // the same "iedereen" virus lift together on the same draw turn (FR-001).
    const liftThreshold = randomLiftThreshold()
    const newEffects: ActiveVirusEffect[] = targetPlayerIds.map((targetPlayerId) => ({
      id: `effect-${idCounter.current++}`,
      cardId,
      targetPlayerId,
      startedAtDraw,
      liftThreshold,
      assignmentGameDrawsSinceStart: 0,
      status: 'active',
      liftReason: null,
    }))

    setEffects((prev) => [...prev, ...newEffects])
    return newEffects
  }

  function advanceOnAssignmentGameDraw(): ActiveVirusEffect[] {
    const lifted: ActiveVirusEffect[] = []

    const next = effects.map((effect) => {
      if (effect.status !== 'active') return effect

      const assignmentGameDrawsSinceStart = effect.assignmentGameDrawsSinceStart + 1
      if (assignmentGameDrawsSinceStart >= effect.liftThreshold) {
        const liftedEffect: ActiveVirusEffect = {
          ...effect,
          assignmentGameDrawsSinceStart,
          status: 'lifted',
          liftReason: 'threshold',
        }
        lifted.push(liftedEffect)
        return liftedEffect
      }

      return { ...effect, assignmentGameDrawsSinceStart }
    })

    setEffects(next)
    return lifted
  }

  function forceLiftAll(): ActiveVirusEffect[] {
    const forced: ActiveVirusEffect[] = []

    const next = effects.map((effect) => {
      if (effect.status !== 'active') return effect

      const liftedEffect: ActiveVirusEffect = { ...effect, status: 'lifted', liftReason: 'forced-end' }
      forced.push(liftedEffect)
      return liftedEffect
    })

    forced.sort((a, b) => a.startedAtDraw - b.startedAtDraw)
    setEffects(next)
    return forced
  }

  return { effects, startEffects, advanceOnAssignmentGameDraw, forceLiftAll }
}
