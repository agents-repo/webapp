import type { ReactNode } from 'react'
import { faCheck, faCircleHalfStroke, faCircleInfo, faEnvelope, faHandsHelping, faHouse, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Container, Dropdown, Nav, Navbar } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import brandLogo from '../../../../assets/logo/agents-repo-logo.svg'
import { type ThemeMode } from '../../application/theme/themeMode'
import { useThemeMode } from '../../application/theme/themeModeContext'
import { siteRoutes } from '../routes/siteRoutes'

interface ThemeModeOption {
  readonly mode: ThemeMode
  readonly label: string
  readonly icon: typeof faSun
}

const themeModeOptions: readonly ThemeModeOption[] = [
  { mode: 'light', label: 'Light', icon: faSun },
  { mode: 'dark', label: 'Dark', icon: faMoon },
  { mode: 'auto', label: 'Auto', icon: faCircleHalfStroke },
]

interface HeaderProps {
  readonly searchSlot?: ReactNode
}

function ThemeModeDropdown() {
  const { mode, setMode } = useThemeMode()
  const activeOption = themeModeOptions.find((option) => option.mode === mode) ?? themeModeOptions[1]

  return (
    <Dropdown align="end" className="theme-mode-dropdown">
      <Dropdown.Toggle
        id="theme-mode-dropdown"
        variant="link"
        className="d-inline-flex align-items-center justify-content-center app-theme-toggle"
        aria-label={`Color mode: ${activeOption.label}`}
        title={`Color mode: ${activeOption.label}`}
      >
        <FontAwesomeIcon icon={activeOption.icon} className="fa-fw" aria-hidden="true" />
      </Dropdown.Toggle>

      <Dropdown.Menu data-bs-theme="dark">
        {themeModeOptions.map((option) => (
          <Dropdown.Item
            key={option.mode}
            as="button"
            type="button"
            className="d-flex align-items-center gap-2"
            active={mode === option.mode}
            onClick={() => setMode(option.mode)}
          >
            <FontAwesomeIcon icon={option.icon} className="fa-fw" aria-hidden="true" />
            <span className="flex-grow-1">{option.label}</span>
            {mode === option.mode ? <FontAwesomeIcon icon={faCheck} aria-hidden="true" /> : null}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

function Header({ searchSlot }: HeaderProps) {
  return (
    <Navbar
      sticky="top"
      bg="dark"
      variant="dark"
      data-bs-theme="dark"
      expand="lg"
      collapseOnSelect
      className="border-bottom border-secondary-subtle py-2 app-navbar"
    >
      <Container className="gap-2 app-navbar-main">
        <Navbar.Brand as={NavLink} to={siteRoutes.home} className="d-flex align-items-center gap-2 fw-semibold">
          <img src={brandLogo} width="30" height="30" alt="Agents Repo logo" />
          <span>Agents Repo</span>
        </Navbar.Brand>

        <div className="app-navbar-search-wrapper d-none d-lg-flex flex-grow-1 justify-content-center">
          {searchSlot ? <div className="app-navbar-search">{searchSlot}</div> : null}
        </div>

        <Navbar.Toggle aria-controls="site-navbar-nav" className="ms-auto" />

        <Navbar.Collapse id="site-navbar-nav">
          <Nav className="ms-lg-auto align-items-lg-center gap-lg-2 flex-column flex-lg-row pt-2 pt-lg-0" navbar>
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
