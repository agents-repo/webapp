import { useEffect, useId, useState } from 'react'
import { Spinner } from 'react-bootstrap'

interface MermaidDiagramProps {
  readonly source: string
}

type MermaidTheme = 'dark' | 'default'

interface MermaidRenderResult {
  readonly source: string
  readonly theme: MermaidTheme
  readonly imageUrl?: string
}

let mermaidRenderSeq = 0

function nextMermaidRenderId(reactId: string): string {
  mermaidRenderSeq += 1
  const safeId = reactId.replaceAll(/[^a-zA-Z0-9_-]/g, '_')
  return `mermaid${safeId}${mermaidRenderSeq}`
}

function readAppliedMermaidTheme(): MermaidTheme {
  return document.documentElement.dataset.bsTheme === 'dark' ? 'dark' : 'default'
}

function useAppliedMermaidTheme(): MermaidTheme {
  const [theme, setTheme] = useState(readAppliedMermaidTheme)

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setTheme(readAppliedMermaidTheme())
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-bs-theme'] })
    return () => {
      observer.disconnect()
    }
  }, [])

  return theme
}

function MermaidFallback({ source }: MermaidDiagramProps) {
  return (
    <pre>
      <code className="language-mermaid">{source}</code>
    </pre>
  )
}

function MermaidLoadingStatus() {
  return (
    <output className="package-detail-mermaid package-detail-mermaid-loading d-flex justify-content-center py-3">
      <span className="visually-hidden">Loading diagram</span>
      <Spinner animation="border" size="sm" aria-hidden="true" />
    </output>
  )
}

function isCurrentResult(
  result: MermaidRenderResult | null,
  source: string,
  theme: MermaidTheme,
): result is MermaidRenderResult {
  return result !== null && result.source === source && result.theme === theme
}

export function MermaidDiagram({ source }: MermaidDiagramProps) {
  const reactId = useId()
  const appliedTheme = useAppliedMermaidTheme()
  const [result, setResult] = useState<MermaidRenderResult | null>(null)
  const descriptionId = `mermaid-source-${reactId.replaceAll(/[^a-zA-Z0-9_-]/g, '_')}`

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | undefined
    const renderId = nextMermaidRenderId(reactId)

    const renderDiagram = async (): Promise<void> => {
      try {
        const mermaidModule = await import('mermaid')
        const mermaid = mermaidModule.default
        mermaid.initialize({
          securityLevel: 'strict',
          startOnLoad: false,
          theme: appliedTheme,
        })
        const { svg } = await mermaid.render(renderId, source)
        if (cancelled) {
          return
        }
        if (!svg) {
          setResult({ source, theme: appliedTheme })
          return
        }
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
        objectUrl = URL.createObjectURL(blob)
        if (cancelled) {
          URL.revokeObjectURL(objectUrl)
          return
        }
        setResult({ source, theme: appliedTheme, imageUrl: objectUrl })
      } catch {
        if (!cancelled) {
          setResult({ source, theme: appliedTheme })
        }
      }
    }

    void renderDiagram()

    return () => {
      cancelled = true
      if (objectUrl === undefined) {
        return
      }
      const revokedUrl = objectUrl
      URL.revokeObjectURL(revokedUrl)
      setResult((previous) => (previous?.imageUrl === revokedUrl ? null : previous))
    }
  }, [appliedTheme, reactId, source])

  if (!isCurrentResult(result, source, appliedTheme)) {
    return <MermaidLoadingStatus />
  }

  if (result.imageUrl === undefined) {
    return <MermaidFallback source={source} />
  }

  return (
    <div className="package-detail-mermaid">
      <img
        className="package-detail-mermaid-image"
        src={result.imageUrl}
        alt="Mermaid diagram"
        aria-describedby={descriptionId}
      />
      <p id={descriptionId} className="visually-hidden">
        {source}
      </p>
    </div>
  )
}
