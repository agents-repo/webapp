import { useState, type ReactNode } from 'react'
import { Button, Col, Container, Offcanvas, Row } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import DocSearch from './DocSearch.tsx'
import DocsNav from './DocsNav.tsx'

const DOCS_NAV_OFFCANVAS_ID = 'docs-nav-offcanvas'
const DOCS_NAV_OFFCANVAS_TITLE_ID = 'docs-nav-offcanvas-title'

interface DocLayoutProps {
  readonly children: ReactNode
  readonly activeSlug?: string
}

function DocLayout({ children, activeSlug }: DocLayoutProps) {
  const location = useLocation()
  const [docsNavOpen, setDocsNavOpen] = useState(false)
  const [docsNavPath, setDocsNavPath] = useState(location.pathname)

  if (docsNavPath !== location.pathname) {
    setDocsNavPath(location.pathname)
    setDocsNavOpen(false)
  }

  return (
    <div className="py-5">
      <Container>
        <Row className="g-4">
          <Col lg={3} xl={3} className="d-none d-lg-block">
            <nav className="docs-sidebar" aria-label="Docs">
              <DocSearch key={`sidebar-${location.pathname}`} />
              <DocsNav activeSlug={activeSlug} />
            </nav>
          </Col>
          <Col lg={9} xl={8}>
            <div className="docs-mobile-toolbar d-flex d-lg-none align-items-start gap-2 mb-3">
              <div className="docs-mobile-toolbar__search flex-grow-1 min-w-0">
                <DocSearch key={`mobile-${location.pathname}`} />
              </div>
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                className="flex-shrink-0"
                aria-expanded={docsNavOpen}
                aria-controls={DOCS_NAV_OFFCANVAS_ID}
                onClick={() => setDocsNavOpen(true)}
              >
                Browse docs
              </Button>
            </div>
            <article className="docs-article">{children}</article>
          </Col>
        </Row>
      </Container>
      <Offcanvas
        show={docsNavOpen}
        onHide={() => setDocsNavOpen(false)}
        placement="start"
        className="d-lg-none"
        id={DOCS_NAV_OFFCANVAS_ID}
        aria-labelledby={DOCS_NAV_OFFCANVAS_TITLE_ID}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id={DOCS_NAV_OFFCANVAS_TITLE_ID}>Docs</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <nav aria-label="Docs topics">
            <DocsNav activeSlug={activeSlug} />
          </nav>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  )
}

export default DocLayout
