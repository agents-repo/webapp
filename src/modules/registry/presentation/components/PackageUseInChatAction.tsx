import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments, faCopy } from '@fortawesome/free-solid-svg-icons'
import {
  Alert,
  Button,
  Form,
  InputGroup,
  Modal,
  Spinner,
  Stack,
  Tab,
  Tabs,
} from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useExternalLinkAccessibleName } from '../../../site/application/accessibility/useExternalLinkAccessibleName'
import { copyTextToClipboard } from '../../../site/application/clipboard/copyTextToClipboard'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import {
  buildChatInstructionCopyUrls,
  buildChatInstructionLatestUrlFromPath,
  buildChatInstructionMarkdownForPaste,
  buildChatPlatformOpenUrl,
  buildChatRelatedAgentMarkdownSources,
  buildChatStarterPrompt,
  CHAT_PLATFORM_GUIDES,
  findChatInstruction,
  groupChatInstructionsByKind,
  instructionOptionKey,
  resolveInitialChatInstructionKey,
  type ChatInstructionCopyUrls,
  type ChatInstructionEntry,
  type ChatInstructionKind,
  type ChatInstructionOptionGroup,
  type ChatInstructionsManifest,
} from '../../application/chatConsumption'
import {
  fetchChatInstructionMarkdown,
  fetchChatInstructionsManifest,
} from '../../infrastructure/chatInstructionsRepository'
import { buildRegistryPkgInstructionsUrl } from '../../infrastructure/registrySourceUrl'

const COPY_FEEDBACK_DURATION_MS = 3000

const instructionGroupLabelKey = (kind: ChatInstructionKind): string => {
  return kind === 'agent' ? 'packageDetail.agentsHeading' : 'packageDetail.flowsHeading'
}

const readTranslatedPlatformSteps = (
  t: (key: string, options?: { returnObjects?: boolean }) => string | readonly string[],
  platformId: string,
): readonly string[] => {
  const steps = t(`packageCard.useInChatForm.platforms.${platformId}.steps`, { returnObjects: true })
  if (!Array.isArray(steps)) {
    return []
  }

  return steps.filter((step): step is string => typeof step === 'string')
}

export interface PackageUseInChatActionProps {
  readonly packageName: string
  readonly namespace: string
  readonly packageId: string
  readonly latest: string
  readonly registryBaseUrl: string
  readonly controlId: string
  readonly quickstart?: string
}

type CopyField = 'latest' | 'pinned' | 'markdown' | 'prompt'

interface SelectedChatCopyState {
  readonly selectedInstruction: ChatInstructionEntry
  readonly copyUrls: ChatInstructionCopyUrls
  readonly starterPrompt: string
  readonly instructionGroups: readonly ChatInstructionOptionGroup[]
}

const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException && error.name === 'AbortError'
}

const messageFromError = (error: unknown, fallback: string): string => {
  return error instanceof Error ? error.message : fallback
}

const resolveSelectedChatCopyState = (
  manifest: ChatInstructionsManifest,
  selectedKey: string,
  registryBaseUrl: string,
  namespace: string,
  packageId: string,
  latest: string,
): SelectedChatCopyState | null => {
  const selectedInstruction = findChatInstruction(manifest.instructions, selectedKey)
  if (!selectedInstruction) {
    return null
  }

  const copyUrls = buildChatInstructionCopyUrls(
    registryBaseUrl,
    namespace,
    packageId,
    latest,
    selectedInstruction,
  )
  const agentInstructionLatestUrls = (selectedInstruction.agentInstructions ?? [])
    .map((path) => buildChatInstructionLatestUrlFromPath(registryBaseUrl, path))
    .filter((url): url is string => url !== null)

  return {
    selectedInstruction,
    copyUrls,
    starterPrompt: buildChatStarterPrompt(
      selectedInstruction,
      copyUrls.latestUrl,
      agentInstructionLatestUrls,
    ),
    instructionGroups: groupChatInstructionsByKind(manifest.instructions),
  }
}

