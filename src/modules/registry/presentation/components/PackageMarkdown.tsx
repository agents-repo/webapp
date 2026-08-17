import { Children, isValidElement, type ReactNode } from 'react'
import Markdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { MermaidDiagram } from './MermaidDiagram'

interface CodeFenceProps {
  readonly className?: string
  readonly children?: ReactNode
}

function hasLanguageToken(className: string | undefined, language: string): boolean {
  if (!className) {
    return false
  }
  const expected = `language-${language}`
  return className.split(/\s+/).some((token) => token.toLowerCase() === expected)
}

function collectText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(collectText).join('')
  }
  if (!isValidElement<CodeFenceProps>(node)) {
    return ''
  }
  return collectText(node.props.children)
}

function mermaidSourceFromPreChildren(children: ReactNode): string | undefined {
  const [first] = Children.toArray(children)
  if (!isValidElement<CodeFenceProps>(first)) {
    return undefined
  }
  if (!hasLanguageToken(first.props.className, 'mermaid')) {
    return undefined
  }
  return collectText(first.props.children)
}

function PackageMarkdownPre({ children }: { readonly children?: ReactNode }) {
  const mermaidSource = mermaidSourceFromPreChildren(children)
  if (mermaidSource !== undefined) {
    return <MermaidDiagram source={mermaidSource} />
  }
  return <pre>{children}</pre>
}

const markdownComponents: Components = {
  h1: ({ children }) => <h2 className="h4">{children}</h2>,
  h2: ({ children }) => <h3 className="h5">{children}</h3>,
  h3: ({ children }) => <h4 className="h6">{children}</h4>,
  a: ({ href, children }) => {
    const safeHref = typeof href === 'string' ? defaultUrlTransform(href) : ''
    if (!safeHref) {
      return <span>{children}</span>
    }
    const isExternal = /^https?:/i.test(safeHref)
    return (
      <a href={safeHref} {...(isExternal ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
        {children}
      </a>
    )
  },
  pre: PackageMarkdownPre,
}

interface PackageMarkdownProps {
  readonly markdown: string
}

function PackageMarkdown({ markdown }: PackageMarkdownProps) {
  return (
    <div className="package-detail-markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        urlTransform={defaultUrlTransform}
        components={markdownComponents}
      >
        {markdown}
      </Markdown>
    </div>
  )
}

export default PackageMarkdown
