import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PackageMarkdown from './PackageMarkdown'

describe('PackageMarkdown', () => {
  afterEach(() => {
    cleanup()
  })

  it('opens http(s) links in a new tab and omits unsafe javascript URLs', () => {
    render(
      <PackageMarkdown markdown="[ok](https://example.com/docs) and [bad](javascript:alert(1))" />,
    )

    const safeLink = screen.getByRole('link', { name: 'ok' })
    expect(safeLink).toHaveAttribute('href', 'https://example.com/docs')
    expect(safeLink).toHaveAttribute('target', '_blank')
    expect(safeLink).toHaveAttribute('rel', 'noreferrer noopener')

    expect(screen.queryByRole('link', { name: 'bad' })).not.toBeInTheDocument()
    expect(screen.getByText(/bad/)).toBeInTheDocument()
  })

  it('keeps relative markdown links without a new-tab target', () => {
    render(<PackageMarkdown markdown="[local](#readme)" />)

    const relativeLink = screen.getByRole('link', { name: 'local' })
    expect(relativeLink).toHaveAttribute('href', '#readme')
    expect(relativeLink).not.toHaveAttribute('target')
  })
})
