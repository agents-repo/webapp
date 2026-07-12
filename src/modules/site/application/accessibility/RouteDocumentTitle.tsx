import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { formatDocumentTitle } from './useDocumentTitle'
import { getSitePageMeta } from './sitePageMeta'

function RouteDocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const pageMeta = getSitePageMeta(pathname)
    document.title = formatDocumentTitle(pageMeta.title)
  }, [pathname])

  return null
}

export default RouteDocumentTitle
