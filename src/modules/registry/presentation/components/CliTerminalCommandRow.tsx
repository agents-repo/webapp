import { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { Button, Overlay, Tooltip } from 'react-bootstrap'

export interface CliTerminalCommandRowProps {
  readonly commandText: string
  readonly copyLabel: string
  readonly onCopy: () => void
  readonly copyDisabled?: boolean
  readonly isPlaceholder?: boolean
  readonly labelId: string
  readonly dataTestId?: string
  readonly copyFeedback?: string
}

function CliTerminalCommandRow({
  commandText,
  copyLabel,
  onCopy,
  copyDisabled = false,
  isPlaceholder = false,
  labelId,
  dataTestId,
  copyFeedback,
}: CliTerminalCommandRowProps) {
  const copyButtonRef = useRef<HTMLButtonElement>(null)
  const showCopyTooltip = Boolean(copyFeedback)
  const copyTooltipId = `${labelId}-copy-tooltip`

  const terminalClassName = isPlaceholder
    ? 'package-cli-terminal package-cli-terminal--placeholder'
    : 'package-cli-terminal'

  return (
    <div className={terminalClassName} data-testid={dataTestId}>
      <span id={labelId} className="visually-hidden">
        {copyLabel.replace(/^Copy /i, '')}
      </span>
      <span className="package-cli-terminal__prompt" aria-hidden="true">
        $
      </span>
      <span
        className="package-cli-terminal__command"
        aria-labelledby={labelId}
      >
        {commandText}
      </span>
      <Button
        ref={copyButtonRef}
        type="button"
        variant="link"
        className="package-cli-terminal__copy p-0 border-0"
        aria-label={copyLabel}
        aria-describedby={showCopyTooltip ? copyTooltipId : undefined}
        disabled={copyDisabled}
        onClick={onCopy}
      >
        <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
      </Button>

      <Overlay target={copyButtonRef} show={showCopyTooltip} placement="top">
        {(overlayProps) => (
          <Tooltip
            id={copyTooltipId}
            {...overlayProps}
            className="package-cli-copy-tooltip"
            role="status"
          >
            {copyFeedback}
          </Tooltip>
        )}
      </Overlay>
    </div>
  )
}

export default CliTerminalCommandRow
