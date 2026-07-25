import { useState } from 'react'
import type { AddPlayerResult } from './usePlayers'

const ERROR_MESSAGES: Record<Extract<AddPlayerResult, { ok: false }>['reason'], string> = {
  empty: 'Vul een naam in.',
  duplicate: 'Deze naam bestaat al.',
  max: 'Maximum van 20 spelers bereikt.',
}

interface AddPlayerControlProps {
  onAdd: (name: string) => AddPlayerResult
}

export function AddPlayerControl({ onAdd }: AddPlayerControlProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const trimmed = name.trim()
    if (trimmed === '') {
      setError(ERROR_MESSAGES.empty)
      return
    }

    const result = onAdd(trimmed)
    if (result.ok) {
      setName('')
      setError(null)
      setOpen(false)
      return
    }

    setError(ERROR_MESSAGES[result.reason])
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Speler toevoegen"
        onClick={() => setOpen(true)}
        className="flex size-12 items-center justify-center rounded-full bg-purple-600 text-2xl leading-none text-white shadow"
      >
        +
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Naam"
          aria-label="Naam van nieuwe speler"
          autoFocus
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          aria-label="Bevestigen"
          className="rounded bg-purple-600 px-4 py-2 text-white"
        >
          Bevestigen
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}
