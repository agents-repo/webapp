import type { ComponentProps } from 'react'
import type { Components } from 'react-markdown'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { useLocalizedSitePath } from '../../../application/i18n/useLocalizedSitePath.ts'
import { isInternalSiteHref } from './docInternalHref.ts'

type DocMarkdownAnchorProps = ComponentProps<'a'>

function DocMarkdownAnchor({ href, children, ...props }: DocMarkdownAnchorProps) {
  const localizedSitePath = useLocalizedSitePath()

  if (href && isInternalSiteHref(href)) {
    return (
      <Link to={localizedSitePath(href)} {...props}>
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
