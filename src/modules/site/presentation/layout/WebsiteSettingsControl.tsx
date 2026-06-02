import { useState } from 'react'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Badge, Button, Form, Modal, Stack } from 'react-bootstrap'
import { isSafeExternalHttpUrl } from '../../application/urlSafety'
import type { RegistryCatalogStatusNote } from '../../application/websiteSettings/registryCatalogStatusNote'
import {
  clearStoredRegistryBaseUrlOverride,
  getConfiguredRegistrySourceConfig,
  getRegistrySourceConfig,
  getStoredRegistryBaseUrlOverride,
  normalizeRegistryBaseUrlOverrideInput,
  setStoredRegistryBaseUrlOverride,
  validateRegistryBaseUrlOverrideInput,
} from '../../../registry/application/registrySource'

interface SettingsModalState {
  showModal: boolean
  baseUrlInput: string
  validationError: string | null
}

interface WebsiteSettingsControlProps {
  readonly onSaved?: () => void
  readonly registryCatalogStatusNote?: RegistryCatalogStatusNote | null
}

function WebsiteSettingsControl({ onSaved, registryCatalogStatusNote }: WebsiteSettingsControlProps) {
  const configuredSource = getConfiguredRegistrySourceConfig()
  const [currentSourceUrl, setCurrentSourceUrl] = useState(() => getRegistrySourceConfig().baseUrl)
  const [currentSourceMode, setCurrentSourceMode] = useState(() => getRegistrySourceConfig().sourceMode)
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
                <Badge
                  bg={currentSourceMode === 'runtime-override' ? 'info' : 'secondary'}
                  text={currentSourceMode === 'runtime-override' ? 'dark' : undefined}
                >
                  {currentSourceMode === 'runtime-override' ? 'runtime override' : 'configured source'}
                </Badge>
              </div>

              {registryCatalogStatusNote ? (
                <p className="small text-body-secondary opacity-75 mt-3 mb-0">
                  {registryCatalogStatusNote.summaryText}
                  {isSafeExternalHttpUrl(registryCatalogStatusNote.sourceUrl) ? (
                    <a
                      href={registryCatalogStatusNote.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-reset text-break"
                    >
                      {registryCatalogStatusNote.sourceUrl}
                    </a>
                  ) : (
                    <span>{registryCatalogStatusNote.sourceUrl || 'configured source'}</span>
                  )}
                  <span className="opacity-75"> ({registryCatalogStatusNote.statusTag})</span>
                </p>
              ) : null}
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

export default WebsiteSettingsControl
