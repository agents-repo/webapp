import { Navigate, useParams } from 'react-router-dom'
import { getRepositoryBySlug } from '../../application/repositories/repositoryManifest.ts'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../routes/siteRoutes.ts'
import RepositoryDetailContent from './RepositoryDetailContent.tsx'

function RepositoryDetailPage() {
  const localizedSitePath = useLocalizedSitePath()
  const { slug } = useParams()
  const entry = slug ? getRepositoryBySlug(slug) : undefined

  if (!entry) {
    return <Navigate to={localizedSitePath(siteRoutes.repositories)} replace />
  }

  return <RepositoryDetailContent entry={entry} />
}

export default RepositoryDetailPage
