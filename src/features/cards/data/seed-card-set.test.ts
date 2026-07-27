import { describe, expect, it } from 'vitest'
import { validateCardSet } from '../validateCardSet'
import { seedCardSet } from './seed-card-set'

describe('seedCardSet', () => {
  it('passes validateCardSet with zero errors', () => {
    expect(validateCardSet(seedCardSet)).toEqual([])
  })
})
