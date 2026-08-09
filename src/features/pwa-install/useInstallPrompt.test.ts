import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useInstallPrompt } from './useInstallPrompt'

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

function dispatchBeforeInstallPrompt(overrides: Partial<{ prompt: () => Promise<void> }> = {}) {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  }
  event.prompt = overrides.prompt ?? vi.fn().mockResolvedValue(undefined)
  event.userChoice = Promise.resolve({ outcome: 'dismissed' })
  act(() => {
    window.dispatchEvent(event)
  })
  return event
}

describe('useInstallPrompt', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves synchronously to "installed" on mount when matchMedia reports standalone display-mode', () => {
    stubMatchMedia(true)

    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.state).toBe('installed')
  })

  it('resolves synchronously to "installed" on mount when navigator.standalone is true (iOS)', () => {
    const originalStandalone = (navigator as Navigator & { standalone?: boolean }).standalone
    Object.defineProperty(navigator, 'standalone', { value: true, configurable: true })

    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.state).toBe('installed')

    Object.defineProperty(navigator, 'standalone', {
      value: originalStandalone,
      configurable: true,
    })
  })

  it('transitions to "installed" when the appinstalled event fires', () => {
    const { result } = renderHook(() => useInstallPrompt())
    dispatchBeforeInstallPrompt()
    expect(result.current.state).toBe('promptable')

    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    expect(result.current.state).toBe('installed')
  })

  it('stays at "promptable" after the native prompt is dismissed (FR-009)', async () => {
    const { result } = renderHook(() => useInstallPrompt())
    dispatchBeforeInstallPrompt() // userChoice resolves 'dismissed' by default

    await result.current.promptInstall()

    expect(result.current.state).toBe('promptable')
  })

  it('resolves synchronously to "ios-manual" on mount when userAgent is iOS and not standalone', () => {
    const originalUserAgent = navigator.userAgent
    vi.stubGlobal('navigator', {
      ...navigator,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    })

    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.state).toBe('ios-manual')
    expect(navigator.userAgent).not.toBe(originalUserAgent) // sanity check the stub took effect
  })

  it('resolves synchronously to "unsupported" on first render when no platform signal is present', () => {
    // No beforeinstallprompt fired, not standalone, not iOS (default JSDOM userAgent) — the
    // hook must never observably render 'unknown' first (contracts/install-button-contract.md).
    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.state).toBe('unsupported')
  })

  it('transitions to "promptable" when beforeinstallprompt fires', () => {
    const { result } = renderHook(() => useInstallPrompt())
    dispatchBeforeInstallPrompt()

    expect(result.current.state).toBe('promptable')
  })

  it('calls preventDefault on the captured beforeinstallprompt event', () => {
    renderHook(() => useInstallPrompt())

    const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
    event.prompt = vi.fn().mockResolvedValue(undefined)
    event.userChoice = Promise.resolve({ outcome: 'dismissed' })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    window.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalledOnce()
  })

  it('promptInstall() calls the captured event\'s prompt()', async () => {
    const { result } = renderHook(() => useInstallPrompt())
    const promptSpy = vi.fn().mockResolvedValue(undefined)
    dispatchBeforeInstallPrompt({ prompt: promptSpy })

    await result.current.promptInstall()

    expect(promptSpy).toHaveBeenCalledOnce()
  })

  it('does nothing when promptInstall() is called before any beforeinstallprompt event', async () => {
    const { result } = renderHook(() => useInstallPrompt())

    await expect(result.current.promptInstall()).resolves.toBeUndefined()
  })

  it('does not register duplicate listeners when beforeinstallprompt fires more than once', () => {
    const { result } = renderHook(() => useInstallPrompt())

    dispatchBeforeInstallPrompt()
    expect(result.current.state).toBe('promptable')

    const secondPromptSpy = vi.fn().mockResolvedValue(undefined)
    dispatchBeforeInstallPrompt({ prompt: secondPromptSpy })
    expect(result.current.state).toBe('promptable')
  })

  it('cleans up its listeners on unmount so a remount does not accumulate duplicates', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useInstallPrompt())
    const addedCount = addSpy.mock.calls.filter(([type]) => type === 'beforeinstallprompt').length
    expect(addedCount).toBe(1)

    unmount()

    const removedCount = removeSpy.mock.calls.filter(
      ([type]) => type === 'beforeinstallprompt',
    ).length
    expect(removedCount).toBe(1)

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})
