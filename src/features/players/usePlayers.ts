import { useRef, useState } from 'react'
import { getPlayers, setPlayers } from '../../lib/storage'
import { getActivePlayers } from './activePlayers'
import type { Player } from './types'

const MAX_PLAYERS = 20
const MIN_ACTIVE_PLAYERS = 2

export type AddPlayerResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'duplicate' | 'max' }

export type RemoveLivePlayerResult = { ok: true } | { ok: false; reason: 'min-players' }

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
    const activeCurrent = getActivePlayers(current)
    if (activeCurrent.some((p) => p.name === trimmed)) {
      return { ok: false, reason: 'duplicate' }
    }
    if (activeCurrent.length >= MAX_PLAYERS) {
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

  function retirePlayer(id: string): RemoveLivePlayerResult {
    const activeCount = getActivePlayers(playersRef.current).length
    if (activeCount <= MIN_ACTIVE_PLAYERS) {
      return { ok: false, reason: 'min-players' }
    }

    const next = playersRef.current.map((p) => (p.id === id ? { ...p, status: 'removed' as const } : p))
    playersRef.current = next
    setPlayersState(next)
    setPlayers(next)
    return { ok: true }
  }

  return { players, addPlayer, removePlayer, retirePlayer }
}
