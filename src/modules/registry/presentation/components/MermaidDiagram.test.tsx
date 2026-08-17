import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MermaidDiagram } from './MermaidDiagram'

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

const mermaidSource = 'flowchart TD\n  startNode[Start] --> endNode[End]'

describe('MermaidDiagram', () => {
  beforeEach(() => {
    mermaidMocks.initialize.mockReset()
    mermaidMocks.render.mockReset()
    document.documentElement.removeAttribute('data-bs-theme')
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mermaid-diagram')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows loading status until mermaid resolves', () => {
    mermaidMocks.render.mockReturnValue(new Promise(() => {}))

    render(<MermaidDiagram source={mermaidSource} />)

    expect(screen.getByText('Loading diagram')).toBeInTheDocument()
    expect(screen.getByText('Loading diagram').closest('output')).not.toBeNull()
  })

  it('renders an accessible image after a successful mermaid render', async () => {
    mermaidMocks.render.mockResolvedValue({ svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>' })

    render(<MermaidDiagram source={mermaidSource} />)

    const image = await screen.findByRole('img', { name: 'Mermaid diagram' })
    expect(image).toHaveAttribute('src', 'blob:mermaid-diagram')
    expect(image.closest('pre')).toBeNull()
    expect(screen.getByText(/flowchart TD/)).toHaveClass('visually-hidden')
    expect(mermaidMocks.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        securityLevel: 'strict',
        startOnLoad: false,
        theme: 'default',
      }),
    )
  })

  it('uses mermaid dark theme when html data-bs-theme is dark', async () => {
    document.documentElement.dataset.bsTheme = 'dark'
    mermaidMocks.render.mockResolvedValue({ svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>' })

    render(<MermaidDiagram source={mermaidSource} />)

    await screen.findByRole('img', { name: 'Mermaid diagram' })
    expect(mermaidMocks.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' }),
    )
  })

  it('falls back to the original fenced source when mermaid render fails', async () => {
    mermaidMocks.render.mockRejectedValue(new Error('parse failed'))

    render(<MermaidDiagram source={mermaidSource} />)

    await waitFor(() => {
      expect(document.querySelector('code.language-mermaid')).not.toBeNull()
    })
    expect(screen.queryByRole('img', { name: 'Mermaid diagram' })).not.toBeInTheDocument()
    expect(document.querySelector('code.language-mermaid')).toHaveTextContent('flowchart TD')
  })

  it('falls back when mermaid returns an empty svg', async () => {
    mermaidMocks.render.mockResolvedValue({ svg: '' })

    render(<MermaidDiagram source={mermaidSource} />)

    await waitFor(() => {
      expect(document.querySelector('code.language-mermaid')).not.toBeNull()
    })
    expect(screen.queryByRole('img', { name: 'Mermaid diagram' })).not.toBeInTheDocument()
  })
})
