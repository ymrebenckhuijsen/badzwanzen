import { useState } from 'react'
import type { ActiveVirusEffect } from './virus.types'
import type { Player } from '../players/types'
import type { CardSet } from '../cards/card.types'
import { renderCardText } from '../cards/renderCardText'

interface ActiveVirusListProps {
  effects: ActiveVirusEffect[]
  players: Player[]
  cardSet: CardSet
}

type GroupRow = { kind: 'group'; key: string; cardIds: string[] }
type PlayerRow = { kind: 'player'; key: string; player: Player; cardIds: string[] }
type Row = GroupRow | PlayerRow

export function ActiveVirusList({ effects, players, cardSet }: ActiveVirusListProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  function toggleRow(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const activeEffects = effects.filter((effect) => effect.status === 'active')

  // A general-targeting ("iedereen") virus produces one effect per targeted player but must
  // still render as a single shared row — grouped by cardId, not by targetPlayerId.
  const groupCardIds: string[] = []
  const activeByPlayer = new Map<string, ActiveVirusEffect[]>()
  // A specific-targeting card's instructionText carries one {player} token per co-targeted
  // player (validateCardSet's rule); reconstructing the substituted text later requires the
  // full, ordered set of currently-active target names for that cardId, not just the one
  // player whose row happens to be tapped.
  const targetNamesByCardId = new Map<string, string[]>()
  for (const effect of activeEffects) {
    const card = cardSet.cards.find((c) => c.id === effect.cardId)
    if (card?.targeting.kind === 'general') {
      if (!groupCardIds.includes(effect.cardId)) groupCardIds.push(effect.cardId)
      continue
    }
    const list = activeByPlayer.get(effect.targetPlayerId) ?? []
    list.push(effect)
    activeByPlayer.set(effect.targetPlayerId, list)

    const targetName = players.find((p) => p.id === effect.targetPlayerId)?.name
    if (targetName) {
      const names = targetNamesByCardId.get(effect.cardId) ?? []
      names.push(targetName)
      targetNamesByCardId.set(effect.cardId, names)
    }
  }

  function instructionTextFor(cardId: string): string | null {
    const card = cardSet.cards.find((c) => c.id === cardId)
    if (!card) return null
    if (card.targeting.kind === 'general') return card.instructionText
    return renderCardText(card.instructionText, targetNamesByCardId.get(cardId) ?? [])
  }

  const groupRows: GroupRow[] = groupCardIds.map((cardId) => ({
    kind: 'group',
    key: `group:${cardId}`,
    cardIds: [cardId],
  }))

  const playerRows: PlayerRow[] = players
    .map((player) => ({
      kind: 'player' as const,
      key: `player:${player.id}`,
      player,
      cardIds: (activeByPlayer.get(player.id) ?? []).map((effect) => effect.cardId),
    }))
    .filter((row) => row.cardIds.length > 0)

  const rows: Row[] = [...groupRows, ...playerRows]

  if (rows.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-label-bold text-on-surface-variant">
        ACTIEVE VIRUSSEN
      </span>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => {
          const expanded = expandedKeys.has(row.key)
          return (
            <li key={row.key} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => toggleRow(row.key)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-3 rounded-full bg-surface-container px-4 py-2 text-left text-on-surface"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
                  {row.kind === 'group' ? '👥' : row.player.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-body text-body-lg flex-1 truncate">
                  {row.kind === 'group' ? 'Iedereen' : row.player.name}
                </span>
                {row.cardIds.length > 1 && (
                  <span className="rounded-full bg-tertiary-container px-2 py-1 text-xs text-on-tertiary-container">
                    ×{row.cardIds.length}
                  </span>
                )}
                <span aria-hidden className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
                  ⌄
                </span>
              </button>
              {expanded && (
                <div className="flex flex-col gap-1 rounded-2xl bg-surface-container-high px-4 py-2 text-on-surface-variant">
                  {row.cardIds.map((cardId) => {
                    const text = instructionTextFor(cardId)
                    return text ? (
                      <span key={cardId} className="font-body text-body-md">
                        {text}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
