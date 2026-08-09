import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { InstallAvailabilityState } from './types'
import { InstallButton } from './InstallButton'
import { useInstallPrompt } from './useInstallPrompt'

vi.mock('./useInstallPrompt', () => ({
  useInstallPrompt: vi.fn(),
}))

const mockedUseInstallPrompt = vi.mocked(useInstallPrompt)

function mockState(state: InstallAvailabilityState, promptInstall = vi.fn()) {
  mockedUseInstallPrompt.mockReturnValue({ state, promptInstall })
}

describe('InstallButton', () => {
  beforeEach(() => {
    mockedUseInstallPrompt.mockReset()
  })

  it('renders nothing when state is "unknown"', () => {
    mockState('unknown')
    const { container } = render(<InstallButton />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when state is "installed"', () => {
    mockState('installed')
    const { container } = render(<InstallButton />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when state is "unsupported"', () => {
    mockState('unsupported')
    const { container } = render(<InstallButton />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders the "Zet op beginscherm" button when state is "promptable"', () => {
    mockState('promptable')
    render(<InstallButton />)

    expect(screen.getByRole('button', { name: /zet op beginscherm/i })).toBeInTheDocument()
  })

  it('calls promptInstall() when tapped in "promptable" state', async () => {
    const promptInstall = vi.fn()
    mockState('promptable', promptInstall)
    const user = userEvent.setup()
    render(<InstallButton />)

    await user.click(screen.getByRole('button', { name: /zet op beginscherm/i }))

    expect(promptInstall).toHaveBeenCalledOnce()
  })

  it('renders the "Zet op beginscherm" button when state is "ios-manual"', () => {
    mockState('ios-manual')
    render(<InstallButton />)

    expect(screen.getByRole('button', { name: /zet op beginscherm/i })).toBeInTheDocument()
  })

  it('opens the iOS instructions instead of calling promptInstall() when tapped in "ios-manual" state', async () => {
    const promptInstall = vi.fn()
    mockState('ios-manual', promptInstall)
    const user = userEvent.setup()
    render(<InstallButton />)

    await user.click(screen.getByRole('button', { name: /zet op beginscherm/i }))

    expect(promptInstall).not.toHaveBeenCalled()
    expect(screen.getByText(/installeren op iphone/i)).toBeInTheDocument()
  })

  it('closing the iOS instructions does not change the hook state (button stays available)', async () => {
    mockState('ios-manual')
    const user = userEvent.setup()
    render(<InstallButton />)

    await user.click(screen.getByRole('button', { name: /zet op beginscherm/i }))
    await user.click(screen.getByRole('button', { name: /sluiten/i }))

    expect(screen.queryByText(/installeren op iphone/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zet op beginscherm/i })).toBeInTheDocument()
  })
})