function CopyableTextRow({
  controlId,
  label,
  value,
  copyLabel,
  onCopy,
  copyFeedback,
  rows = 2,
}: {
  readonly controlId: string
  readonly label: string
  readonly value: string
  readonly copyLabel: string
  readonly onCopy: () => void
  readonly copyFeedback: string
  readonly rows?: number
}) {
  return (
    <Form.Group controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <InputGroup>
        <Form.Control as="textarea" rows={rows} readOnly value={value} spellCheck={false} />
        <Button type="button" variant="outline-secondary" aria-label={copyLabel} onClick={onCopy}>
          <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
        </Button>
      </InputGroup>
      {copyFeedback ? (
        <output className="form-text d-block">{copyFeedback}</output>
      ) : null}
    </Form.Group>
  )
}

function UseInChatLoadedForm({
  pickerId,
  latest,
  selectedState,
  selectedKey,
  onSelectKey,
  onCopyValue,
  onCopyMarkdown,
  isCopyingMarkdown,
  copyFeedback,
  safeQuickstart,
}: {
  readonly pickerId: string
  readonly latest: string
  readonly selectedState: SelectedChatCopyState
  readonly selectedKey: string
  readonly onSelectKey: (key: string) => void
  readonly onCopyValue: (field: CopyField, text: string) => void
  readonly onCopyMarkdown: () => void
  readonly isCopyingMarkdown: boolean
  readonly copyFeedback: Partial<Record<CopyField, string>>
  readonly safeQuickstart: string | null
}) {
  const { t } = useTranslation('catalog')
  const externalLinkName = useExternalLinkAccessibleName()
  const { selectedInstruction, copyUrls, starterPrompt, instructionGroups } = selectedState

  return (
    <Form>
      <Stack gap={3}>
        <Form.Group controlId={pickerId}>
          <Form.Label>{t('packageCard.useInChatForm.instructionLabel')}</Form.Label>
          <Form.Select value={selectedKey} onChange={(event) => onSelectKey(event.target.value)}>
            {instructionGroups.map((group) => (
              <optgroup key={group.kind} label={t(instructionGroupLabelKey(group.kind))}>
                {group.instructions.map((entry) => (
                  <option key={instructionOptionKey(entry)} value={instructionOptionKey(entry)}>
                    {entry.id}
                  </option>
                ))}
              </optgroup>
            ))}
          </Form.Select>
        </Form.Group>

        <CopyableTextRow
          controlId={`${pickerId}-latest`}
          label={t('packageCard.useInChatForm.latestUrlLabel')}
          value={copyUrls.latestUrl}
          copyLabel={t('packageCard.useInChatForm.copyLatestUrlAriaLabel', { id: selectedInstruction.id })}
          onCopy={() => onCopyValue('latest', copyUrls.latestUrl)}
          copyFeedback={copyFeedback.latest ?? ''}
        />

        <CopyableTextRow
          controlId={`${pickerId}-pinned`}
          label={t('packageCard.useInChatForm.pinnedUrlLabel', { version: latest })}
          value={copyUrls.pinnedUrl}
          copyLabel={t('packageCard.useInChatForm.copyPinnedUrlAriaLabel', { id: selectedInstruction.id })}
          onCopy={() => onCopyValue('pinned', copyUrls.pinnedUrl)}
          copyFeedback={copyFeedback.pinned ?? ''}
        />

        <div>
          <div className="form-label">{t('packageCard.useInChatForm.markdownLabel')}</div>
          <Button
            type="button"
            variant="outline-secondary"
            disabled={isCopyingMarkdown}
            aria-busy={isCopyingMarkdown}
            onClick={onCopyMarkdown}
          >
            {isCopyingMarkdown
              ? t('packageCard.useInChatForm.copyingMarkdown')
              : t('packageCard.useInChatForm.copyMarkdownButton')}
          </Button>
          {selectedInstruction.kind === 'flow' && (selectedInstruction.agentInstructions?.length ?? 0) > 0 ? (
            <div className="form-text">{t('packageCard.useInChatForm.flowIncludesAgentsNote')}</div>
          ) : null}
          {copyFeedback.markdown ? (
            <output className="form-text d-block">{copyFeedback.markdown}</output>
          ) : null}
        </div>

        <CopyableTextRow
          controlId={`${pickerId}-prompt`}
          label={t('packageCard.useInChatForm.starterPromptLabel')}
          value={starterPrompt}
          copyLabel={t('packageCard.useInChatForm.copyStarterPromptAriaLabel', { id: selectedInstruction.id })}
          onCopy={() => onCopyValue('prompt', starterPrompt)}
          copyFeedback={copyFeedback.prompt ?? ''}
          rows={selectedInstruction.kind === 'flow' ? 6 : 3}
        />

        <Alert variant="warning" role="note" className="mb-0">
          <Alert.Heading as="h3" className="h6">
            {t('packageCard.useInChatForm.urlFallbackHeading')}
          </Alert.Heading>
          <p className="mb-0">{t('packageCard.useInChatForm.urlFallbackBody')}</p>
        </Alert>

        <div>
          <h3 className="h6">{t('packageCard.useInChatForm.howToHeading')}</h3>
          <Tabs defaultActiveKey="chatgpt" id={`${pickerId}-platforms`} className="mb-3">
            {CHAT_PLATFORM_GUIDES.map((guide) => {
              const platformLabel = t(`packageCard.useInChatForm.platforms.${guide.id}.label`)
              const platformSteps = readTranslatedPlatformSteps(t, guide.id)
              const openUrl = buildChatPlatformOpenUrl(guide.id, starterPrompt)
              const safeOpenUrl = openUrl && isSafeExternalHttpUrl(openUrl) ? openUrl : null

              return (
                <Tab eventKey={guide.id} title={platformLabel} key={guide.id}>
                  <ol className={safeOpenUrl ? 'small mb-3 ps-3' : 'small mb-0 ps-3'}>
                    {platformSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  {safeOpenUrl ? (
                    <a
                      href={safeOpenUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn btn-outline-primary"
                      aria-label={externalLinkName(
                        t('packageCard.useInChatForm.openInPlatform', { platform: platformLabel }),
                      )}
                    >
                      {t('packageCard.useInChatForm.openInPlatform', { platform: platformLabel })}
                    </a>
                  ) : null}
                </Tab>
              )
            })}
          </Tabs>
        </div>

        {safeQuickstart ? (
          <p className="small mb-0">
            <a href={safeQuickstart} target="_blank" rel="noreferrer noopener">
              {externalLinkName(t('packageCard.useInChatForm.packageQuickstart'))}
            </a>
          </p>
        ) : null}
      </Stack>
    </Form>
  )
}

function PackageUseInChatAction({
  packageName,
  namespace,
  packageId,
  latest,
  registryBaseUrl,
  controlId,
  quickstart,
}: PackageUseInChatActionProps) {
  const { t } = useTranslation('catalog')
  const reactId = useId()
  const modalInteractionRef = useRef(0)
  const copyFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isCopyingMarkdown, setIsCopyingMarkdown] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorUrl, setErrorUrl] = useState<string | null>(null)
  const [manifest, setManifest] = useState<ChatInstructionsManifest | null>(null)
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState('')
  const [liveMessage, setLiveMessage] = useState('')
  const [copyFeedback, setCopyFeedback] = useState<Partial<Record<CopyField, string>>>({})

  const toggleId = `use-in-chat-toggle-${controlId}`
  const modalId = `use-in-chat-modal-${controlId}`
  const pickerId = `use-in-chat-picker-${controlId}-${reactId.replaceAll(':', '')}`
  const safeQuickstart = quickstart && isSafeExternalHttpUrl(quickstart) ? quickstart : null
  const instructionsUrl = buildRegistryPkgInstructionsUrl(
    registryBaseUrl,
    namespace,
    packageId,
    latest,
  )
  const selectedState =
    manifest === null || loadedUrl !== instructionsUrl
      ? null
      : resolveSelectedChatCopyState(manifest, selectedKey, registryBaseUrl, namespace, packageId, latest)
  const visibleError = errorUrl === instructionsUrl ? errorMessage : null
  const showInstructionsLoading = showModal && selectedState === null && visibleError === null

  const clearCopyFeedback = useCallback(() => {
    setCopyFeedback({})
    if (copyFeedbackTimeoutRef.current) {
      clearTimeout(copyFeedbackTimeoutRef.current)
      copyFeedbackTimeoutRef.current = null
    }
  }, [])

  const closeModal = useCallback(() => {
    modalInteractionRef.current += 1
    setShowModal(false)
    setIsCopyingMarkdown(false)
    setErrorMessage(null)
    setErrorUrl(null)
    setManifest(null)
    setLoadedUrl(null)
    setSelectedKey('')
    setLiveMessage('')
    clearCopyFeedback()
  }, [clearCopyFeedback])

  useEffect(() => {
    return () => {
      modalInteractionRef.current += 1
      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current)
      }
    }
  }, [])

  const showFieldCopyFeedback = useCallback((field: CopyField) => {
    setCopyFeedback({ [field]: t('packageCard.copySuccess') })
    if (copyFeedbackTimeoutRef.current) {
      clearTimeout(copyFeedbackTimeoutRef.current)
    }
    copyFeedbackTimeoutRef.current = setTimeout(() => {
      setCopyFeedback({})
      copyFeedbackTimeoutRef.current = null
    }, COPY_FEEDBACK_DURATION_MS)
  }, [t])

  const applyManifest = useCallback((loaded: ChatInstructionsManifest, sourceUrl: string): void => {
    setManifest(loaded)
    setLoadedUrl(sourceUrl)
    setSelectedKey(resolveInitialChatInstructionKey(loaded))
    setErrorMessage(null)
    setErrorUrl(null)
  }, [])

  const openModal = () => {
    setShowModal(true)
    setLiveMessage('')
    clearCopyFeedback()
    setManifest(null)
    setLoadedUrl(null)
    setSelectedKey('')
    setErrorMessage(null)
    setErrorUrl(null)
  }

  useEffect(() => {
    if (!showModal) {
      return
    }

    let cancelled = false
    const controller = new AbortController()

    const loadInstructions = async (): Promise<void> => {
      try {
        const loaded = await fetchChatInstructionsManifest(instructionsUrl, controller.signal)
        if (cancelled) {
          return
        }
        applyManifest(loaded, instructionsUrl)
      } catch (error) {
        if (cancelled || isAbortError(error)) {
          return
        }
        setManifest(null)
        setLoadedUrl(null)
        setErrorMessage(messageFromError(error, t('packageCard.useInChatForm.loadError')))
        setErrorUrl(instructionsUrl)
      }
    }

    void loadInstructions()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [applyManifest, instructionsUrl, showModal, t])

  const copyValue = useCallback(
    async (field: CopyField, text: string) => {
      const interactionAtStart = modalInteractionRef.current
      const result = await copyTextToClipboard(text)
      if (interactionAtStart !== modalInteractionRef.current) {
        return
      }
      if (result === 'success') {
        setErrorMessage(null)
        setErrorUrl(null)
        setLiveMessage(t('packageCard.copySuccess'))
        showFieldCopyFeedback(field)
        return
      }
      setLiveMessage(t('packageCard.copyTextFailure'))
    },
    [showFieldCopyFeedback, t],
  )

  const handleCopyMarkdown = async (): Promise<void> => {
    if (!selectedState) {
      return
    }
    const interactionAtStart = modalInteractionRef.current
    setErrorMessage(null)
    setErrorUrl(null)
    setIsCopyingMarkdown(true)
    try {
      const relatedPaths = selectedState.selectedInstruction.agentInstructions ?? []
      const relatedSources =
        selectedState.selectedInstruction.kind === 'flow' && relatedPaths.length > 0
          ? buildChatRelatedAgentMarkdownSources(registryBaseUrl, relatedPaths)
          : []

      if (relatedSources === null) {
        throw new Error(t('packageCard.useInChatForm.markdownLoadError'))
      }

      const [markdown, ...relatedMarkdowns] = await Promise.all([
        fetchChatInstructionMarkdown(selectedState.copyUrls.fetchUrl),
        ...relatedSources.map((source) => fetchChatInstructionMarkdown(source.fetchUrl)),
      ])
      if (interactionAtStart !== modalInteractionRef.current) {
        return
      }

      if (relatedMarkdowns.length !== relatedSources.length) {
        throw new Error(t('packageCard.useInChatForm.markdownLoadError'))
      }

      const relatedAgentMarkdowns = relatedSources.map((source, index) => ({
        id: source.id,
        markdown: relatedMarkdowns[index] ?? '',
      }))

      await copyValue(
        'markdown',
        buildChatInstructionMarkdownForPaste(
          selectedState.selectedInstruction.kind,
          markdown,
          relatedAgentMarkdowns,
        ),
      )
    } catch (error) {
      if (isAbortError(error) || interactionAtStart !== modalInteractionRef.current) {
        return
      }
      const message = messageFromError(error, t('packageCard.useInChatForm.markdownLoadError'))
      setLiveMessage(message)
      setErrorMessage(message)
      setErrorUrl(instructionsUrl)
    } finally {
      if (interactionAtStart === modalInteractionRef.current) {
        setIsCopyingMarkdown(false)
      }
    }
  }

  return (
    <>
      <Button
        id={toggleId}
        type="button"
        variant="outline-primary"
        className="d-inline-flex align-items-center justify-content-center package-card-action"
        aria-label={t('packageCard.useInChatAriaLabel', { name: packageName })}
        aria-haspopup="dialog"
        aria-expanded={showModal}
        aria-controls={modalId}
        onClick={openModal}
      >
        <FontAwesomeIcon icon={faComments} aria-hidden="true" />
        <span className="package-card-action-label">{t('packageCard.useInChat')}</span>
      </Button>

      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        size="lg"
        aria-labelledby={`${modalId}-title`}
      >
        <Modal.Header closeButton>
          <Modal.Title as="h2" id={`${modalId}-title`} className="h5 mb-0">
            {t('packageCard.useInChatModalTitle', { name: packageName })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id={modalId} aria-busy={showInstructionsLoading}>
          {showInstructionsLoading ? (
            <output className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" aria-hidden="true" />
              <span>{t('packageCard.useInChatLoading')}</span>
            </output>
          ) : null}

          {visibleError ? (
            <Alert variant="danger" className={selectedState ? 'mb-3' : 'mb-0'}>
              {visibleError}
            </Alert>
          ) : null}

          {selectedState ? (
            <UseInChatLoadedForm
              pickerId={pickerId}
              latest={latest}
              selectedState={selectedState}
              selectedKey={selectedKey}
              onSelectKey={setSelectedKey}
              onCopyValue={(field, text) => {
                void copyValue(field, text)
              }}
              onCopyMarkdown={() => {
                void handleCopyMarkdown()
              }}
              isCopyingMarkdown={isCopyingMarkdown}
              copyFeedback={copyFeedback}
              safeQuickstart={safeQuickstart}
            />
          ) : null}

          <div className="visually-hidden" aria-live="polite" aria-atomic="true">
            {liveMessage}
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default PackageUseInChatAction
