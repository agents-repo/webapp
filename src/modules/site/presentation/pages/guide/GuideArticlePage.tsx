import { Container } from 'react-bootstrap'
import { Navigate, useParams } from 'react-router-dom'
import { getGuideBySlug } from '../../../application/guide/guideManifest.ts'
import { siteRoutes } from '../../routes/siteRoutes.ts'
import GuideLayout from './GuideLayout.tsx'
import GuideMarkdown from './GuideMarkdown.tsx'

function GuideArticlePage() {
  const { slug } = useParams()
  const entry = slug ? getGuideBySlug(slug) : undefined

  if (!entry) {
    return <Navigate to={siteRoutes.guide} replace />
  }

  return (
    <GuideLayout activeSlug={entry.slug}>
      <Container fluid className="px-0">
        <header className="guide-article-header mb-4">
          <h1 className="h2 mb-2">{entry.title}</h1>
          <p className="text-body-secondary mb-0">{entry.description}</p>
        </header>
        <GuideMarkdown markdown={entry.bodyMarkdown} />
        <footer className="guide-article-footer mt-4 pt-3 border-top">
          <a className="btn btn-outline-secondary btn-sm" href={`/guide/${entry.slug}.md`} download>
            Download Markdown
          </a>
        </footer>
      </Container>
    </GuideLayout>
  )
}

export default GuideArticlePage
