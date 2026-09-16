import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buildCliInstallCommand } from '../../application/cliInstallCopy'
import { copyTextToClipboard } from '../../../site/application/clipboard/copyTextToClipboard'
import CliTerminalCommandRow from './CliTerminalCommandRow'

const COPY_FEEDBACK_DURATION_MS = 3000

export interface PackageInlineInstallCommandProps {
  readonly packageName: string
  readonly packageRef: string
  readonly controlId: string
}

function PackageInlineInstallCommand({
  packageName,
  packageRef,
  controlId,
}: PackageInlineInstallCommandProps) {
  const { t } = useTranslation('catalog')
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [copyFeedback, setCopyFeedback] = useState('')
  const commandText = buildCliInstallCommand(packageRef)
  const labelId = `package-inline-install-label-${controlId}`

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
      }
    }
  }, [])

  const handleCopy = useCallback(async () => {
    const result = await copyTextToClipboard(commandText)
    setCopyFeedback(result === 'success' ? t('packageCard.copySuccess') : t('packageCard.copyFailure'))

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current)
    }

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setCopyFeedback('')
      feedbackTimeoutRef.current = null
    }, COPY_FEEDBACK_DURATION_MS)
  }, [commandText, t])

  return (
    <div className="package-card-inline-install d-none d-md-block">
      <CliTerminalCommandRow
        commandText={commandText}
        commandAccessibleLabel={t('packageCard.inlineInstallCommandLabel', { name: packageName })}
        copyLabel={t('packageCard.inlineInstallCopyLabel', { name: packageName })}
        onCopy={() => {
          void handleCopy()
        }}
        labelId={labelId}
        dataTestId={`package-inline-install-${controlId}`}
        copyFeedback={copyFeedback}
      />
    </div>
  )
}

export default PackageInlineInstallCommand
