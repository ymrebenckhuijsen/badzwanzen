import { useRef, useState } from 'react'
import { getPlayers, setPlayers } from '../../lib/storage'
import type { Player } from './types'

const MAX_PLAYERS = 20

export type AddPlayerResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'duplicate' | 'max' }

export function usePlayers() {
  const [players, setPlayersState] = useState<Player[]>(() => getPlayers())
  const playersRef = useRef(players)
  playersRef.current = players

  function addPlayer(name: string): AddPlayerResult {
    const trimmed = name.trim()

    if (trimmed === '') {
      return { ok: false, reason: 'empty' }
    }

    const current = playersRef.current
    if (current.some((p) => p.name === trimmed)) {
      return { ok: false, reason: 'duplicate' }
    }
    if (current.length >= MAX_PLAYERS) {
      return { ok: false, reason: 'max' }
    }

    const next = [...current, { id: crypto.randomUUID(), name: trimmed, order: current.length }]
    playersRef.current = next
    setPlayersState(next)
    setPlayers(next)
    return { ok: true }
  }

  function removePlayer(id: string): void {
    const next = playersRef.current
      .filter((p) => p.id !== id)
      .map((p, index) => ({ ...p, order: index }))
    playersRef.current = next
    setPlayersState(next)
    setPlayers(next)
  }

  return { players, addPlayer, removePlayer }
}
