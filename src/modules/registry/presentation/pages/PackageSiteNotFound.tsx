import { Card, Container } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { getDocDetailPath } from '../../../site/application/docs/docsCatalog'
import { useLocalizedSitePath } from '../../../site/application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../../../site/presentation/routes/siteRoutes'
import { getPackagesIndexPath } from '../../application/packageSiteRoutes'
import { useRequestedPackagePath } from './useRequestedPackagePath'

function PackageSiteNotFound() {
  const { t } = useTranslation('catalog')
  const localizedSitePath = useLocalizedSitePath()
  const { displayPath, searchQuery } = useRequestedPackagePath()
  const packagesIndexPath = localizedSitePath(getPackagesIndexPath())
  const searchPackagesPath =
    searchQuery !== null
      ? `${packagesIndexPath}?${new URLSearchParams({ q: searchQuery }).toString()}`
      : packagesIndexPath
  const docsPath = localizedSitePath(getDocDetailPath('getting-started'))
  const homePath = localizedSitePath(siteRoutes.home)

  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-3">{t('packageNotFound.title')}</h1>
        <p className="text-body-secondary">
          {displayPath
            ? t('packageNotFound.lead', { path: displayPath })
            : t('packageNotFound.leadGeneric')}
        </p>
        <Card className="border-secondary-subtle">
          <Card.Body>
            <h2 className="h6 mb-3">{t('packageNotFound.recoveryHeading')}</h2>
            <nav aria-label={t('packageNotFound.recoveryHeading')}>
              <ul className="list-unstyled mb-0">
                <li>
                  <NavLink
                    to={searchPackagesPath}
                    aria-label={
                      searchQuery
                        ? t('packageNotFound.searchPackagesAriaLabel', { query: searchQuery })
                        : undefined
                    }
                  >
                    {t('packageNotFound.searchPackages')}
                  </NavLink>
                </li>
                <li>
                  <NavLink to={packagesIndexPath}>{t('packageNotFound.browsePackages')}</NavLink>
                </li>
                <li>
                  <NavLink to={docsPath}>{t('packageNotFound.readDocs')}</NavLink>
                </li>
                <li>
                  <NavLink to={homePath}>{t('packageNotFound.returnHome')}</NavLink>
                </li>
              </ul>
            </nav>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default PackageSiteNotFound
