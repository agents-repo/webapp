import { useCallback, useEffect, useRef, useState } from 'react'
import { Col, Container, Row, Stack } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { copyTextToClipboard } from '../../../../site/application/clipboard/copyTextToClipboard'
import { getDocDetailPath } from '../../../../site/application/docs/docsCatalog'
import { useLocalizedSitePath } from '../../../../site/application/i18n/useLocalizedSitePath.ts'
import CliTerminalCommandRow from '../CliTerminalCommandRow'
import {
  CLI_INIT_COMMAND,
  CLI_INSTALL_COMMAND,
  CLI_QUICKSTART_ID,
} from './homeLandingCopy'

const COPY_FEEDBACK_DURATION_MS = 3000

function HomeCliQuickstartSection() {
  const { t } = useTranslation('catalog')
  const localizedSitePath = useLocalizedSitePath()
  const [initCopyFeedback, setInitCopyFeedback] = useState('')
  const [installCopyFeedback, setInstallCopyFeedback] = useState('')
  const [liveMessage, setLiveMessage] = useState('')
  const initFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const installFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const initTimeoutRef = initFeedbackTimeoutRef
    const installTimeoutRef = installFeedbackTimeoutRef

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
      if (installTimeoutRef.current) {
        clearTimeout(installTimeoutRef.current)
      }
    }
  }, [])

  const showCopyFeedback = useCallback(
    (
      setFeedback: (message: string) => void,
      timeoutRef: { current: ReturnType<typeof setTimeout> | null },
    ) => {
      setFeedback(t('homeLanding.cliQuickstart.copySuccess'))
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setFeedback('')
        timeoutRef.current = null
      }, COPY_FEEDBACK_DURATION_MS)
    },
    [t],
  )

  const copyCommand = useCallback(
    async (
      text: string,
      onSuccess: () => void,
    ) => {
      const result = await copyTextToClipboard(text)
      if (result === 'success') {
        setLiveMessage(t('homeLanding.cliQuickstart.copySuccess'))
        onSuccess()
        return
      }
      setLiveMessage(t('homeLanding.cliQuickstart.copyFailure'))
    },
    [t],
  )

  const handleCopyInit = () => {
    void copyCommand(CLI_INIT_COMMAND, () => {
      showCopyFeedback(setInitCopyFeedback, initFeedbackTimeoutRef)
    })
  }

  const handleCopyInstall = () => {
    void copyCommand(CLI_INSTALL_COMMAND, () => {
      showCopyFeedback(setInstallCopyFeedback, installFeedbackTimeoutRef)
    })
  }

  return (
    <section id={CLI_QUICKSTART_ID} className="py-4 py-lg-5 home-landing-hash-target">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <h2 className="h3 text-center mb-3">{t('homeLanding.cliQuickstart.heading')}</h2>
            <p className="text-body-secondary text-center mb-4">{t('homeLanding.cliQuickstart.lead')}</p>
            <Stack gap={3}>
              <div>
                <div className="h6 small fw-semibold mb-2">{t('homeLanding.cliQuickstart.initLabel')}</div>
                <CliTerminalCommandRow
                  commandText={CLI_INIT_COMMAND}
                  copyLabel={t('homeLanding.cliQuickstart.copyInitLabel')}
                  onCopy={handleCopyInit}
                  labelId="home-cli-init-label"
                  dataTestId="home-cli-init-terminal"
                  copyFeedback={initCopyFeedback}
                />
              </div>
              <div>
                <div className="h6 small fw-semibold mb-2">{t('homeLanding.cliQuickstart.installLabel')}</div>
                <CliTerminalCommandRow
                  commandText={CLI_INSTALL_COMMAND}
                  copyLabel={t('homeLanding.cliQuickstart.copyInstallLabel')}
                  onCopy={handleCopyInstall}
                  labelId="home-cli-install-label"
                  dataTestId="home-cli-install-terminal"
                  copyFeedback={installCopyFeedback}
                />
              </div>
            </Stack>
            <p className="text-center small mt-4 mb-0">
              <Link to={localizedSitePath(getDocDetailPath('installing-packages'))}>
                {t('homeLanding.cliQuickstart.installingPackagesLink')}
              </Link>
              {' · '}
              <Link to={localizedSitePath(getDocDetailPath('cli-commands'))}>
                {t('homeLanding.cliQuickstart.cliCommandsLink')}
              </Link>
            </p>
            <div className="visually-hidden" aria-live="polite" aria-atomic="true">
              {liveMessage}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default HomeCliQuickstartSection
