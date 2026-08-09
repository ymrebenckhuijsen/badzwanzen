import { useEffect, useRef, useState } from 'react'
import type { InstallAvailabilityState } from './types'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIosSafari(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isStandalone(): boolean {
  const matchesDisplayMode = window.matchMedia?.('(display-mode: standalone)')?.matches === true
  const iosStandaloneFlag = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return matchesDisplayMode || iosStandaloneFlag
}

function resolveInitialState(): InstallAvailabilityState {
  if (isStandalone()) return 'installed'
  if (isIosSafari()) return 'ios-manual'
  return 'unsupported'
}

export function useInstallPrompt() {
  const [state, setState] = useState<InstallAvailabilityState>(resolveInitialState)
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      deferredPromptRef.current = event as BeforeInstallPromptEvent
      setState('promptable')
    }

    function handleAppInstalled() {
      deferredPromptRef.current = null
      setState('installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function promptInstall(): Promise<void> {
    const deferredPrompt = deferredPromptRef.current
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    // 'accepted' → the browser's own 'appinstalled' event (listened for above) drives the
    // transition to 'installed'. 'dismissed' → state intentionally stays 'promptable' (FR-009).
  }

  return { state, promptInstall }
}
