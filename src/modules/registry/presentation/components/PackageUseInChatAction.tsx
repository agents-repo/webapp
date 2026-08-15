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
import { externalLinkAccessibleName } from '../../../site/application/accessibility/externalLink'
import { copyTextToClipboard } from '../../../site/application/clipboard/copyTextToClipboard'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import {
  CHAT_PLATFORM_GUIDES,
  CHAT_URL_FETCH_FALLBACK_WARNING,
  buildChatInstructionCopyUrls,
  buildChatInstructionLatestUrlFromPath,
  buildChatInstructionMarkdownForPaste,
  buildChatPlatformOpenUrl,
  buildChatRelatedAgentMarkdownSources,
  buildChatStarterPrompt,
  findChatInstruction,
  groupChatInstructionsByKind,
  instructionOptionKey,
  type ChatInstructionCopyUrls,
  type ChatInstructionEntry,
  type ChatInstructionOptionGroup,
  type ChatInstructionsManifest,
} from '../../application/chatConsumption'
import {
  fetchChatInstructionMarkdown,
  fetchChatInstructionsManifest,
  readCachedChatInstructionsManifest,
} from '../../infrastructure/chatInstructionsRepository'
import { buildRegistryPkgInstructionsUrl } from '../../infrastructure/registrySourceUrl'

