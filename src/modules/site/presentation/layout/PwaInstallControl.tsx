import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from 'react-bootstrap'
import { usePwaInstall } from '../../application/pwa/usePwaInstall'

function PwaInstallControl() {
  const { canInstall, isInstalling, promptInstall } = usePwaInstall()

  if (!canInstall) {
    return null
  }

  return (
    <Button
      variant="link"
      className="d-inline-flex align-items-center justify-content-center app-header-icon-control"
      onClick={() => {
        void promptInstall()
      }}
      disabled={isInstalling}
      aria-label="Install Agents Repo app"
      title="Install app"
    >
      <FontAwesomeIcon icon={faDownload} className="fa-fw" aria-hidden="true" />
    </Button>
  )
}

export default PwaInstallControl
