import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useOptionalRegistryCatalog } from '../../../registry/presentation/catalog/registryCatalogContext.ts'
import { formatDocumentTitle } from './useDocumentTitle'
import { getSitePageMeta } from './sitePageMeta'

function RouteDocumentTitle() {
  const { pathname } = useLocation()
  const catalogContext = useOptionalRegistryCatalog()
  const catalog = catalogContext?.catalog ?? null
  const catalogResolved = catalogContext ? !catalogContext.isLoading || catalog !== null : false

  useEffect(() => {
    const pageMeta = getSitePageMeta(pathname, catalog, catalogResolved)
    document.title = formatDocumentTitle(pageMeta.title)
  }, [catalog, catalogResolved, pathname])

  return null
}

export default RouteDocumentTitle
