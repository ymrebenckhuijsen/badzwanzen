import type { CardSet } from '../card.types'
import { badzwanzenCardSet } from './badzwanzen-card-set'
import { seedCardSet } from './seed-card-set'

// Badzwanzen is listed first so it resolves as the production default (useCardSetSelection
// falls back to the catalog's first entry). The seed test set stays available (FR-003) for
// development/testing but is no longer the fallback target now that real content exists.
export const cardSetCatalog: CardSet[] = [badzwanzenCardSet, seedCardSet]
