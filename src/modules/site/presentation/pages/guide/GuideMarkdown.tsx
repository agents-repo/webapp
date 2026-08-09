import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'

function isInternalGuideHref(href: string): boolean {
  return href.startsWith('/guide') || href === '/repositories' || href.startsWith('/repositories/')
}

interface GuideMarkdownProps {
  readonly markdown: string
}

function GuideMarkdown({ markdown }: GuideMarkdownProps) {
  const components: Components = {
    a: ({ href, children, ...props }) => {
      if (href && isInternalGuideHref(href)) {
        return (
          <Link to={href} {...props}>
            {children}
          </Link>
        )
      }

      return (
        <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
          {children}
        </a>
      )
    },
  }

  return (
    <div className="guide-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

export default GuideMarkdown
