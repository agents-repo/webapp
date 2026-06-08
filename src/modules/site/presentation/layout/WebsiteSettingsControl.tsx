import { useState } from 'react'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Badge, Button, Form, Modal, Stack } from 'react-bootstrap'
import { isSafeExternalHttpUrl } from '../../application/urlSafety'
import type { RegistryCatalogStatusNote } from '../../application/websiteSettings/registryCatalogStatusNote'
import {
  clearStoredRegistryBaseUrlOverride,
  clearStoredRegistryGitHubRepositoryUrlOverride,
  getConfiguredRegistrySourceConfig,
  getRegistrySourceConfig,
  getStoredRegistryBaseUrlOverride,
  getStoredRegistryGitHubRepositoryUrlOverride,
  normalizeRegistryBaseUrlOverrideInput,
  normalizeRegistryGitHubRepositoryUrlOverrideInput,
  setStoredRegistryBaseUrlOverride,
  setStoredRegistryGitHubRepositoryUrlOverride,
  validateRegistryBaseUrlOverrideInput,
  validateRegistryGitHubRepositoryUrlOverrideInput,
} from '../../../registry/application/registrySource'

interface SettingsModalState {
  showModal: boolean
  baseUrlInput: string
  baseUrlValidationError: string | null
  githubRepositoryUrlInput: string
  githubRepositoryUrlValidationError: string | null
}

interface WebsiteSettingsControlProps {
  readonly onSaved?: () => void
  readonly registryCatalogStatusNote?: RegistryCatalogStatusNote | null
}

