import { Nav } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'
import {
  getDocDetailPath,
  listDocSectionGroups,
} from '../../../application/docs/docsManifest.ts'
import { normalizeSitePathname, publicSitePath, siteRoutes } from '../../routes/siteRoutes.ts'

interface DocsNavProps {
  readonly activeSlug?: string
}

function DocsNav({ activeSlug }: DocsNavProps) {
  const location = useLocation()
  const sectionGroups = listDocSectionGroups()

  return (
    <>
      <Nav className="flex-column gap-1">
        <Nav.Link
          as={NavLink}
          to={publicSitePath(siteRoutes.docs)}
          end
          className="docs-sidebar-link"
          aria-current={normalizeSitePathname(location.pathname) === siteRoutes.docs ? 'page' : undefined}
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
                to={publicSitePath(getDocDetailPath(entry.slug))}
                className="docs-sidebar-link"
                aria-current={activeSlug === entry.slug ? 'page' : undefined}
              >
                {entry.title}
              </Nav.Link>
            ))}
          </Nav>
        </div>
      ))}
    </>
  )
}

export default DocsNav
