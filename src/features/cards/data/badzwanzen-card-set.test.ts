import { describe, expect, it } from 'vitest'
import { validateCardSet } from '../validateCardSet'
import { badzwanzenCardSet } from './badzwanzen-card-set'

describe('badzwanzenCardSet', () => {
  it('passes validateCardSet with zero errors', () => {
    expect(validateCardSet(badzwanzenCardSet)).toEqual([])
  })

  it('is named "Badzwanzen"', () => {
    expect(badzwanzenCardSet.name).toBe('Badzwanzen')
  })
})
