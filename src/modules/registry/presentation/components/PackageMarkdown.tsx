import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

const markdownComponents: Components = {
  h1: ({ children }) => <h2 className="h4">{children}</h2>,
  h2: ({ children }) => <h3 className="h5">{children}</h3>,
  h3: ({ children }) => <h4 className="h6">{children}</h4>,
  a: ({ href, children }) => {
    const isExternal = typeof href === 'string' && /^https?:/i.test(href)
    return (
      <a href={href} {...(isExternal ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
        {children}
      </a>
    )
  },
}

interface PackageMarkdownProps {
  readonly markdown: string
}

function PackageMarkdown({ markdown }: PackageMarkdownProps) {
  return (
    <div className="package-detail-markdown">
      <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown}
      </Markdown>
    </div>
  )
}

export default PackageMarkdown
