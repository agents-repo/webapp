import type { ReactNode } from 'react'
import { Badge, Col, Container, Row, Stack } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import brandLogo from '../../../../../assets/logo/agents-repo-logo.svg'
import { publicSitePath, siteRoutes } from '../../../../site/presentation/routes/siteRoutes'
import { getPackagesIndexPath } from '../../../application/packageSiteRoutes'
import { CLI_QUICKSTART_ID, HOME_HERO_HEADING } from './homeLandingCopy'

export interface HomeHeroSectionProps {
  readonly searchControl: ReactNode
  readonly stickySearch: boolean
}

function HomeHeroSection({ searchControl, stickySearch }: HomeHeroSectionProps) {
  const packagesIndexPath = publicSitePath(getPackagesIndexPath())
  const cliQuickstartHref = `${publicSitePath(siteRoutes.home)}#${CLI_QUICKSTART_ID}`

  return (
    <section className="py-4 py-lg-5 border-bottom border-secondary-subtle app-hero">
      <Container>
        <Row className="justify-content-center">
          <Col xl={8} className="text-center">
            <Stack gap={3} className="align-items-center">
              <img src={brandLogo} width="72" height="72" alt="Agents Repo brand symbol" />
              <Badge bg="primary" pill>
                Curated package registry
              </Badge>
              <h1 className="display-5 fw-semibold mb-0">{HOME_HERO_HEADING}</h1>
              <p className="lead fs-6 text-body-secondary mb-0">
                Agents Repo is an open, curated registry. Find maintained packages, install them with
                the CLI, or try instructions in a browser chat—without rewriting prompts for every
                tool.
              </p>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Link to={packagesIndexPath} className="btn btn-primary">
                  Browse packages
                </Link>
                <Link to={cliQuickstartHref} className="btn btn-outline-primary">
                  Use the CLI
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
