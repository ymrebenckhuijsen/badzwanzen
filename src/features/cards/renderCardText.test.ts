import { describe, expect, it } from 'vitest'
import { renderCardText } from './renderCardText'

describe('renderCardText', () => {
  it('replaces a single {player} token with the given name', () => {
    expect(renderCardText('{player} moet 10 keer opdrukken', ['Alice'])).toBe(
      'Alice moet 10 keer opdrukken',
    )
  })

  it('replaces multiple {player} tokens in order with the given names', () => {
    expect(renderCardText('{player} en {player} dansen samen', ['Bob', 'Chris'])).toBe(
      'Bob en Chris dansen samen',
    )
  })

  it('returns text with zero tokens unchanged', () => {
    expect(renderCardText('Iedereen klapt drie keer', [])).toBe('Iedereen klapt drie keer')
  })
})