const COPY_FEEDBACK_MESSAGE = 'Copied to clipboard.'
const COPY_FEEDBACK_DURATION_MS = 3000
const COPY_FAILURE_MESSAGE = 'Could not copy to clipboard. Copy the text manually.'

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
  const { selectedInstruction, copyUrls, starterPrompt, instructionGroups } = selectedState

  return (
    <Form>
      <Stack gap={3}>
        <Form.Group controlId={pickerId}>
          <Form.Label>Instruction</Form.Label>
          <Form.Select value={selectedKey} onChange={(event) => onSelectKey(event.target.value)}>
            {instructionGroups.map((group) => (
              <optgroup key={group.kind} label={group.label}>
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
          label="Latest instruction URL"
          value={copyUrls.latestUrl}
          copyLabel={`Copy latest instruction URL for ${selectedInstruction.id}`}
          onCopy={() => onCopyValue('latest', copyUrls.latestUrl)}
          copyFeedback={copyFeedback.latest ?? ''}
        />

        <CopyableTextRow
          controlId={`${pickerId}-pinned`}
          label={`Pinned instruction URL (v${latest})`}
          value={copyUrls.pinnedUrl}
          copyLabel={`Copy pinned instruction URL for ${selectedInstruction.id}`}
          onCopy={() => onCopyValue('pinned', copyUrls.pinnedUrl)}
          copyFeedback={copyFeedback.pinned ?? ''}
        />

        <div>
          <div className="form-label">Instruction markdown</div>
          <Button
            type="button"
            variant="outline-secondary"
            disabled={isCopyingMarkdown}
            aria-busy={isCopyingMarkdown}
            onClick={onCopyMarkdown}
          >
            {isCopyingMarkdown ? 'Copying markdown…' : 'Copy instruction markdown'}
          </Button>
          {selectedInstruction.kind === 'flow' && (selectedInstruction.agentInstructions?.length ?? 0) > 0 ? (
            <div className="form-text">Includes this flow and its related agent files.</div>
          ) : null}
          {copyFeedback.markdown ? (
            <output className="form-text d-block">{copyFeedback.markdown}</output>
          ) : null}
        </div>

        <CopyableTextRow
          controlId={`${pickerId}-prompt`}
          label="Starter prompt"
          value={starterPrompt}
          copyLabel={`Copy starter prompt for ${selectedInstruction.id}`}
          onCopy={() => onCopyValue('prompt', starterPrompt)}
          copyFeedback={copyFeedback.prompt ?? ''}
          rows={selectedInstruction.kind === 'flow' ? 6 : 3}
        />

        <Alert variant="warning" role="note" className="mb-0">
          <Alert.Heading as="h3" className="h6">
            If the chat cannot load the URL
          </Alert.Heading>
          <p className="mb-0">{CHAT_URL_FETCH_FALLBACK_WARNING}</p>
        </Alert>

        <div>
          <h3 className="h6">How to use in a web chat</h3>
          <Tabs defaultActiveKey="chatgpt" id={`${pickerId}-platforms`} className="mb-3">
            {CHAT_PLATFORM_GUIDES.map((guide) => {
              const openUrl = buildChatPlatformOpenUrl(guide.id, starterPrompt)
              const safeOpenUrl = openUrl && isSafeExternalHttpUrl(openUrl) ? openUrl : null

              return (
                <Tab eventKey={guide.id} title={guide.label} key={guide.id}>
                  <ol className={safeOpenUrl ? 'small mb-3 ps-3' : 'small mb-0 ps-3'}>
                    {guide.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  {safeOpenUrl ? (
                    <a
                      href={safeOpenUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn btn-outline-primary"
                      aria-label={externalLinkAccessibleName('Open in ChatGPT')}
                    >
                      Open in ChatGPT
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
              {externalLinkAccessibleName('Package quickstart')}
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
  const reactId = useId()
  const modalInteractionRef = useRef(0)
  const copyFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopyingMarkdown, setIsCopyingMarkdown] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [manifest, setManifest] = useState<ChatInstructionsManifest | null>(null)
  const [selectedKey, setSelectedKey] = useState('')
  const [liveMessage, setLiveMessage] = useState('')
  const [copyFeedback, setCopyFeedback] = useState<Partial<Record<CopyField, string>>>({})

  const toggleId = `use-in-chat-toggle-${controlId}`
  const modalId = `use-in-chat-modal-${controlId}`
  const pickerId = `use-in-chat-picker-${controlId}-${reactId.replaceAll(':', '')}`
  const safeQuickstart = quickstart && isSafeExternalHttpUrl(quickstart) ? quickstart : null
  const selectedState =
    manifest === null
      ? null
      : resolveSelectedChatCopyState(manifest, selectedKey, registryBaseUrl, namespace, packageId, latest)

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
    setIsLoading(false)
    setIsCopyingMarkdown(false)
    setErrorMessage(null)
    setManifest(null)
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
    setCopyFeedback({ [field]: COPY_FEEDBACK_MESSAGE })
    if (copyFeedbackTimeoutRef.current) {
      clearTimeout(copyFeedbackTimeoutRef.current)
    }
    copyFeedbackTimeoutRef.current = setTimeout(() => {
      setCopyFeedback({})
      copyFeedbackTimeoutRef.current = null
    }, COPY_FEEDBACK_DURATION_MS)
  }, [])

  const openModal = () => {
    const instructionsUrl = buildRegistryPkgInstructionsUrl(
      registryBaseUrl,
      namespace,
      packageId,
      latest,
    )
    const cached = readCachedChatInstructionsManifest(instructionsUrl)

    setShowModal(true)
    setErrorMessage(null)
    setLiveMessage('')
    clearCopyFeedback()

    if (cached) {
      setManifest(cached)
      setSelectedKey(instructionOptionKey(cached.instructions[0]))
      setIsLoading(false)
      return
    }

    setManifest(null)
    setSelectedKey('')
    setIsLoading(true)
  }

  useEffect(() => {
    if (!showModal) {
      return
    }

    const interactionAtStart = modalInteractionRef.current
    const controller = new AbortController()

    const loadInstructions = async (): Promise<void> => {
      try {
        const loaded = await fetchChatInstructionsManifest(
          buildRegistryPkgInstructionsUrl(registryBaseUrl, namespace, packageId, latest),
          controller.signal,
        )
        if (interactionAtStart !== modalInteractionRef.current) {
          return
        }
        setManifest(loaded)
        setSelectedKey(instructionOptionKey(loaded.instructions[0]))
        setErrorMessage(null)
      } catch (error) {
        if (isAbortError(error) || interactionAtStart !== modalInteractionRef.current) {
          return
        }
        setManifest(null)
        setErrorMessage(messageFromError(error, 'Unable to load chat instructions.'))
      } finally {
        if (interactionAtStart === modalInteractionRef.current) {
          setIsLoading(false)
        }
      }
    }

    void loadInstructions()

    return () => {
      controller.abort()
    }
  }, [latest, namespace, packageId, registryBaseUrl, showModal])

  const copyValue = useCallback(
    async (field: CopyField, text: string) => {
      const interactionAtStart = modalInteractionRef.current
      const result = await copyTextToClipboard(text)
      if (interactionAtStart !== modalInteractionRef.current) {
        return
      }
      if (result === 'success') {
        setLiveMessage(COPY_FEEDBACK_MESSAGE)
        showFieldCopyFeedback(field)
        return
      }
      setLiveMessage(COPY_FAILURE_MESSAGE)
    },
    [showFieldCopyFeedback],
  )

  const handleCopyMarkdown = async (): Promise<void> => {
    if (!selectedState) {
      return
    }
    const interactionAtStart = modalInteractionRef.current
    setIsCopyingMarkdown(true)
    try {
      const relatedPaths = selectedState.selectedInstruction.agentInstructions ?? []
      const relatedSources =
        selectedState.selectedInstruction.kind === 'flow' && relatedPaths.length > 0
          ? buildChatRelatedAgentMarkdownSources(registryBaseUrl, relatedPaths)
          : []

      if (relatedSources === null) {
        throw new Error('Unable to load instruction markdown.')
      }

      const [markdown, ...relatedMarkdowns] = await Promise.all([
        fetchChatInstructionMarkdown(selectedState.copyUrls.fetchUrl),
        ...relatedSources.map((source) => fetchChatInstructionMarkdown(source.fetchUrl)),
      ])
      if (interactionAtStart !== modalInteractionRef.current) {
        return
      }

      if (relatedMarkdowns.length !== relatedSources.length) {
        throw new Error('Unable to load instruction markdown.')
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
      setLiveMessage(messageFromError(error, 'Unable to load instruction markdown.'))
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
        size="lg"
        className="d-inline-flex align-items-center justify-content-center"
        aria-label={`Use ${packageName} in chat`}
        aria-haspopup="dialog"
        aria-expanded={showModal}
        aria-controls={modalId}
        onClick={openModal}
      >
        <FontAwesomeIcon icon={faComments} aria-hidden="true" />
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
            Use {packageName} in chat
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id={modalId} aria-busy={isLoading}>
          {isLoading ? (
            <output className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" aria-hidden="true" />
              <span>Loading chat instructions</span>
            </output>
          ) : null}

          {errorMessage ? (
            <Alert variant="danger" className="mb-0">
              {errorMessage}
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
