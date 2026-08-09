import type { ReactNode } from 'react'
import { Col, Nav, Row } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'
import {
  getDocDetailPath,
  listDocSectionGroups,
} from '../../../application/docs/docsManifest.ts'
import { siteRoutes } from '../../routes/siteRoutes.ts'
import DocSearch from './DocSearch.tsx'

interface DocLayoutProps {
  readonly children: ReactNode
  readonly activeSlug?: string
}

function DocLayout({ children, activeSlug }: DocLayoutProps) {
  const location = useLocation()
  const sectionGroups = listDocSectionGroups()

  return (
    <div className="py-5 docs-layout">
      <Row className="g-4">
        <Col lg={3} xl={3}>
          <nav className="docs-sidebar" aria-label="Docs">
            <DocSearch key={location.pathname} />
            <Nav className="flex-column gap-1">
              <Nav.Link
                as={NavLink}
                to={siteRoutes.docs}
                end
                className="docs-sidebar-link"
                aria-current={location.pathname === siteRoutes.docs ? 'page' : undefined}
              >
                Docs overview
              </Nav.Link>
            </Nav>
            {sectionGroups.map((group) => (
              <div key={group.section} className="docs-sidebar-section mt-3">
                <h2 className="h6 text-uppercase text-body-secondary px-2 mb-2">{group.section}</h2>
                <Nav className="flex-column gap-1">
                  {group.entries.map((entry) => (
                    <Nav.Link
                      key={entry.slug}
                      as={NavLink}
                      to={getDocDetailPath(entry.slug)}
                      className="docs-sidebar-link"
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
          <article className="docs-article">{children}</article>
        </Col>
      </Row>
    </div>
  )
}

export default DocLayout
