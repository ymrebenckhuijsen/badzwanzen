import { useState } from 'react'
import { IosInstallInstructions } from './IosInstallInstructions'
import { useInstallPrompt } from './useInstallPrompt'

export function InstallButton() {
  const { state, promptInstall } = useInstallPrompt()
  const [showIosInstructions, setShowIosInstructions] = useState(false)

  if (state !== 'promptable' && state !== 'ios-manual') {
    return null
  }

  function handleTap() {
    if (state === 'ios-manual') {
      setShowIosInstructions(true)
      return
    }
    void promptInstall()
  }

  return (
    <>
      <button
        type="button"
        onClick={handleTap}
        className="flex items-center justify-center gap-2 self-center rounded-full border-b-4 border-primary-fixed-dim bg-primary-container px-5 py-2 font-display text-label-bold text-on-primary-container shadow-lg transition active:translate-y-0.5 active:border-b-2"
      >
        ⬇ Zet op beginscherm
      </button>
      {showIosInstructions && (
        <IosInstallInstructions onClose={() => setShowIosInstructions(false)} />
      )}
    </>
  )
}
