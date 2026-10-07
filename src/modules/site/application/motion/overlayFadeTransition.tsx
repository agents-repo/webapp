import type { ComponentProps } from 'react'
import Fade from 'react-bootstrap/Fade'

/** Matches `POPOVER_HIDE_DELAY_MS` in download-stats popover hover logic. */
export const overlayFadeDurationMs = 150

export type OverlayFadeTransitionProps = ComponentProps<typeof Fade>

export function OverlayFadeTransition(props: OverlayFadeTransitionProps) {
  return (
    <Fade {...props} timeout={overlayFadeDurationMs} />
  )
}
