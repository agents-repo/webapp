import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { Badge, Dropdown } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import type { PackageDownloadTarget } from '../pages/homePageCatalogState'

export function PackageDownloadMenu(options: {
  readonly packageName: string
  readonly controlId: string
  readonly downloadTargets: readonly PackageDownloadTarget[]
}): ReactNode {
  const { t } = useTranslation('catalog')
  const { packageName, controlId, downloadTargets } = options

  if (downloadTargets.length === 0) {
    return null
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="outline-primary"
        id={controlId}
        className="d-inline-flex align-items-center justify-content-center package-card-action"
        aria-label={t('packageCard.downloadAriaLabel', { name: packageName })}
      >
        <FontAwesomeIcon icon={faDownload} aria-hidden="true" />
        <span className="package-card-action-label">{t('packageCard.download')}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {downloadTargets.map((target) => (
          <Dropdown.Item
            key={target.id}
            href={target.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t('packageCard.downloadItemAriaLabel', { name: packageName, target: target.label })}
          >
            {target.label}
            {target.status === 'experimental' ? (
              <Badge bg="warning" text="dark" pill className="ms-2 fw-normal">
                {t('packageCard.experimental')}
              </Badge>
            ) : null}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
