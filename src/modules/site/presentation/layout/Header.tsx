import type { ReactNode } from 'react'
import { faBook, faBoxesStacked, faCircleInfo, faEnvelope, faHandsHelping, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { Link, NavLink, useLocation } from 'react-router-dom'
import brandLogo from '../../../../assets/logo/agents-repo-logo.svg'
import type { RegistryCatalogStatusNote } from '../../application/websiteSettings/registryCatalogStatusNote'
import { normalizeSitePathname, publicSitePath, siteRoutes } from '../routes/siteRoutes'
import PwaInstallControl from './PwaInstallControl'
import ThemeModeDropdown from './ThemeModeDropdown'
import WebsiteSettingsControl from './WebsiteSettingsControl'

interface HeaderProps {
  readonly searchSlot?: ReactNode
  readonly onRegistrySettingsSaved?: () => void
  readonly registryCatalogStatusNote?: RegistryCatalogStatusNote | null
}

const aboutNavItems = [
  { to: siteRoutes.about, label: 'About', icon: faCircleInfo },
  { to: siteRoutes.community, label: 'Community', icon: faUsers },
  { to: siteRoutes.contact, label: 'Contact', icon: faEnvelope },
] as const

function Header({ searchSlot, onRegistrySettingsSaved, registryCatalogStatusNote }: HeaderProps) {
  const location = useLocation()
  const currentPath = normalizeSitePathname(location.pathname)
  const aboutNavActive = aboutNavItems.some((item) => currentPath === item.to)

  return (
    <Navbar
      sticky="top"
      bg="dark"
      variant="dark"
      data-bs-theme="dark"
      expand="lg"
      collapseOnSelect
      className="border-bottom border-secondary-subtle py-2 app-navbar"
      aria-label="Primary"
    >
      <Container className="gap-2 app-navbar-main">
        <Navbar.Brand as={Link} to={publicSitePath(siteRoutes.home)} className="d-flex align-items-center gap-2 fw-semibold">
          <img src={brandLogo} width="30" height="30" alt="Agents Repo logo" />
          <span>Agents Repo</span>
        </Navbar.Brand>

        <div className="app-navbar-search-wrapper d-none d-lg-flex flex-grow-1 justify-content-center">
          {searchSlot ? <div className="app-navbar-search">{searchSlot}</div> : null}
        </div>

        <Navbar.Toggle aria-controls="site-navbar-nav" className="ms-auto" />

        <Navbar.Collapse id="site-navbar-nav">
          <Nav className="ms-lg-auto align-items-lg-center gap-lg-2 flex-column flex-lg-row pt-2 pt-lg-0" navbar>
            <Nav.Link as={NavLink} to={publicSitePath(siteRoutes.packages)} className="app-nav-link px-2">
              <FontAwesomeIcon icon={faBoxesStacked} className="me-1" aria-hidden="true" />
              Packages
            </Nav.Link>
            <Nav.Link as={NavLink} to={publicSitePath(siteRoutes.docs)} className="app-nav-link px-2">
              <FontAwesomeIcon icon={faBook} className="me-1" aria-hidden="true" />
              Docs
            </Nav.Link>
            <NavDropdown
              id="site-about-nav"
              title={
                <>
                  <FontAwesomeIcon icon={faCircleInfo} className="me-1" aria-hidden="true" />
                  About
                  {aboutNavActive ? <span className="visually-hidden">(current)</span> : null}
                </>
              }
              className="d-none d-lg-block app-about-nav"
              active={aboutNavActive}
              menuVariant="dark"
              align="end"
            >
              {aboutNavItems.map((item) => {
                const itemCurrent = currentPath === item.to

                return (
                  <NavDropdown.Item
                    as={Link}
                    to={publicSitePath(item.to)}
                    key={item.to}
                    className={itemCurrent ? 'active' : undefined}
                    aria-current={itemCurrent ? 'page' : undefined}
                  >
                    <FontAwesomeIcon icon={item.icon} className="me-2" aria-hidden="true" />
                    {item.label}
                  </NavDropdown.Item>
                )
              })}
            </NavDropdown>
            {aboutNavItems.map((item) => {
              const itemCurrent = currentPath === item.to

              return (
                <Nav.Link
                  key={item.to}
                  as={Link}
                  to={publicSitePath(item.to)}
                  className="app-nav-link px-2 d-lg-none"
                  active={itemCurrent}
                  aria-current={itemCurrent ? 'page' : undefined}
                >
                  <FontAwesomeIcon icon={item.icon} className="me-1" aria-hidden="true" />
                  {item.label}
                </Nav.Link>
              )
            })}
            <Nav.Link as={NavLink} to={publicSitePath(siteRoutes.helpUs)} className="app-nav-link px-2">
              <FontAwesomeIcon icon={faHandsHelping} className="me-1" aria-hidden="true" />
              Help Us
            </Nav.Link>
            <Nav.Item className="ms-lg-2 d-flex align-items-center">
              <PwaInstallControl />
            </Nav.Item>
            <Nav.Item className="ms-lg-2 d-flex align-items-center">
              <WebsiteSettingsControl
                onSaved={onRegistrySettingsSaved}
                registryCatalogStatusNote={registryCatalogStatusNote}
              />
            </Nav.Item>
            <Nav.Item className="ms-lg-2 d-flex align-items-center">
              <ThemeModeDropdown />
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header
