import { useRef, useState, type ReactNode } from 'react'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Badge, Button, Form, Modal, Stack } from 'react-bootstrap'
import { isSafeExternalHttpUrl } from '../../application/urlSafety'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink'
import type { RegistryCatalogStatusNote } from '../../application/websiteSettings/registryCatalogStatusNote'
import {
  clearRegistryTagListCache,
  clearStoredRegistryBaseUrlOverride,
  clearStoredRegistryGitHubRepositoryUrlOverride,
  getConfiguredRegistrySourceConfig,
  getRegistrySourceConfig,
  getStoredRegistryBaseUrlOverride,
  getStoredRegistryGitHubRepositoryUrlOverride,
  normalizeRegistryBaseUrlOverrideInput,
  normalizeRegistryGitHubRepositoryUrlOverrideInput,
  resolveRegistrySourceConfig,
  setStoredRegistryBaseUrlOverride,
  setStoredRegistryGitHubRepositoryUrlOverride,
  validateRegistryBaseUrlOverrideInput,
  validateRegistryGitHubRepositoryUrlOverrideInput,
  validateRegistrySourceUrlForMajorVersionAlias,
} from '../../../registry/application/registrySource'
import type { RegistryRefResolution, RegistrySourceConfig } from '../../../registry/application/registrySource'

interface SettingsModalState {
  showModal: boolean
  baseUrlInput: string
  baseUrlValidationError: string | null
  githubRepositoryUrlInput: string
  githubRepositoryUrlValidationError: string | null
  isSaving: boolean
}

interface WebsiteSettingsControlProps {
  readonly onSaved?: () => void
  readonly registryCatalogStatusNote?: RegistryCatalogStatusNote | null
}

const formatRefResolutionLabel = (resolution: RegistryRefResolution | null | undefined): string | null => {
  if (!resolution) {
    return null
  }

  return `${resolution.alias} → ${resolution.resolvedRef}`
}

const renderSourceLink = (url: string): ReactNode => {
  if (isSafeExternalHttpUrl(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="text-reset text-break"
        aria-label={externalLinkAccessibleName(url)}
      >
        {url}
      </a>
    )
  }

  return <span className="text-break">{url}</span>
}

