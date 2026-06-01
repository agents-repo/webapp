import type { ReactNode } from 'react'
import { useState } from 'react'
import { faCheck, faCircleHalfStroke, faCircleInfo, faEnvelope, faGear, faHandsHelping, faHouse, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Badge, Button, Container, Dropdown, Form, Modal, Nav, Navbar, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import brandLogo from '../../../../assets/logo/agents-repo-logo.svg'
import {
  clearStoredRegistryBaseUrlOverride,
  getStoredRegistryBaseUrlOverride,
  normalizeRegistryBaseUrlOverrideInput,
  setStoredRegistryBaseUrlOverride,
  validateRegistryBaseUrlOverrideInput,
} from '../../../registry/application/registrySourceSettings'
import {
  getConfiguredRegistrySourceConfig,
  getRegistrySourceConfig,
} from '../../../registry/infrastructure/registrySourceConfig'
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
  readonly onRegistrySettingsSaved?: () => void
}

const isSafeExternalHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
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

interface SettingsModalState {
  showModal: boolean
  baseUrlInput: string
  validationError: string | null
}

function RegistrySettingsControl({ onSaved }: { readonly onSaved?: () => void }) {
  const configuredSource = getConfiguredRegistrySourceConfig()
  const initialSource = getRegistrySourceConfig()
  const [currentSourceUrl, setCurrentSourceUrl] = useState(initialSource.baseUrl)
  const [currentSourceMode, setCurrentSourceMode] = useState(initialSource.sourceMode)
  const [modalState, setModalState] = useState<SettingsModalState>({
    showModal: false,
    baseUrlInput: '',
    validationError: null,
  })

  const openModal = (): void => {
    const storedValue = getStoredRegistryBaseUrlOverride()
    const nextSource = getRegistrySourceConfig()

    setModalState({
      showModal: true,
      baseUrlInput: storedValue ?? '',
      validationError: null,
    })

    setCurrentSourceUrl(nextSource.baseUrl)
    setCurrentSourceMode(nextSource.sourceMode)
  }

  const closeModal = (): void => {
    setModalState((previousValue) => ({ ...previousValue, showModal: false, validationError: null }))
  }

  const updateSourceMetadata = (): void => {
    const nextSource = getRegistrySourceConfig()
    setCurrentSourceUrl(nextSource.baseUrl)
    setCurrentSourceMode(nextSource.sourceMode)
  }

  const saveRegistrySettings = (): void => {
    const validationMessage = validateRegistryBaseUrlOverrideInput(modalState.baseUrlInput)

    if (validationMessage) {
      setModalState((previousValue) => ({ ...previousValue, validationError: validationMessage }))
      return
    }

    const normalizedInput = normalizeRegistryBaseUrlOverrideInput(modalState.baseUrlInput)

    if (normalizedInput.length === 0) {
      clearStoredRegistryBaseUrlOverride()
    } else {
      setStoredRegistryBaseUrlOverride(normalizedInput)
    }

    updateSourceMetadata()
    closeModal()
    onSaved?.()
  }

  const resetRegistrySettings = (): void => {
    clearStoredRegistryBaseUrlOverride()
    setModalState((previousValue) => ({ ...previousValue, baseUrlInput: '', validationError: null }))
    updateSourceMetadata()
    closeModal()
    onSaved?.()
  }

  const canShowCurrentSourceLink = isSafeExternalHttpUrl(currentSourceUrl)

  return (
    <>
      <Button
        variant="link"
        className="d-inline-flex align-items-center justify-content-center app-header-icon-button"
        onClick={openModal}
        aria-label="Open website settings"
        title="Website settings"
      >
        <FontAwesomeIcon icon={faGear} className="fa-fw" aria-hidden="true" />
      </Button>

      <Modal show={modalState.showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">
            Website settings
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Stack gap={4}>
            <section>
              <h3 className="h6 mb-2">Registry source</h3>
              <p className="small text-body-secondary mb-3">
                Configure the registry base URL used to load packages/index.json at runtime.
              </p>

              <Form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault()
                  saveRegistrySettings()
                }}
              >
                <Form.Group controlId="registry-base-url-override-input">
                  <Form.Label>Registry base URL override</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder={configuredSource.configuredBaseUrl}
                    value={modalState.baseUrlInput}
                    onChange={(event) => {
                      setModalState((previousValue) => ({
                        ...previousValue,
                        baseUrlInput: event.target.value,
                        validationError: null,
                      }))
                    }}
                    isInvalid={modalState.validationError !== null}
                  />
                  <Form.Control.Feedback type="invalid">{modalState.validationError}</Form.Control.Feedback>
                  <Form.Text>
                    Leave this field empty to use the configured default source: {configuredSource.configuredBaseUrl}
                  </Form.Text>
                </Form.Group>
              </Form>

              <div className="small text-body-secondary mt-3 d-flex align-items-center gap-2 flex-wrap">
                <span>Current source:</span>
                {canShowCurrentSourceLink ? (
                  <a href={currentSourceUrl} target="_blank" rel="noreferrer noopener">
                    {currentSourceUrl}
                  </a>
                ) : (
                  <span>{currentSourceUrl}</span>
                )}
                <Badge bg={currentSourceMode === 'runtime-override' ? 'info' : 'secondary'} text="dark">
                  {currentSourceMode === 'runtime-override' ? 'runtime override' : 'configured source'}
                </Badge>
              </div>
            </section>

            <section>
              <h3 className="h6 mb-2">Future settings</h3>
              <p className="small text-body-secondary mb-0">
                This modal is ready for additional website preferences, such as cache controls and package list display options.
              </p>
            </section>
          </Stack>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={resetRegistrySettings}>
            Reset to default
          </Button>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button variant="primary" onClick={saveRegistrySettings}>
            Save changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

function Header({ searchSlot, onRegistrySettingsSaved }: HeaderProps) {
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
              <RegistrySettingsControl onSaved={onRegistrySettingsSaved} />
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
