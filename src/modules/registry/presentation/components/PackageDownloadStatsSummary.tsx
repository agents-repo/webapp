import { Fragment, type ReactNode } from 'react'
import {
  formatPackageDownloadCount,
  getPackageDownloadMetric,
} from '../../application/packageDownloadStats'
import {
  DOWNLOAD_STATS_PERIODS,
  DOWNLOAD_STATS_PERIOD_LABELS,
  type PackageDownloadStats,
} from '../../domain/downloadStats'

export function PackageDownloadStatsSummary(options: {
  readonly stats: PackageDownloadStats
  readonly packageName: string
  readonly variant: 'card' | 'detail'
}): ReactNode {
  const { stats, packageName, variant } = options
  const allTimeLabel = `${formatPackageDownloadCount(stats.downloads)} downloads`
  const windowItems = DOWNLOAD_STATS_PERIODS.map((period) => ({
    period,
    label: DOWNLOAD_STATS_PERIOD_LABELS[period],
    count: formatPackageDownloadCount(getPackageDownloadMetric(stats, period)),
  }))

  if (variant === 'detail') {
    return (
      <section className="package-download-stats package-download-stats-detail" aria-label={`Download counts for ${packageName}`}>
        <h2 className="h4">Downloads</h2>
        <dl className="row mb-0 small">
          {windowItems.map((item) => (
            <Fragment key={item.period}>
              <dt className="col-sm-4">{item.label}</dt>
              <dd className="col-sm-8">{item.count}</dd>
            </Fragment>
          ))}
        </dl>
      </section>
    )
  }

  return (
    <details className="package-download-stats package-download-stats-card small">
      <summary className="package-download-stats-summary">
        <span>{allTimeLabel}</span>
        <span className="visually-hidden">{` for ${packageName}, all time. Open for last 7, 30, and 365 days.`}</span>
      </summary>
      <ul className="package-download-stats-windows list-unstyled mb-0 mt-2">
        {windowItems.map((item) => (
          <li key={item.period}>
            {item.label}: {item.count}
          </li>
        ))}
      </ul>
    </details>
  )
}
