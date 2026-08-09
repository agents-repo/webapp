import { useCallback, useId, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTerminal } from '@fortawesome/free-solid-svg-icons'
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
  const [showPopover, setShowPopover] = useState(false)
  const [selectedTargetId, setSelectedTargetId] = useState<InstallTargetId | null>(null)
  const [liveMessage, setLiveMessage] = useState('')

  const reactId = useId()
  const toggleId = `cli-install-toggle-${controlId}`
  const popoverId = `cli-install-popover-${controlId}`
  const initLabelId = `cli-init-label-${controlId}`
  const installLabelId = `cli-install-label-${controlId}`
  const targetGroupName = `cli-target-${controlId}-${reactId.replace(/:/g, '')}`

  const handleTogglePopover = () => {
    setShowPopover((current) => !current)
  }

  const handleHidePopover = () => {
    setShowPopover(false)
    setSelectedTargetId(null)
    setLiveMessage('')
  }

  const copyCommand = useCallback(async (text: string, successMessage: string) => {
    const result = await copyTextToClipboard(text)
    if (result === 'success') {
      setLiveMessage(successMessage)
      return
    }
    setLiveMessage('Could not copy to clipboard. Copy the command manually.')
  }, [])

  const handleCopyInit = () => {
    if (!selectedTargetId) {
      return
    }
    void copyCommand(buildCliInitCommand(selectedTargetId), 'Copied init command to clipboard.')
  }

  const handleCopyInstall = () => {
    void copyCommand(buildCliInstallCommand(packageId), 'Copied install command to clipboard.')
  }

  const initCommandText = selectedTargetId
    ? buildCliInitCommand(selectedTargetId)
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
                type="radio"
                name={targetGroupName}
                value={selectedTargetId ?? ''}
                onChange={(value) => setSelectedTargetId(value as InstallTargetId)}
                className="package-cli-target-group d-flex flex-wrap gap-2"
              >
                {PLATFORM_INSTALL_TARGETS.map((targetId) => (
                  <ToggleButton
                    key={targetId}
                    id={`${targetGroupName}-${targetId}`}
                    value={targetId}
                    variant="outline-secondary"
                    size="sm"
                  >
                    {getInstallTargetLabel(targetId)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </fieldset>

            <div>
              <div className="h6 small fw-semibold mb-2">Initialize project</div>
              <CliTerminalCommandRow
                commandText={initCommandText}
                copyLabel={`Copy init command for ${packageName}`}
                onCopy={handleCopyInit}
                copyDisabled={!selectedTargetId}
                isPlaceholder={!selectedTargetId}
                labelId={initLabelId}
                dataTestId={`cli-init-terminal-${controlId}`}
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
