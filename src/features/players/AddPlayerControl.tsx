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
        className="flex size-14 items-center justify-center self-center rounded-full border-b-4 border-primary-fixed-dim bg-primary-container text-3xl leading-none text-on-primary-container shadow-lg transition active:translate-y-0.5 active:border-b-2"
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
          className="font-body text-body-lg min-w-0 flex-1 rounded-md border-2 border-primary bg-surface-container px-4 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          aria-label="Bevestigen"
          className="rounded-full border-b-4 border-primary-fixed-dim bg-primary-container px-5 py-2 font-display text-label-bold text-on-primary-container transition active:translate-y-0.5 active:border-b-2"
        >
          Bevestigen
        </button>
      </div>
      {error && (
        <p role="alert" className="font-body text-body-md text-error">
          {error}
        </p>
      )}
    </form>
  )
}
