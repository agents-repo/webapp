import type { ReactNode } from 'react'
import { Badge, Col, Container, Row, Stack } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import brandLogo from '../../../../../assets/logo/agents-repo-logo.svg'
import { applyHashTargetScroll } from '../../../../site/application/accessibility/routeScroll'
import { useLocalizedSitePath } from '../../../../site/application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../../../../site/presentation/routes/siteRoutes'
import { getPackagesIndexPath } from '../../../application/packageSiteRoutes'
import { CLI_QUICKSTART_ID } from './homeLandingCopy'

export interface HomeHeroSectionProps {
  readonly searchControl: ReactNode
  readonly stickySearch: boolean
}

function HomeHeroSection({ searchControl, stickySearch }: HomeHeroSectionProps) {
  const { t } = useTranslation('catalog')
  const localizedSitePath = useLocalizedSitePath()
  const location = useLocation()
  const packagesIndexPath = localizedSitePath(getPackagesIndexPath())
  const cliQuickstartHash = `#${CLI_QUICKSTART_ID}`
  const cliQuickstartHref = `${localizedSitePath(siteRoutes.home)}${cliQuickstartHash}`

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
                <Link
                  to={cliQuickstartHref}
                  className="btn btn-outline-primary"
                  onClick={() => {
                    if (location.hash === cliQuickstartHash) {
                      applyHashTargetScroll(cliQuickstartHash)
                    }
                  }}
                >
                  {t('home.useCli')}
                </Link>
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
