import type { ReactNode } from 'react'
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
      className="border-bottom border-secondary-subtle py-2 app-navbar"
    >
      <Container className="gap-2">
        <Navbar.Brand as={NavLink} to={siteRoutes.home} className="d-flex align-items-center gap-2 fw-semibold">
          <img src={brandLogo} width="30" height="30" alt="Agents Repo logo" />
          <span>Agents Repo</span>
        </Navbar.Brand>

        <Nav className="ms-auto align-items-center gap-2 flex-wrap" navbar>
          <Nav.Link as={NavLink} to={siteRoutes.home} end className="app-nav-link px-2">
            Home
          </Nav.Link>
          <Nav.Link as={NavLink} to={siteRoutes.about} className="app-nav-link px-2">
            About
          </Nav.Link>
          <Nav.Link as={NavLink} to={siteRoutes.contact} className="app-nav-link px-2">
            Contact
          </Nav.Link>
          <Nav.Link as={NavLink} to={siteRoutes.helpUs} className="app-nav-link px-2">
            Help Us
          </Nav.Link>
          <Badge bg="primary" pill className="text-uppercase fw-semibold ms-lg-1">
            Registry
          </Badge>
        </Nav>
      </Container>

      {searchSlot ? (
        <Container className="pb-2 pb-lg-0 app-navbar-search">{searchSlot}</Container>
      ) : null}
    </Navbar>
  )
}

export default Header
