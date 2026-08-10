import { useState } from 'react'
import { getSelectedCardSetId, setSelectedCardSetId } from '../../lib/storage'
import type { CardSet } from './card.types'
import { cardSetCatalog } from './data/card-set-catalog'

// Falls back to the catalog's first ("primary") entry — not a hardcoded set id — when nothing
// is stored or the stored id no longer exists (FR-011). Production orders its catalog with the
// real "Badzwanzen" set first, making that the production default; the seed set stays available
// (FR-003) without being the fallback target. Test fixtures control their own ordering, so unit
// tests can keep the seed set as their stable default by listing it first.
function resolveDefaultId(catalog: CardSet[]): string {
  const storedId = getSelectedCardSetId()
  if (storedId !== null && catalog.some((set) => set.id === storedId)) {
    return storedId
  }
  return catalog[0].id
}

export function useCardSetSelection(catalog: CardSet[] = cardSetCatalog) {
  const [selectedId, setSelectedId] = useState(() => resolveDefaultId(catalog))

  function select(id: string): void {
    setSelectedId(id)
    setSelectedCardSetId(id)
  }

  const resolvedCardSet = catalog.find((set) => set.id === selectedId) ?? catalog[0]

  return { sets: catalog, resolvedCardSet, select }
}