const renderCatalogStatusNote = (note: RegistryCatalogStatusNote): ReactNode => (
  <p className="small text-body-secondary opacity-75 mb-0">
    {note.summaryText}
    {isSafeExternalHttpUrl(note.sourceUrl) ? (
      <a
        href={note.sourceUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="text-reset text-break"
        aria-label={externalLinkAccessibleName(note.sourceUrl)}
      >
        {note.sourceUrl}
      </a>
    ) : (
      <span>{note.sourceUrl || 'configured source'}</span>
    )}
    {note.baseUrlRefResolution ? (
      <span className="ms-1">
        ({note.baseUrlRefResolution.alias} → {note.baseUrlRefResolution.resolvedRef})
      </span>
    ) : null}
    <span className="opacity-75"> ({note.statusTag})</span>
  </p>
)

function SourceModeBadge({ mode }: { readonly mode: 'configured' | 'runtime-override' }) {
  const isRuntimeOverride = mode === 'runtime-override'

  return (
    <Badge bg={isRuntimeOverride ? 'info' : 'secondary'} text={isRuntimeOverride ? 'dark' : undefined}>
      {isRuntimeOverride ? 'runtime override' : 'configured source'}
    </Badge>
  )
}

function RefResolutionBadge({ label }: { readonly label: string | null }) {
  if (!label) {
    return null
  }

  return (
    <Badge bg="light" text="dark">
      {label}
    </Badge>
  )
}

function WebsiteSettingsControl({ onSaved, registryCatalogStatusNote }: WebsiteSettingsControlProps) {
  const configuredSource = getConfiguredRegistrySourceConfig()
  const [resolvedSource, setResolvedSource] = useState<RegistrySourceConfig | null>(null)
  const [isRefreshingSource, setIsRefreshingSource] = useState(false)
  const refreshRequestIdRef = useRef(0)
  const [modalState, setModalState] = useState<SettingsModalState>({
    showModal: false,
    baseUrlInput: '',
    baseUrlValidationError: null,
    githubRepositoryUrlInput: '',
    githubRepositoryUrlValidationError: null,
    isSaving: false,
  })

  const refreshResolvedSource = async (): Promise<void> => {
    const requestId = ++refreshRequestIdRef.current
    setIsRefreshingSource(true)

    try {
      const nextSource = await resolveRegistrySourceConfig()

      if (requestId !== refreshRequestIdRef.current) {
        return
      }

      setResolvedSource(nextSource)
    } catch {
      if (requestId !== refreshRequestIdRef.current) {
        return
      }

      setResolvedSource(null)
    } finally {
      if (requestId === refreshRequestIdRef.current) {
        setIsRefreshingSource(false)
      }
    }
  }

  const openModal = (): void => {
    setResolvedSource(null)
    setIsRefreshingSource(true)

    setModalState({
      showModal: true,
      baseUrlInput: getStoredRegistryBaseUrlOverride() ?? '',
      baseUrlValidationError: null,
      githubRepositoryUrlInput: getStoredRegistryGitHubRepositoryUrlOverride() ?? '',
      githubRepositoryUrlValidationError: null,
      isSaving: false,
    })

    void refreshResolvedSource()
  }

  const closeModal = (): void => {
    setModalState((previousValue) => ({
      ...previousValue,
      showModal: false,
      baseUrlValidationError: null,
      githubRepositoryUrlValidationError: null,
      isSaving: false,
    }))
  }

  const saveRegistrySettings = async (): Promise<void> => {
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

    setModalState((previousValue) => ({
      ...previousValue,
      isSaving: true,
      baseUrlValidationError: null,
      githubRepositoryUrlValidationError: null,
    }))

    try {
      const normalizedBaseUrlInput = normalizeRegistryBaseUrlOverrideInput(modalState.baseUrlInput)
      const normalizedGithubRepositoryUrlInput = normalizeRegistryGitHubRepositoryUrlOverrideInput(
        modalState.githubRepositoryUrlInput,
      )

      const baseUrlAliasValidationMessage =
        normalizedBaseUrlInput.length > 0
          ? await validateRegistrySourceUrlForMajorVersionAlias(
              normalizedBaseUrlInput,
              configuredSource.configuredGithubRepositoryUrl,
              { bypassTagCache: true },
            )
          : null

      const githubRepositoryAliasValidationMessage =
        normalizedGithubRepositoryUrlInput.length > 0
          ? await validateRegistrySourceUrlForMajorVersionAlias(
              normalizedGithubRepositoryUrlInput,
              configuredSource.configuredGithubRepositoryUrl,
              { bypassTagCache: true },
            )
          : null

      if (baseUrlAliasValidationMessage || githubRepositoryAliasValidationMessage) {
        setModalState((previousValue) => ({
          ...previousValue,
          baseUrlValidationError: baseUrlAliasValidationMessage,
          githubRepositoryUrlValidationError: githubRepositoryAliasValidationMessage,
        }))
      } else {
        clearRegistryTagListCache()

        if (normalizedBaseUrlInput.length === 0) {
          clearStoredRegistryBaseUrlOverride()
        } else {
          setStoredRegistryBaseUrlOverride(normalizedBaseUrlInput)
        }

        if (normalizedGithubRepositoryUrlInput.length === 0) {
          clearStoredRegistryGitHubRepositoryUrlOverride()
        } else {
          setStoredRegistryGitHubRepositoryUrlOverride(normalizedGithubRepositoryUrlInput)
        }

        await refreshResolvedSource()
        closeModal()
        onSaved?.()
      }
    } finally {
      setModalState((previousValue) => ({
        ...previousValue,
        isSaving: false,
      }))
    }
  }

  const resetRegistrySettings = async (): Promise<void> => {
    clearStoredRegistryBaseUrlOverride()
    clearStoredRegistryGitHubRepositoryUrlOverride()
    clearRegistryTagListCache()
    setModalState((previousValue) => ({
      ...previousValue,
      baseUrlInput: '',
      baseUrlValidationError: null,
      githubRepositoryUrlInput: '',
      githubRepositoryUrlValidationError: null,
      isSaving: true,
    }))

    try {
      await refreshResolvedSource()
      closeModal()
      onSaved?.()
    } finally {
      setModalState((previousValue) => ({
        ...previousValue,
        isSaving: false,
      }))
    }
  }

  const activeSource = resolvedSource ?? getRegistrySourceConfig()
  const shouldShowRefResolution = resolvedSource !== null && !isRefreshingSource
  const currentBaseUrlRefResolution = shouldShowRefResolution
    ? formatRefResolutionLabel(activeSource.baseUrlRefResolution)
    : null
  const currentGithubRepositoryRefResolution = shouldShowRefResolution
    ? formatRefResolutionLabel(activeSource.githubRepositoryRefResolution)
    : null

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
          <Form
            id="website-settings-form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void saveRegistrySettings()
            }}
          >
            <Stack gap={4}>
              <section>
                <h3 className="h6 mb-2">Registry source</h3>
                <p className="small text-body-secondary mb-3">
                  Configure the registry base URL used to load the registry index ({configuredSource.indexPath}) at
                  runtime. GitHub repository URLs are converted to a raw content URL. Raw and other base URLs are used
                  directly. Major-version line refs such as <code>1.x</code> resolve to the latest stable release tag.
                </p>

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
                    disabled={modalState.isSaving}
                  />
                  <Form.Control.Feedback type="invalid">{modalState.baseUrlValidationError}</Form.Control.Feedback>
                  <Form.Text>
                    Enter a GitHub repository URL like https://github.com/agents-repo/registry, a GitHub tree URL,
                    a proxy URL with <code>?ref=1.x</code>, or any direct base URL. Leave this field empty to use the
                    configured default source: {configuredSource.configuredBaseUrl}
                  </Form.Text>
                </Form.Group>

                <div className="small text-body-secondary mb-3 d-flex align-items-center gap-2 flex-wrap">
                  <span>Current source:</span>
                  {renderSourceLink(activeSource.baseUrl)}
                  <SourceModeBadge mode={activeSource.sourceMode} />
                  {isRefreshingSource ? <span className="opacity-75">Resolving refs…</span> : null}
                  <RefResolutionBadge label={currentBaseUrlRefResolution} />
                </div>

                {registryCatalogStatusNote ? renderCatalogStatusNote(registryCatalogStatusNote) : null}
              </section>

              <section>
                <h3 className="h6 mb-2">Package browse links</h3>
                <p className="small text-body-secondary mb-3">
                  Configure the GitHub repository URL used for &quot;view package on GitHub&quot; links in package cards.
                  This does not affect catalog fetching. GitHub tree URLs may use major-version line refs such as{' '}
                  <code>1.x</code>.
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
                    disabled={modalState.isSaving}
                  />
                  <Form.Control.Feedback type="invalid">
                    {modalState.githubRepositoryUrlValidationError}
                  </Form.Control.Feedback>
                  <Form.Text>
                    Enter a GitHub repository URL like https://github.com/agents-repo/registry or a GitHub tree URL such
                    as https://github.com/agents-repo/registry/tree/1.x. Leave this field empty to use the configured
                    default: {configuredSource.configuredGithubRepositoryUrl}
                  </Form.Text>
                </Form.Group>

                <div className="small text-body-secondary mt-3 d-flex align-items-center gap-2 flex-wrap">
                  <span>Current GitHub repository:</span>
                  {renderSourceLink(activeSource.githubRepositoryUrl)}
                  <SourceModeBadge mode={activeSource.githubRepositorySourceMode} />
                  {isRefreshingSource ? <span className="opacity-75">Resolving refs…</span> : null}
                  <RefResolutionBadge label={currentGithubRepositoryRefResolution} />
                </div>
              </section>
            </Stack>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => void resetRegistrySettings()} disabled={modalState.isSaving}>
            Reset to default
          </Button>
          <Button variant="secondary" onClick={closeModal} disabled={modalState.isSaving}>
            Close
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="website-settings-form"
            disabled={modalState.isSaving}
          >
            {modalState.isSaving ? 'Saving…' : 'Save changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default WebsiteSettingsControl
