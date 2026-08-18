import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isPackageSitePathCatalogMember } from '../../../registry/application/packageSiteRoutes.ts'
import { isCatalogLoadAttemptResolved } from '../../../registry/application/runtimePackageCatalog.ts'
import { useOptionalRegistryCatalog } from '../../../registry/presentation/catalog/registryCatalogContext.ts'
import { formatDocumentTitle } from './useDocumentTitle'
import { getSitePageMeta } from './sitePageMeta'

function RouteDocumentTitle() {
  const { pathname } = useLocation()
  const catalogContext = useOptionalRegistryCatalog()
  const catalog = catalogContext?.catalog ?? null
  const catalogResolved = catalogContext
    ? isCatalogLoadAttemptResolved(catalogContext.isLoading, {
        catalog,
        hasCompletedForcedReload: catalogContext.hasCompletedForcedReload,
        isMember: isPackageSitePathCatalogMember(pathname, catalog),
      })
    : false

  useEffect(() => {
    const pageMeta = getSitePageMeta(pathname, catalog, catalogResolved)
    document.title = formatDocumentTitle(pageMeta.title)
  }, [catalog, catalogResolved, pathname])

  return null
}

export default RouteDocumentTitle
