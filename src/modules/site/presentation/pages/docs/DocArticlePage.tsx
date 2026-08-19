import { Navigate, useParams } from 'react-router-dom'
import { getDocBySlug, getDocDetailPath } from '../../../application/docs/docsManifest.ts'
import { publicSitePath, siteRoutes } from '../../routes/siteRoutes.ts'
import DocLayout from './DocLayout.tsx'
import DocMarkdown from './DocMarkdown.tsx'

function DocArticlePage() {
  const { slug } = useParams()
  const entry = slug ? getDocBySlug(slug) : undefined

  if (!entry) {
    return <Navigate to={publicSitePath(siteRoutes.docs)} replace />
  }

  const markdownDownloadHref = `${getDocDetailPath(entry.slug)}.md`

  return (
    <DocLayout activeSlug={entry.slug}>
      <header className="docs-article-header mb-4">
        <h1 className="h2 mb-2">{entry.title}</h1>
        <p className="text-body-secondary mb-0">{entry.description}</p>
      </header>
      <DocMarkdown markdown={entry.bodyMarkdown} />
      <footer className="docs-article-footer mt-4 pt-3 border-top">
        <a className="btn btn-outline-secondary btn-sm" href={markdownDownloadHref} download>
          Download Markdown
        </a>
      </footer>
    </DocLayout>
  )
}

export default DocArticlePage
