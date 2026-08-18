import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PackageMarkdown from './PackageMarkdown'

const mermaidMocks = vi.hoisted(() => ({
  initialize: vi.fn(),
  render: vi.fn(),
}))

vi.mock('mermaid', () => ({
  default: {
    initialize: mermaidMocks.initialize,
    render: mermaidMocks.render,
  },
}))

describe('PackageMarkdown', () => {
  beforeEach(() => {
    mermaidMocks.initialize.mockReset()
    mermaidMocks.render.mockReset()
    mermaidMocks.render.mockResolvedValue({ svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>' })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mermaid-diagram')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
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

  it('keeps non-mermaid fences as pre/code including flowchart language', () => {
    const markdown = ['```flowchart', 'st=>start: Start', '```', '', '```js', 'const n = 1', '```'].join(
      '\n',
    )

    render(<PackageMarkdown markdown={markdown} />)

    expect(document.querySelector('code.language-flowchart')).not.toBeNull()
    expect(document.querySelector('code.language-js')).not.toBeNull()
    expect(screen.queryByRole('img', { name: 'Mermaid diagram' })).not.toBeInTheDocument()
    expect(mermaidMocks.render).not.toHaveBeenCalled()
  })

  it('renders language-mermaid fences as a diagram image outside pre', async () => {
    const markdown = ['```mermaid', 'flowchart TD', '  startNode[Start] --> endNode[End]', '```'].join(
      '\n',
    )

    render(<PackageMarkdown markdown={markdown} />)

    const image = await screen.findByRole('img', { name: 'Mermaid diagram' })
    expect(image.closest('pre')).toBeNull()
    expect(document.querySelector('div.package-detail-markdown > pre')).toBeNull()
  })

  it('falls back to the mermaid fence when render fails', async () => {
    mermaidMocks.render.mockRejectedValue(new Error('parse failed'))
    const markdown = ['```mermaid', 'not a valid diagram', '```'].join('\n')

    render(<PackageMarkdown markdown={markdown} />)

    await waitFor(() => {
      expect(document.querySelector('code.language-mermaid')).not.toBeNull()
    })
    expect(screen.queryByRole('img', { name: 'Mermaid diagram' })).not.toBeInTheDocument()
    expect(document.querySelector('code.language-mermaid')).toHaveTextContent('not a valid diagram')
  })

  it('renders YAML frontmatter as nested metadata tables and GFM for the body', () => {
    const markdown = [
      '---',
      'name: ai-first-chat',
      'description: Talk-only chat about AI-first projects.',
      'version: 1.0.0',
      'license: MIT',
      'inputs:',
      '  - name: user-message',
      '    type: string',
      '    description: The user question.',
      'outputs:',
      '  - name: reply',
      '    type: string',
      '    description: Conversational reply.',
      '---',
      '',
      '# Overview',
      '',
      'Hello from the body.',
    ].join('\n')

    render(<PackageMarkdown markdown={markdown} />)

    expect(screen.getByRole('rowheader', { name: 'name' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'ai-first-chat' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader', { name: 'type' })).toHaveLength(2)
    expect(screen.getByRole('cell', { name: 'user-message' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'reply' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByText('Hello from the body.')).toBeInTheDocument()
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('renders GFM pipe tables in the markdown body', () => {
    const markdown = ['| Col |', '| --- |', '| cell |'].join('\n')

    render(<PackageMarkdown markdown={markdown} />)

    expect(screen.getByRole('columnheader', { name: 'Col' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'cell' })).toBeInTheDocument()
  })

  it('keeps unclosed YAML frontmatter as ordinary markdown', () => {
    const markdown = '---\nname: ai-first-chat\n\n# Overview'

    render(<PackageMarkdown markdown={markdown} />)

    expect(screen.getByRole('separator')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.queryByRole('rowheader', { name: 'name' })).not.toBeInTheDocument()
  })
})
