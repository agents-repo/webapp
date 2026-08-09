import type { ReactNode } from 'react'
import { Col, Nav, Row } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'
import {
  getGuideDetailPath,
  listGuideSectionGroups,
} from '../../../application/guide/guideManifest.ts'
import { siteRoutes } from '../../routes/siteRoutes.ts'
import GuideSearch from './GuideSearch.tsx'

interface GuideLayoutProps {
  readonly children: ReactNode
  readonly activeSlug?: string
}

function GuideLayout({ children, activeSlug }: GuideLayoutProps) {
  const location = useLocation()
  const sectionGroups = listGuideSectionGroups()

  return (
    <div className="py-5 guide-layout">
      <Row className="g-4">
        <Col lg={3} xl={3}>
          <nav className="guide-sidebar" aria-label="Guide">
            <GuideSearch key={location.pathname} />
            <Nav className="flex-column gap-1">
              <Nav.Link
                as={NavLink}
                to={siteRoutes.guide}
                end
                className="guide-sidebar-link"
                aria-current={location.pathname === siteRoutes.guide ? 'page' : undefined}
              >
                Guides overview
              </Nav.Link>
            </Nav>
            {sectionGroups.map((group) => (
              <div key={group.section} className="guide-sidebar-section mt-3">
                <h2 className="h6 text-uppercase text-body-secondary px-2 mb-2">{group.section}</h2>
                <Nav className="flex-column gap-1">
                  {group.entries.map((entry) => (
                    <Nav.Link
                      key={entry.slug}
                      as={NavLink}
                      to={getGuideDetailPath(entry.slug)}
                      className="guide-sidebar-link"
                      aria-current={activeSlug === entry.slug ? 'page' : undefined}
                    >
                      {entry.title}
                    </Nav.Link>
                  ))}
                </Nav>
              </div>
            ))}
          </nav>
        </Col>
        <Col lg={9} xl={8}>
          <article className="guide-article">{children}</article>
        </Col>
      </Row>
    </div>
  )
}

export default GuideLayout
