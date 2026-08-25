import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import type { PackageDownloadStats } from '../../domain/downloadStats'
import { PackageDownloadStatsSummary } from './PackageDownloadStatsSummary'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

const sampleStats: PackageDownloadStats = {
  namespace: 'agents-repo',
  package: 'sample-agent',
  downloads: 12,
  downloads7d: 1,
  downloads30d: 3,
  downloads365d: 10,
}

function renderCardStats() {
  return render(
    <PackageDownloadStatsSummary
      stats={sampleStats}
      packageName="sample-agent"
      variant="card"
      controlId="agents-repo--sample-agent"
    />,
  )
}

function mockPrefersReducedMotion(enabled: boolean): void {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: enabled && query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))
}

describe('PackageDownloadStatsSummary', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders stacked download windows on the package detail variant', () => {
    render(
      <PackageDownloadStatsSummary
        stats={sampleStats}
        packageName="sample-agent"
        variant="detail"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Downloads' })).toBeInTheDocument()
    expect(screen.getByText('All time')).toBeInTheDocument()
    expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    expect(screen.getByText('Last 365 days')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('keeps window counts out of the document until the card control opens', () => {
    renderCardStats()

    expect(screen.getByRole('button', { name: '12 downloads for sample-agent' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '12 downloads for sample-agent' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.queryByText('Last 7 days: 1')).not.toBeInTheDocument()
  })

  it('opens window counts on click and dismisses them with Escape', async () => {
    const user = userEvent.setup()
    renderCardStats()

    const trigger = screen.getByRole('button', { name: '12 downloads for sample-agent' })
    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('All time: 12')).toBeInTheDocument()
    expect(screen.getByText('Last 7 days: 1')).toBeInTheDocument()
    expect(screen.getByText('Last 30 days: 3')).toBeInTheDocument()
    expect(screen.getByText('Last 365 days: 10')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => {
      expect(screen.queryByText('Last 7 days: 1')).not.toBeInTheDocument()
    })
  })

  it('opens window counts on hover', async () => {
    const user = userEvent.setup()
    renderCardStats()

    await user.hover(screen.getByRole('button', { name: '12 downloads for sample-agent' }))

    expect(screen.getByText('Last 7 days: 1')).toBeInTheDocument()
  })

  it('does not open on hover when reduced motion is preferred, and still opens on click', async () => {
    mockPrefersReducedMotion(true)
    const user = userEvent.setup()
    renderCardStats()

    const trigger = screen.getByRole('button', { name: '12 downloads for sample-agent' })
    await user.hover(trigger)

    expect(screen.queryByText('Last 7 days: 1')).not.toBeInTheDocument()

    await user.click(trigger)

    expect(screen.getByText('Last 7 days: 1')).toBeInTheDocument()
  })

  it('has no detectable accessibility violations when the popover is open', async () => {
    const user = userEvent.setup()
    const { container } = renderCardStats()

    await user.click(screen.getByRole('button', { name: '12 downloads for sample-agent' }))

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
