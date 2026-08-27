import { useCallback, useEffect, useRef, useState } from 'react'
import { Col, Container, Row, Stack } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { copyTextToClipboard } from '../../../../site/application/clipboard/copyTextToClipboard'
import { getDocDetailPath } from '../../../../site/application/docs/docsCatalog'
import { publicSitePath } from '../../../../site/presentation/routes/siteRoutes'
import CliTerminalCommandRow from '../CliTerminalCommandRow'
import {
  CLI_INIT_COMMAND,
  CLI_INSTALL_COMMAND,
  CLI_QUICKSTART_ID,
} from './homeLandingCopy'

const COPY_FEEDBACK_MESSAGE = 'Copied to clipboard.'
const COPY_FEEDBACK_DURATION_MS = 3000
const COPY_FAILURE_MESSAGE = 'Could not copy to clipboard. Copy the command manually.'

function HomeCliQuickstartSection() {
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
      setLiveMessage(COPY_FAILURE_MESSAGE)
    },
    [],
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
            <h2 className="h3 text-center mb-3">Install with the CLI</h2>
            <p className="text-body-secondary text-center mb-4">
              Initialize your project, then install a package. For real projects, pin the CLI as a
              devDependency so teammates and CI use the same version.
            </p>
            <Stack gap={3}>
              <div>
                <div className="h6 small fw-semibold mb-2">Initialize install targets</div>
                <CliTerminalCommandRow
                  commandText={CLI_INIT_COMMAND}
                  copyLabel="Copy init command"
                  onCopy={handleCopyInit}
                  labelId="home-cli-init-label"
                  dataTestId="home-cli-init-terminal"
                  copyFeedback={initCopyFeedback}
                />
              </div>
              <div>
                <div className="h6 small fw-semibold mb-2">Install a package</div>
                <CliTerminalCommandRow
                  commandText={CLI_INSTALL_COMMAND}
                  copyLabel="Copy install command"
                  onCopy={handleCopyInstall}
                  labelId="home-cli-install-label"
                  dataTestId="home-cli-install-terminal"
                  copyFeedback={installCopyFeedback}
                />
              </div>
            </Stack>
            <p className="text-center small mt-4 mb-0">
              <Link to={publicSitePath(getDocDetailPath('installing-packages'))}>
                Installing packages
              </Link>
              {' · '}
              <Link to={publicSitePath(getDocDetailPath('cli-commands'))}>CLI command reference</Link>
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
