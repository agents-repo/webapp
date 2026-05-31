import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faEnvelope, faHandsHelping, faHouse } from '@fortawesome/free-solid-svg-icons'
import { Badge, Container, Nav, Navbar } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import brandLogo from '../../../../assets/logo/agents-repo-logo.svg'
import { siteRoutes } from '../routes/siteRoutes'

interface HeaderProps {
  readonly searchSlot?: ReactNode
}

function Header({ searchSlot }: HeaderProps) {
  return (
    <Navbar
      sticky="top"
      bg="dark"
      variant="dark"
      expand="md"
      collapseOnSelect
      className="border-bottom border-secondary-subtle py-2 app-navbar"
    >
      <Container className="gap-2 app-navbar-main">
        <Navbar.Brand as={NavLink} to={siteRoutes.home} className="d-flex align-items-center gap-2 fw-semibold">
          <img src={brandLogo} width="30" height="30" alt="Agents Repo logo" />
          <span>Agents Repo</span>
        </Navbar.Brand>

        <div className="app-navbar-search-wrapper d-none d-md-flex flex-grow-1 justify-content-center">
          {searchSlot ? <div className="app-navbar-search">{searchSlot}</div> : null}
        </div>

        <Navbar.Toggle aria-controls="site-navbar-nav" className="ms-auto" />

        <Navbar.Collapse id="site-navbar-nav" className="app-navbar-collapse">
          <Nav className="ms-md-auto align-items-md-center gap-md-2 flex-column flex-md-row pt-2 pt-md-0" navbar>
            <Nav.Link as={NavLink} to={siteRoutes.home} end className="app-nav-link px-2">
              <FontAwesomeIcon icon={faHouse} className="me-1" aria-hidden="true" />
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to={siteRoutes.about} className="app-nav-link px-2">
              <FontAwesomeIcon icon={faCircleInfo} className="me-1" aria-hidden="true" />
              About
            </Nav.Link>
            <Nav.Link as={NavLink} to={siteRoutes.contact} className="app-nav-link px-2">
              <FontAwesomeIcon icon={faEnvelope} className="me-1" aria-hidden="true" />
              Contact
            </Nav.Link>
            <Nav.Link as={NavLink} to={siteRoutes.helpUs} className="app-nav-link px-2">
              <FontAwesomeIcon icon={faHandsHelping} className="me-1" aria-hidden="true" />
              Help Us
            </Nav.Link>
            <Badge bg="primary" pill className="text-uppercase fw-semibold ms-md-1 mt-1 mt-md-0">
              Registry
            </Badge>
          </Nav>
        </Navbar.Collapse>
      </Container>

    </Navbar>
  )
}

export default Header
