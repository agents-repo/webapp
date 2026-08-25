import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Button, Overlay, Popover } from 'react-bootstrap'
import {
  formatPackageDownloadCount,
  getPackageDownloadMetric,
} from '../../application/packageDownloadStats'
import {
  DOWNLOAD_STATS_PERIODS,
  DOWNLOAD_STATS_PERIOD_LABELS,
  type PackageDownloadStats,
} from '../../domain/downloadStats'

const POPOVER_HIDE_DELAY_MS = 150

export type PackageDownloadStatsSummaryProps =
  | {
      readonly stats: PackageDownloadStats
      readonly packageName: string
      readonly variant: 'detail'
    }
  | {
      readonly stats: PackageDownloadStats
      readonly packageName: string
      readonly variant: 'card'
      readonly controlId: string
    }

function getDownloadWindowItems(stats: PackageDownloadStats): ReadonlyArray<{
  readonly period: (typeof DOWNLOAD_STATS_PERIODS)[number]
  readonly label: string
  readonly count: string
}> {
  return DOWNLOAD_STATS_PERIODS.map((period) => ({
    period,
    label: DOWNLOAD_STATS_PERIOD_LABELS[period],
    count: formatPackageDownloadCount(getPackageDownloadMetric(stats, period)),
  }))
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function PackageDownloadStatsDetail(options: {
  readonly stats: PackageDownloadStats
  readonly packageName: string
}): ReactNode {
  const windowItems = getDownloadWindowItems(options.stats)

  return (
    <section
      className="package-download-stats package-download-stats-detail"
      aria-label={`Download counts for ${options.packageName}`}
    >
      <h2 className="h4">Downloads</h2>
      <dl className="mb-0 small">
        {windowItems.map((item) => (
          <div key={item.period} className="package-download-stats-row">
            <dt>{item.label}</dt>
            <dd>{item.count}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function PackageDownloadStatsCard(options: {
  readonly stats: PackageDownloadStats
  readonly packageName: string
  readonly controlId: string
}): ReactNode {
  const { stats, packageName, controlId } = options
  const allTimeLabel = `${formatPackageDownloadCount(stats.downloads)} downloads`
  const windowItems = getDownloadWindowItems(stats)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusShowFrameRef = useRef<number | null>(null)
  const isPinnedRef = useRef(false)
  const suppressHoverRef = useRef(false)
  const [showPopover, setShowPopover] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const toggleId = `download-stats-toggle-${controlId}`
  const popoverId = `download-stats-popover-${controlId}`
  const accessibleName = `${allTimeLabel} for ${packageName}`

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }, [])

  const cancelFocusShow = useCallback(() => {
    if (focusShowFrameRef.current !== null) {
      cancelAnimationFrame(focusShowFrameRef.current)
      focusShowFrameRef.current = null
    }
  }, [])

  const closePopover = useCallback(
    (options?: { readonly suppressHover?: boolean }) => {
      cancelFocusShow()
      clearHideTimeout()
      isPinnedRef.current = false
      setIsPinned(false)
      setShowPopover(false)
      if (options?.suppressHover) {
        suppressHoverRef.current = true
      }
    },
    [cancelFocusShow, clearHideTimeout],
  )

  const scheduleHide = useCallback(() => {
    if (isPinnedRef.current) {
      return
    }

    clearHideTimeout()
    hideTimeoutRef.current = setTimeout(() => {
      hideTimeoutRef.current = null
      if (!isPinnedRef.current) {
        setShowPopover(false)
      }
    }, POPOVER_HIDE_DELAY_MS)
  }, [clearHideTimeout])

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      if (focusShowFrameRef.current !== null) {
        cancelAnimationFrame(focusShowFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!showPopover) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closePopover({ suppressHover: true })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closePopover, showPopover])

  const handleClick = () => {
    if (isPinned) {
      closePopover({ suppressHover: true })
      return
    }

    clearHideTimeout()
    isPinnedRef.current = true
    setIsPinned(true)
    setShowPopover(true)
  }

  const handleMouseEnter = () => {
    if (suppressHoverRef.current || prefersReducedMotion()) {
      return
    }

    clearHideTimeout()
    setShowPopover(true)
  }

  const handleMouseLeave = () => {
    suppressHoverRef.current = false
    if (prefersReducedMotion()) {
      return
    }

    scheduleHide()
  }

  const handleFocus = () => {
    cancelFocusShow()
    focusShowFrameRef.current = requestAnimationFrame(() => {
      focusShowFrameRef.current = null
      clearHideTimeout()
      setShowPopover(true)
    })
  }

  const handleBlur = () => {
    if (isPinnedRef.current) {
      return
    }

    scheduleHide()
  }

  const handleHide = (event?: Event) => {
    if (event && 'key' in event && event.key === 'Escape') {
      closePopover({ suppressHover: true })
      return
    }

    const eventTarget = event?.target
    if (eventTarget instanceof Node && toggleRef.current?.contains(eventTarget)) {
      return
    }

    closePopover()
  }

  return (
    <>
      <Button
        ref={toggleRef}
        id={toggleId}
        type="button"
        variant="link"
        size="sm"
        className="package-download-stats-trigger small p-0 mt-1"
        aria-label={accessibleName}
        aria-expanded={showPopover}
        aria-controls={popoverId}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {allTimeLabel}
      </Button>

      <Overlay
        show={showPopover}
        target={toggleRef}
        placement="bottom"
        flip
        containerPadding={8}
        popperConfig={{
          strategy: 'fixed',
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                altAxis: true,
              },
            },
          ],
        }}
        rootClose
        transition={false}
        onHide={handleHide}
      >
        <Popover
          id={popoverId}
          className="package-download-stats-popover"
          aria-label={`Download counts for ${packageName}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Popover.Body className="py-2 px-3">
            <ul className="package-download-stats-windows list-unstyled mb-0 small">
              {windowItems.map((item) => (
                <li key={item.period}>
                  {item.label}: {item.count}
                </li>
              ))}
            </ul>
          </Popover.Body>
        </Popover>
      </Overlay>
    </>
  )
}

export function PackageDownloadStatsSummary(options: PackageDownloadStatsSummaryProps): ReactNode {
  if (options.variant === 'detail') {
    return <PackageDownloadStatsDetail stats={options.stats} packageName={options.packageName} />
  }

  return (
    <PackageDownloadStatsCard
      stats={options.stats}
      packageName={options.packageName}
      controlId={options.controlId}
    />
  )
}
