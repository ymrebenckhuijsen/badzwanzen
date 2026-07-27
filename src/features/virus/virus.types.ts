export type LiftReason = 'threshold' | 'forced-end'

export interface ActiveVirusEffect {
  id: string
  cardId: string
  targetPlayerId: string
  startedAtDraw: number
  liftThreshold: number
  assignmentGameDrawsSinceStart: number
  status: 'active' | 'lifted'
  liftReason: LiftReason | null
}
