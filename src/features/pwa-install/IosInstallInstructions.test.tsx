import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { IosInstallInstructions } from './IosInstallInstructions'

describe('IosInstallInstructions', () => {
  it('renders the title and 3 numbered steps', () => {
    render(<IosInstallInstructions onClose={() => {}} />)

    expect(screen.getByText(/installeren op iphone/i)).toBeInTheDocument()
    expect(screen.getByText(/deel-icoon/i)).toBeInTheDocument()
    expect(screen.getByText(/zet op beginscherm/i)).toBeInTheDocument()
    expect(screen.getByText(/voeg toe/i)).toBeInTheDocument()
  })

  it('calls onClose when the close control is tapped', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<IosInstallInstructions onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /sluiten/i }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
