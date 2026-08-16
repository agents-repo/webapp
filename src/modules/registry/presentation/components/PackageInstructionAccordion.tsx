import { useEffect, useState } from 'react'
import { Accordion, Alert, Badge, Stack } from 'react-bootstrap'
import { fetchChatInstructionMarkdown } from '../../infrastructure/chatInstructionsRepository'
import { buildRegistryIndexUrl } from '../../infrastructure/registrySourceUrl'
import type { PackageDetailEntry } from '../../domain/packageDetail'
import PackageMarkdown from './PackageMarkdown'

interface PackageInstructionAccordionProps {
  readonly kind: 'agent' | 'flow'
  readonly entries: readonly PackageDetailEntry[]
  readonly registryBaseUrl: string
}

function PackageInstructionPanel({
  eventKey,
  kind,
  entry,
  registryBaseUrl,
  expanded,
}: {
  readonly eventKey: string
  readonly kind: 'agent' | 'flow'
  readonly entry: PackageDetailEntry
  readonly registryBaseUrl: string
  readonly expanded: boolean
}) {
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!expanded) {
      return
    }

    const abortController = new AbortController()
    let isActive = true

    const loadMarkdown = async (): Promise<void> => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const url = buildRegistryIndexUrl(registryBaseUrl, entry.instructionPath)
        const body = await fetchChatInstructionMarkdown(url, abortController.signal)
        if (isActive) {
          setMarkdown(body)
        }
      } catch (error) {
        if (!isActive || (error instanceof DOMException && error.name === 'AbortError')) {
          return
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load instruction markdown.')
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadMarkdown()

    return () => {
      isActive = false
      abortController.abort()
    }
  }, [entry.instructionPath, expanded, registryBaseUrl])

  return (
    <Accordion.Item eventKey={eventKey}>
      <Accordion.Header>
        <Stack gap={1} className="me-3">
          <span className="fw-semibold">
            {entry.name}
            <Badge bg="secondary" className="ms-2 fw-normal">
              {kind}
            </Badge>
          </span>
          <span className="small text-body-secondary">{entry.description}</span>
        </Stack>
      </Accordion.Header>
      <Accordion.Body>
        {isLoading && !markdown ? <p className="mb-0 text-body-secondary">Loading markdown…</p> : null}
        {errorMessage ? (
          <Alert variant="danger" className="mb-0">
            {errorMessage}
          </Alert>
        ) : null}
        {markdown ? <PackageMarkdown markdown={markdown} /> : null}
      </Accordion.Body>
    </Accordion.Item>
  )
}

function PackageInstructionAccordion({ kind, entries, registryBaseUrl }: PackageInstructionAccordionProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null)

  if (entries.length === 0) {
    return <p className="text-body-secondary mb-0">No {kind === 'agent' ? 'agents' : 'flows'} in this package.</p>
  }

  return (
    <Accordion
      activeKey={activeKey ?? undefined}
      onSelect={(key) => setActiveKey(typeof key === 'string' ? key : null)}
      className="package-instruction-accordion"
    >
      {entries.map((entry) => {
        const eventKey = `${kind}-${entry.id}`
        return (
          <PackageInstructionPanel
            key={eventKey}
            eventKey={eventKey}
            kind={kind}
            entry={entry}
            registryBaseUrl={registryBaseUrl}
            expanded={activeKey === eventKey}
          />
        )
      })}
    </Accordion>
  )
}

export default PackageInstructionAccordion
