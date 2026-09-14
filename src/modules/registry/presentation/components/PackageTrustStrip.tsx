import type { ReactNode } from 'react'
import { Badge, Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { formatCatalogUpdatedAt } from '../../application/registrySelectors'
import { getInstallTargetLabel } from '../../application/installTargets'
import { formatPackageDownloadCount } from '../../application/packageDownloadStats'
import type { RegistryPackage } from '../../domain/package'
import type { PackageDownloadStats } from '../../domain/downloadStats'

export function PackageTrustStrip(options: {
  readonly catalogPackage: RegistryPackage
  readonly license?: string
  readonly lastUpdatedAt: string | null
  readonly downloadStats: PackageDownloadStats
}): ReactNode {
  const { t, i18n } = useTranslation('catalog')
  const { catalogPackage, license, lastUpdatedAt, downloadStats } = options
  const installTargets = catalogPackage.installTargets ?? []
  const formattedLastUpdated =
    lastUpdatedAt !== null ? formatCatalogUpdatedAt(lastUpdatedAt, i18n.language) : null

  return (
    <section
      className="package-trust-strip border rounded border-secondary-subtle px-3 py-2"
      aria-label={t('packageDetail.trustStripAriaLabel')}
    >
      <Stack direction="horizontal" gap={3} className="flex-wrap small">
        {license ? (
          <span>
            <span className="text-body-secondary">{t('packageDetail.trustStripLicense')}:</span>{' '}
            <span>{license}</span>
          </span>
        ) : null}
        {installTargets.length > 0 ? (
          <span className="d-inline-flex flex-wrap align-items-center gap-1">
            <span className="text-body-secondary">{t('packageDetail.trustStripInstallTargets')}:</span>
            {installTargets.map((target) => (
              <Badge key={target.id} bg="secondary" className="fw-normal">
                {getInstallTargetLabel(target.id)} ({target.status})
              </Badge>
            ))}
          </span>
        ) : null}
        {formattedLastUpdated ? (
          <span>
            <span className="text-body-secondary">{t('packageDetail.lastUpdated')}:</span>{' '}
            <time dateTime={lastUpdatedAt ?? undefined}>{formattedLastUpdated}</time>
          </span>
        ) : null}
        <span>
          <span className="text-body-secondary">{t('packageDetail.trustStripDownloads')}:</span>{' '}
          <span>{formatPackageDownloadCount(downloadStats.downloads, i18n.language)}</span>
        </span>
      </Stack>
    </section>
  )
}
