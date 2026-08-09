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
          <p className="text-body-secondary mb-3">{entry.description}</p>
          <p className="mb-0">
            <a className="btn btn-outline-secondary btn-sm" href={`/guide/${entry.slug}.md`} download>
              Download markdown
            </a>
          </p>
        </header>
        <GuideMarkdown markdown={entry.bodyMarkdown} />
      </Container>
    </GuideLayout>
  )
}

export default GuideArticlePage
