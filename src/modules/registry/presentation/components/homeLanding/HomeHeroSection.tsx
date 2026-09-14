import type { ReactNode } from 'react'
import { Badge, Col, Container, Row, Stack } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import brandLogo from '../../../../../assets/logo/agents-repo-logo.svg'
import { useExternalLinkAccessibleName } from '../../../../site/application/accessibility/useExternalLinkAccessibleName'
import { getDocDetailPath } from '../../../../site/application/docs/docsCatalog'
import { GITHUB_ORGANIZATION_URL } from '../../../../site/application/community/socialLinks'
import { useLocalizedSitePath } from '../../../../site/application/i18n/useLocalizedSitePath.ts'
import { getPackagesIndexPath } from '../../../application/packageSiteRoutes'

export interface HomeHeroSectionProps {
  readonly searchControl: ReactNode
  readonly stickySearch: boolean
}

function HomeHeroSection({ searchControl, stickySearch }: HomeHeroSectionProps) {
  const { t } = useTranslation('catalog')
  const localizedSitePath = useLocalizedSitePath()
  const externalLinkName = useExternalLinkAccessibleName()
  const packagesIndexPath = localizedSitePath(getPackagesIndexPath())
  const publishAgentPath = localizedSitePath(getDocDetailPath('submitting-a-package'))

  return (
    <section className="py-4 py-lg-5 border-bottom border-secondary-subtle app-hero">
      <Container>
        <Row className="justify-content-center">
          <Col xl={8} className="text-center">
            <Stack gap={3} className="align-items-center">
              <img src={brandLogo} width="72" height="72" alt={t('home.brandLogoAlt')} />
              <Badge bg="primary" pill>
                {t('home.heroBadge')}
              </Badge>
              <h1 className="display-5 fw-semibold mb-0">{t('home.heroHeading')}</h1>
              <p className="lead fs-6 text-body-secondary mb-0">{t('home.heroLead')}</p>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Link to={packagesIndexPath} className="btn btn-primary">
                  {t('home.browsePackages')}
                </Link>
                <Link to={publishAgentPath} className="btn btn-outline-primary">
                  {t('home.publishAgent')}
                </Link>
                <a
                  href={GITHUB_ORGANIZATION_URL}
                  className="btn btn-outline-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={externalLinkName(t('home.viewOnGitHubAriaLabel'))}
                >
                  {t('home.viewOnGitHub')}
                </a>
              </div>
              <div className={`w-100 hero-search${stickySearch ? ' d-lg-none' : ''}`}>
                {searchControl}
              </div>
            </Stack>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default HomeHeroSection
