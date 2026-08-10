import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { CardSet } from './card.types'
import { useCardSetSelection } from './useCardSetSelection'
import { getSelectedCardSetId, setSelectedCardSetId } from '../../lib/storage'

// The seed set is first here so it acts as this test file's stable default — mirroring how
// production orders its real catalog with the production default (Badzwanzen) first instead.
function fixtureCatalog(): CardSet[] {
  return [
    { id: 'seed', name: 'Seed testset', cards: [] },
    { id: 'friends', name: 'Vrienden editie', cards: [] },
  ]
}

describe('useCardSetSelection', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts with the first catalog entry resolved', () => {
    const catalog = fixtureCatalog()
    const { result } = renderHook(() => useCardSetSelection(catalog))

    expect(result.current.resolvedCardSet).toBe(catalog[0])
  })

  it('select(id) updates the resolved card set to the matching entry', () => {
    const catalog = fixtureCatalog()
    const { result } = renderHook(() => useCardSetSelection(catalog))

    act(() => {
      result.current.select('friends')
    })

    expect(result.current.resolvedCardSet).toBe(catalog[1])
  })

  it('exposes the full catalog as sets', () => {
    const catalog = fixtureCatalog()
    const { result } = renderHook(() => useCardSetSelection(catalog))

    expect(result.current.sets).toBe(catalog)
  })
})

describe('useCardSetSelection (US3 — persistence)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('resolves the stored id as the default when it names a current catalog entry (FR-010)', () => {
    const catalog = fixtureCatalog()
    setSelectedCardSetId('friends')

    const { result } = renderHook(() => useCardSetSelection(catalog))

    expect(result.current.resolvedCardSet).toBe(catalog[1])
  })

  it('falls back to the catalog\'s primary (first) set when nothing is stored (FR-011)', () => {
    const catalog = fixtureCatalog()

    const { result } = renderHook(() => useCardSetSelection(catalog))

    expect(result.current.resolvedCardSet).toBe(catalog[0])
  })

  it('falls back to the catalog\'s primary (first) set when the stored id names no current catalog entry (FR-011)', () => {
    const catalog = fixtureCatalog()
    setSelectedCardSetId('a-set-that-no-longer-exists')

    const { result } = renderHook(() => useCardSetSelection(catalog))

    expect(result.current.resolvedCardSet).toBe(catalog[0])
  })

  it('select(id) immediately persists the choice', () => {
    const catalog = fixtureCatalog()
    const { result } = renderHook(() => useCardSetSelection(catalog))

    act(() => {
      result.current.select('friends')
    })

    expect(getSelectedCardSetId()).toBe('friends')
  })
})
