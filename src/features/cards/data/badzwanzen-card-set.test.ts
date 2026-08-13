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

describe('badzwanzenCardSet — feature 015 content addition', () => {
  const PRE_FEATURE_015_CARD_COUNT = 481
  const NEW_QUESTIONS_RAW_ENTRY_COUNT = 147

  it('contains at least the pre-feature card count plus every converted new-questions-raw.txt entry', () => {
    expect(badzwanzenCardSet.cards.length).toBeGreaterThanOrEqual(
      PRE_FEATURE_015_CARD_COUNT + NEW_QUESTIONS_RAW_ENTRY_COUNT,
    )
  })

  it('includes a card converted from the "onbewoond eiland" raw line', () => {
    expect(
      badzwanzenCardSet.cards.some((c) =>
        c.instructionText.toLowerCase().includes('onbewoond eiland mee zou nemen'),
      ),
    ).toBe(true)
  })

  it('includes a card converted from the "vals speelt" raw line', () => {
    expect(
      badzwanzenCardSet.cards.some((c) => c.instructionText.toLowerCase().includes('vals speelt')),
    ).toBe(true)
  })

  it('includes the new shared-oogcontact virus card with 2 specific targets', () => {
    const card = badzwanzenCardSet.cards.find((c) =>
      c.instructionText.toLowerCase().includes('oogcontact'),
    )
    expect(card).toBeDefined()
    expect(card?.type).toBe('virus')
    expect(card?.targeting).toEqual({ kind: 'specific', count: 2 })
  })
})

describe('badzwanzenCardSet — new virus cards have bespoke, content-specific liftText (FR-006, US4)', () => {
  const GENERIC_LIFT_TEXTS = new Set([
    '{player} is genezen.',
    'het virus is voorbij.',
    '{player} is verlost van het virus.',
  ])
  const STOPWORDS = new Set([
    'player',
    'anders',
    'moet',
    'vanaf',
    'strafpunt',
    'strafpunten',
    'wordt',
    'iemand',
    'iedereen',
    'zonder',
    'gewoon',
    'meer',
    'weer',
    'krijgt',
    'geven',
    'keer',
  ])

  function significantWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[.,;:'"()]/g, '')
      .split(/[\s-]+/)
      .filter((w) => w.length >= 4 && w !== 'player' && !STOPWORDS.has(w))
  }

  // Exact-token matching misses plural/verb-form variants (knipoog/knipogen) and compounds
  // (oogcontact/oogcontact-regel already split above) — a shared 4-character stem is close
  // enough to prove the liftText is actually about the same mechanic as its instructionText.
  function shareStem(a: string[], b: string[]): boolean {
    return a.some((wa) => b.some((wb) => wa.slice(0, 4) === wb.slice(0, 4)))
  }

  const newVirusIds = badzwanzenCardSet.cards
    .filter((c) => c.type === 'virus' && Number(c.id.replace('bz-virus-', '')) >= 72)
    .map((c) => c.id)

  it('has at least 31 new virus cards to check (sanity check on the sample itself)', () => {
    expect(newVirusIds.length).toBeGreaterThanOrEqual(31)
  })

  it.each(newVirusIds)('virus card %s has a non-generic liftText tied to its own effect', (id) => {
    const card = badzwanzenCardSet.cards.find((c) => c.id === id)!
    expect(GENERIC_LIFT_TEXTS.has(card.liftText!.toLowerCase())).toBe(false)

    const instructionKeywords = significantWords(card.instructionText)
    const liftKeywords = significantWords(card.liftText!)
    expect(shareStem(instructionKeywords, liftKeywords)).toBe(true)
  })
})
