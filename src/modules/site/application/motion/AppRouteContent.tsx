import { useMemo, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { isDocsSitePath } from '../docs/isDocsSitePath.ts'
import { stripLocalePrefix } from '../i18n/localePath.ts'
import { isPackageCatalogListSitePath } from '../../../registry/application/packageSiteRoutes.ts'
import { useRouteEnterAnimation } from './useRouteEnterAnimation'

function shouldUseAppRouteEnterAnimation(pathnameWithoutLocale: string): boolean {
  if (isDocsSitePath(pathnameWithoutLocale)) {
    return false
  }

  if (isPackageCatalogListSitePath(pathnameWithoutLocale)) {
    return false
  }

  return true
}

interface AppRouteContentProps {
  readonly children: ReactNode
}

function AppRouteContent({ children }: AppRouteContentProps) {
  const location = useLocation()
  const pathnameWithoutLocale = useMemo(
    () => stripLocalePrefix(location.pathname),
    [location.pathname],
  )
  const contentRef = useRouteEnterAnimation(location.pathname, {
    enabled: shouldUseAppRouteEnterAnimation(pathnameWithoutLocale),
  })

  return (
    <div ref={contentRef} className="app-route-content app-route-content--settled">
      {children}
    </div>
  )
}

export default AppRouteContent
