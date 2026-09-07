import { Alert } from 'react-bootstrap'
import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDocBySlug, getDocDetailPath } from '../../../application/docs/docsManifest.ts'
import { useLocalizedSitePath } from '../../../application/i18n/useLocalizedSitePath.ts'
import { useLocale } from '../../../application/i18n/useLocale.ts'
import { siteRoutes, normalizeSitePathname } from '../../routes/siteRoutes.ts'
import DocLayout from './DocLayout.tsx'
import DocMarkdown from './DocMarkdown.tsx'

function DocArticlePage() {
  const { slug } = useParams()
  const { t } = useTranslation('docs')
  const { locale } = useLocale()
  const localizedSitePath = useLocalizedSitePath()
  const entry = slug ? getDocBySlug(slug, locale) : undefined

  if (!entry) {
    return <Navigate to={localizedSitePath(siteRoutes.docs)} replace />
  }

  const markdownDownloadHref = `${normalizeSitePathname(localizedSitePath(getDocDetailPath(entry.slug)))}.md`

  return (
    <DocLayout activeSlug={entry.slug}>
      {entry.usesEnglishFallback ? (
        <Alert variant="info" className="mb-4">
          {t('article.fallbackBanner')}
        </Alert>
      ) : null}
      <header className="docs-article-header mb-4">
        <h1 className="h2 mb-2">{entry.title}</h1>
        <p className="text-body-secondary mb-0">{entry.description}</p>
      </header>
      <DocMarkdown markdown={entry.bodyMarkdown} />
      <footer className="docs-article-footer mt-4 pt-3 border-top">
        <a className="btn btn-outline-secondary btn-sm" href={markdownDownloadHref} download>
          {t('article.downloadMarkdown')}
        </a>
      </footer>
    </DocLayout>
  )
}

export default DocArticlePage
