import type { ComponentProps } from 'react'
import type { Components } from 'react-markdown'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { publicSitePath } from '../../routes/siteRoutes.ts'
import { isInternalSiteHref } from './docInternalHref.ts'

type DocMarkdownAnchorProps = ComponentProps<'a'>

function DocMarkdownAnchor({ href, children, ...props }: DocMarkdownAnchorProps) {
  if (href && isInternalSiteHref(href)) {
    return (
      <Link to={publicSitePath(href)} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
      {children}
    </a>
  )
}

const docMarkdownComponents: Components = {
  a: DocMarkdownAnchor,
}

interface DocMarkdownProps {
  readonly markdown: string
}

function DocMarkdown({ markdown }: DocMarkdownProps) {
  return (
    <div className="docs-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={defaultUrlTransform}
        components={docMarkdownComponents}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

export default DocMarkdown
