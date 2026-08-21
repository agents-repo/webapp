import { useState } from 'react'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { getDocDetailPath } from '../../application/docs/docsCatalog'
import {
  detectNativeInstallPromptSupport,
  isRunningAsInstalledPwa,
  resolvePwaInstallGuidance,
  type PwaInstallGuidanceKind,
} from '../../application/pwa/pwaInstall'
import { usePwaInstall } from '../../application/pwa/usePwaInstall'
import { publicSitePath } from '../routes/siteRoutes'

const installGuidanceCopy: Record<PwaInstallGuidanceKind, string> = {
  'ios-share': 'On iPhone or iPad, open the Share menu and choose Add to Home Screen.',
  'firefox-android': 'In Firefox for Android, open the browser menu and choose Install.',
  'firefox-desktop':
    'Firefox on desktop cannot install this site as an app. See Using the catalog for other options.',
  'safari-macos': 'In Safari on Mac, choose File, then Add to Dock.',
  generic: 'Your browser may let you install or add this site from its menu.',
}

function PwaInstallControl() {
  const { canInstall, isInstalling, promptInstall } = usePwaInstall()
  const [showGuidance, setShowGuidance] = useState(false)

  if (isRunningAsInstalledPwa()) {
    return null
  }

  if (canInstall) {
    return (
      <Button
        variant="link"
        className="d-inline-flex align-items-center justify-content-center app-header-icon-control"
        onClick={() => {
          void promptInstall()
        }}
        disabled={isInstalling}
        aria-busy={isInstalling}
        aria-label={isInstalling ? 'Installing Agents Repo app' : 'Install Agents Repo app'}
        title="Install app"
      >
        <FontAwesomeIcon icon={faDownload} className="fa-fw" aria-hidden="true" />
      </Button>
    )
  }

  if (detectNativeInstallPromptSupport()) {
    return null
  }

  const closeGuidance = () => {
    setShowGuidance(false)
  }

  const guidanceKind = resolvePwaInstallGuidance({
    userAgent: globalThis.navigator.userAgent,
    maxTouchPoints: globalThis.navigator.maxTouchPoints,
  })

  return (
    <>
      <Button
        variant="link"
        className="d-inline-flex align-items-center justify-content-center app-header-icon-control"
        onClick={() => {
          setShowGuidance(true)
        }}
        aria-label="How to install this site"
        title="How to install this site"
      >
        <FontAwesomeIcon icon={faDownload} className="fa-fw" aria-hidden="true" />
      </Button>

      <Modal show={showGuidance} onHide={closeGuidance} centered>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">
            Install this site
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{installGuidanceCopy[guidanceKind]}</p>
          <p className="mb-0">
            <Link to={publicSitePath(getDocDetailPath('using-the-catalog'))} onClick={closeGuidance}>
              Learn more about installing this site
            </Link>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeGuidance}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default PwaInstallControl
