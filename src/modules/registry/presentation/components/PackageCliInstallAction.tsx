import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare, faSquareCheck, faTerminal } from '@fortawesome/free-solid-svg-icons'
import { Button, Overlay, Popover, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import type { InstallTargetId } from '../../domain/package'
import { getInstallTargetLabel } from '../../application/installTargets'
import {
  PLATFORM_INSTALL_TARGETS,
  buildCliInitCommand,
  buildCliInstallCommand,
  getCliInitPlaceholderCommand,
  getCliInstallPopoverIntro,
} from '../../application/cliInstallCopy'
import { copyTextToClipboard } from '../../../site/application/clipboard/copyTextToClipboard'
import CliTerminalCommandRow from './CliTerminalCommandRow'

const COPY_FEEDBACK_MESSAGE = 'Copied to clipboard.'
const COPY_FEEDBACK_DURATION_MS = 3000

export interface PackageCliInstallActionProps {
  readonly packageName: string
  readonly packageId: string
  readonly controlId: string
}

function PackageCliInstallActionInner({
  packageName,
  packageId,
  controlId,
}: PackageCliInstallActionProps) {
  const toggleRef = useRef<HTMLButtonElement>(null)
  const initFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const installFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showPopover, setShowPopover] = useState(false)
  const [selectedTargetIds, setSelectedTargetIds] = useState<InstallTargetId[]>([])
  const [liveMessage, setLiveMessage] = useState('')
  const [initCopyFeedback, setInitCopyFeedback] = useState('')
  const [installCopyFeedback, setInstallCopyFeedback] = useState('')

  const reactId = useId()
  const toggleId = `cli-install-toggle-${controlId}`
  const popoverId = `cli-install-popover-${controlId}`
  const initLabelId = `cli-init-label-${controlId}`
  const installLabelId = `cli-install-label-${controlId}`
  const targetGroupName = `cli-target-${controlId}-${reactId.replaceAll(':', '')}`

  useEffect(() => {
    return () => {
      if (initFeedbackTimeoutRef.current) {
        clearTimeout(initFeedbackTimeoutRef.current)
      }
      if (installFeedbackTimeoutRef.current) {
        clearTimeout(installFeedbackTimeoutRef.current)
      }
    }
  }, [])

  const clearCopyFeedback = useCallback(() => {
    setInitCopyFeedback('')
    setInstallCopyFeedback('')
    if (initFeedbackTimeoutRef.current) {
      clearTimeout(initFeedbackTimeoutRef.current)
      initFeedbackTimeoutRef.current = null
    }
    if (installFeedbackTimeoutRef.current) {
      clearTimeout(installFeedbackTimeoutRef.current)
      installFeedbackTimeoutRef.current = null
    }
  }, [])

  const showCopyFeedback = useCallback(
    (
      setFeedback: (message: string) => void,
      timeoutRef: { current: ReturnType<typeof setTimeout> | null },
    ) => {
      setFeedback(COPY_FEEDBACK_MESSAGE)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setFeedback('')
        timeoutRef.current = null
      }, COPY_FEEDBACK_DURATION_MS)
    },
    [],
  )

  const handleTogglePopover = () => {
    setShowPopover((current) => !current)
  }

  const handleHidePopover = () => {
    setShowPopover(false)
    setSelectedTargetIds([])
    setLiveMessage('')
    clearCopyFeedback()
  }

  const copyCommand = useCallback(
    async (
      text: string,
      onSuccess: () => void,
    ) => {
      const result = await copyTextToClipboard(text)
      if (result === 'success') {
        setLiveMessage(COPY_FEEDBACK_MESSAGE)
        onSuccess()
        return
      }
      setLiveMessage('Could not copy to clipboard. Copy the command manually.')
    },
    [],
  )

  const handleCopyInit = () => {
    if (selectedTargetIds.length === 0) {
      return
    }
    void copyCommand(buildCliInitCommand(selectedTargetIds), () => {
      showCopyFeedback(setInitCopyFeedback, initFeedbackTimeoutRef)
    })
  }

  const handleCopyInstall = () => {
    void copyCommand(buildCliInstallCommand(packageId), () => {
      showCopyFeedback(setInstallCopyFeedback, installFeedbackTimeoutRef)
    })
  }

  const hasSelectedTargets = selectedTargetIds.length > 0
  const initCommandText = hasSelectedTargets
    ? buildCliInitCommand(selectedTargetIds)
    : getCliInitPlaceholderCommand()

  return (
    <>
      <Button
        ref={toggleRef}
        id={toggleId}
        type="button"
        variant="outline-primary"
        size="lg"
        className="d-inline-flex align-items-center justify-content-center"
        aria-label={`CLI install for ${packageName}`}
        aria-expanded={showPopover}
        aria-controls={popoverId}
        onClick={handleTogglePopover}
      >
        <FontAwesomeIcon icon={faTerminal} aria-hidden="true" />
      </Button>

      <Overlay
        show={showPopover}
        target={toggleRef}
        placement="top"
        rootClose
        onHide={handleHidePopover}
      >
        <Popover
          id={popoverId}
          className="package-cli-install-popover"
          style={{ maxWidth: 'min(100vw - 2rem, 22rem)', width: '100%' }}
        >
          <Popover.Body className="d-flex flex-column gap-3">
            <p className="small text-body-secondary mb-0">{getCliInstallPopoverIntro()}</p>

            <fieldset className="package-cli-target-fieldset border-0 p-0 m-0">
              <legend className="form-label small fw-semibold mb-2">Choose AI tool</legend>
              <ToggleButtonGroup
                type="checkbox"
                name={targetGroupName}
                value={selectedTargetIds}
                onChange={(values) => setSelectedTargetIds(values as InstallTargetId[])}
                className="package-cli-target-group d-flex flex-wrap gap-2"
              >
                {PLATFORM_INSTALL_TARGETS.map((targetId) => {
                  const isSelected = selectedTargetIds.includes(targetId)
                  const label = getInstallTargetLabel(targetId)

                  return (
                    <ToggleButton
                      key={targetId}
                      id={`${targetGroupName}-${targetId}`}
                      value={targetId}
                      variant="outline-secondary"
                      size="sm"
                      className="package-cli-target-pill rounded-pill d-inline-flex align-items-center gap-2"
                      aria-label={label}
                    >
                      <FontAwesomeIcon
                        icon={isSelected ? faSquareCheck : faSquare}
                        className="package-cli-target-pill__checkbox"
                        aria-hidden="true"
                      />
                      <span>{label}</span>
                    </ToggleButton>
                  )
                })}
              </ToggleButtonGroup>
            </fieldset>

            <div>
              <div className="h6 small fw-semibold mb-2">Initialize project</div>
              <CliTerminalCommandRow
                commandText={initCommandText}
                copyLabel={`Copy init command for ${packageName}`}
                onCopy={handleCopyInit}
                copyDisabled={!hasSelectedTargets}
                isPlaceholder={!hasSelectedTargets}
                labelId={initLabelId}
                dataTestId={`cli-init-terminal-${controlId}`}
                copyFeedback={initCopyFeedback}
              />
            </div>

            <div>
              <div className="h6 small fw-semibold mb-2">Install package</div>
              <CliTerminalCommandRow
                commandText={buildCliInstallCommand(packageId)}
                copyLabel={`Copy install command for ${packageName}`}
                onCopy={handleCopyInstall}
                labelId={installLabelId}
                dataTestId={`cli-install-terminal-${controlId}`}
                copyFeedback={installCopyFeedback}
              />
            </div>

            <div className="visually-hidden" aria-live="polite" aria-atomic="true">
              {liveMessage}
            </div>
          </Popover.Body>
        </Popover>
      </Overlay>
    </>
  )
}

function PackageCliInstallAction(props: PackageCliInstallActionProps) {
  const trimmedPackageId = props.packageId.trim()
  if (!trimmedPackageId) {
    return null
  }

  return (
    <PackageCliInstallActionInner
      packageName={props.packageName}
      packageId={trimmedPackageId}
      controlId={props.controlId}
    />
  )
}

export default PackageCliInstallAction