function WebsiteSettingsControl({ onSaved, registryCatalogStatusNote }: WebsiteSettingsControlProps) {
  const configuredSource = getConfiguredRegistrySourceConfig()
  const [currentSourceUrl, setCurrentSourceUrl] = useState(() => getRegistrySourceConfig().baseUrl)
  const [currentSourceMode, setCurrentSourceMode] = useState(() => getRegistrySourceConfig().sourceMode)
  const [currentGithubRepositoryUrl, setCurrentGithubRepositoryUrl] = useState(
    () => getRegistrySourceConfig().githubRepositoryUrl,
  )
  const [currentGithubRepositorySourceMode, setCurrentGithubRepositorySourceMode] = useState(
    () => getRegistrySourceConfig().githubRepositorySourceMode,
  )
  const [modalState, setModalState] = useState<SettingsModalState>({
    showModal: false,
    baseUrlInput: '',
    baseUrlValidationError: null,
    githubRepositoryUrlInput: '',
    githubRepositoryUrlValidationError: null,
  })

  const openModal = (): void => {
    const nextSource = getRegistrySourceConfig()

    setModalState({
      showModal: true,
      baseUrlInput: getStoredRegistryBaseUrlOverride() ?? '',
      baseUrlValidationError: null,
      githubRepositoryUrlInput: getStoredRegistryGitHubRepositoryUrlOverride() ?? '',
      githubRepositoryUrlValidationError: null,
    })

    setCurrentSourceUrl(nextSource.baseUrl)
    setCurrentSourceMode(nextSource.sourceMode)
    setCurrentGithubRepositoryUrl(nextSource.githubRepositoryUrl)
    setCurrentGithubRepositorySourceMode(nextSource.githubRepositorySourceMode)
  }

  const closeModal = (): void => {
    setModalState((previousValue) => ({
      ...previousValue,
      showModal: false,
      baseUrlValidationError: null,
      githubRepositoryUrlValidationError: null,
    }))
  }

  const updateSourceMetadata = (): void => {
    const nextSource = getRegistrySourceConfig()
    setCurrentSourceUrl(nextSource.baseUrl)
    setCurrentSourceMode(nextSource.sourceMode)
    setCurrentGithubRepositoryUrl(nextSource.githubRepositoryUrl)
    setCurrentGithubRepositorySourceMode(nextSource.githubRepositorySourceMode)
  }

  const saveRegistrySettings = (): void => {
    const baseUrlValidationMessage = validateRegistryBaseUrlOverrideInput(modalState.baseUrlInput)
    const githubRepositoryUrlValidationMessage = validateRegistryGitHubRepositoryUrlOverrideInput(
      modalState.githubRepositoryUrlInput,
    )

    if (baseUrlValidationMessage || githubRepositoryUrlValidationMessage) {
      setModalState((previousValue) => ({
        ...previousValue,
        baseUrlValidationError: baseUrlValidationMessage,
        githubRepositoryUrlValidationError: githubRepositoryUrlValidationMessage,
      }))
      return
    }

    const normalizedBaseUrlInput = normalizeRegistryBaseUrlOverrideInput(modalState.baseUrlInput)

    if (normalizedBaseUrlInput.length === 0) {
      clearStoredRegistryBaseUrlOverride()
    } else {
      setStoredRegistryBaseUrlOverride(normalizedBaseUrlInput)
    }

    const normalizedGithubRepositoryUrlInput = normalizeRegistryGitHubRepositoryUrlOverrideInput(
      modalState.githubRepositoryUrlInput,
    )

    if (normalizedGithubRepositoryUrlInput.length === 0) {
      clearStoredRegistryGitHubRepositoryUrlOverride()
    } else {
      setStoredRegistryGitHubRepositoryUrlOverride(normalizedGithubRepositoryUrlInput)
    }

    updateSourceMetadata()
    closeModal()
    onSaved?.()
  }

  const resetRegistrySettings = (): void => {
    clearStoredRegistryBaseUrlOverride()
    clearStoredRegistryGitHubRepositoryUrlOverride()
    setModalState((previousValue) => ({
      ...previousValue,
      baseUrlInput: '',
      baseUrlValidationError: null,
      githubRepositoryUrlInput: '',
      githubRepositoryUrlValidationError: null,
    }))
    updateSourceMetadata()
    closeModal()
    onSaved?.()
  }

  const canShowCurrentSourceLink = isSafeExternalHttpUrl(currentSourceUrl)
  const canShowCurrentGithubRepositoryLink = isSafeExternalHttpUrl(currentGithubRepositoryUrl)

  return (
    <>
      <Button
        variant="link"
        className="d-inline-flex align-items-center justify-content-center app-header-icon-control"
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
                Configure the registry base URL used to load the registry index ({configuredSource.indexPath}) at
                runtime. GitHub repository URLs are converted to a raw content URL. Raw and other base URLs are used
                directly.
              </p>

              <Form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault()
                  saveRegistrySettings()
                }}
              >
                <Form.Group controlId="registry-base-url-override-input" className="mb-3">
                  <Form.Label>Registry base URL override</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder={configuredSource.configuredBaseUrl}
                    value={modalState.baseUrlInput}
                    onChange={(event) => {
                      setModalState((previousValue) => ({
                        ...previousValue,
                        baseUrlInput: event.target.value,
                        baseUrlValidationError: null,
                      }))
                    }}
                    isInvalid={modalState.baseUrlValidationError !== null}
                  />
                  <Form.Control.Feedback type="invalid">{modalState.baseUrlValidationError}</Form.Control.Feedback>
                  <Form.Text>
                    Enter a GitHub repository URL like https://github.com/agents-repo/registry, a GitHub tree URL,
                    or any direct base URL. Leave this field empty to use the configured default source:{' '}
                    {configuredSource.configuredBaseUrl}
                  </Form.Text>
                </Form.Group>

                <div className="small text-body-secondary mb-3 d-flex align-items-center gap-2 flex-wrap">
                  <span>Current source:</span>
                  {canShowCurrentSourceLink ? (
                    <a href={currentSourceUrl} target="_blank" rel="noreferrer noopener" className="text-reset text-break">
                      {currentSourceUrl}
                    </a>
                  ) : (
                    <span className="text-break">{currentSourceUrl}</span>
                  )}
                  <Badge
                    bg={currentSourceMode === 'runtime-override' ? 'info' : 'secondary'}
                    text={currentSourceMode === 'runtime-override' ? 'dark' : undefined}
                  >
                    {currentSourceMode === 'runtime-override' ? 'runtime override' : 'configured source'}
                  </Badge>
                </div>

                {registryCatalogStatusNote ? (
                  <p className="small text-body-secondary opacity-75 mb-0">
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
              </Form>
            </section>

            <section>
              <h3 className="h6 mb-2">Package browse links</h3>
              <p className="small text-body-secondary mb-3">
                Configure the GitHub repository URL used for &quot;view package on GitHub&quot; links in package cards.
                This does not affect catalog fetching.
              </p>

              <Form.Group controlId="registry-github-repository-url-override-input">
                <Form.Label>GitHub repository URL</Form.Label>
                <Form.Control
                  type="url"
                  placeholder={configuredSource.configuredGithubRepositoryUrl}
                  value={modalState.githubRepositoryUrlInput}
                  onChange={(event) => {
                    setModalState((previousValue) => ({
                      ...previousValue,
                      githubRepositoryUrlInput: event.target.value,
                      githubRepositoryUrlValidationError: null,
                    }))
                  }}
                  isInvalid={modalState.githubRepositoryUrlValidationError !== null}
                />
                <Form.Control.Feedback type="invalid">
                  {modalState.githubRepositoryUrlValidationError}
                </Form.Control.Feedback>
                <Form.Text>
                  Enter a GitHub repository URL like https://github.com/agents-repo/registry or a GitHub tree URL.
                  Leave this field empty to use the configured default:{' '}
                  {configuredSource.configuredGithubRepositoryUrl}
                </Form.Text>
              </Form.Group>

              <div className="small text-body-secondary mt-3 d-flex align-items-center gap-2 flex-wrap">
                <span>Current GitHub repository:</span>
                {canShowCurrentGithubRepositoryLink ? (
                  <a
                    href={currentGithubRepositoryUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-reset text-break"
                  >
                    {currentGithubRepositoryUrl}
                  </a>
                ) : (
                  <span className="text-break">{currentGithubRepositoryUrl}</span>
                )}
                <Badge
                  bg={currentGithubRepositorySourceMode === 'runtime-override' ? 'info' : 'secondary'}
                  text={currentGithubRepositorySourceMode === 'runtime-override' ? 'dark' : undefined}
                >
                  {currentGithubRepositorySourceMode === 'runtime-override'
                    ? 'runtime override'
                    : 'configured source'}
                </Badge>
              </div>
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
