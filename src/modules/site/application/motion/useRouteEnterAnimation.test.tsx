import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { useRouteEnterAnimation } from './useRouteEnterAnimation'

function RouteEnterProbe({
  pathname,
  enabled = true,
}: {
  readonly pathname: string
  readonly enabled?: boolean
}): ReactElement {
  const ref = useRouteEnterAnimation(pathname, { enabled })
  return (
    <div ref={ref} data-testid="route-enter" className="app-route-content app-route-content--settled" />
  )
}

describe('useRouteEnterAnimation', () => {
  it('animates after leaving a route where the hook was initially disabled', () => {
    const { rerender, getByTestId } = render(<RouteEnterProbe pathname="/docs/getting-started" enabled={false} />)
    const element = getByTestId('route-enter')
    expect(element).not.toHaveClass('app-route-content--enter')

    rerender(<RouteEnterProbe pathname="/about" enabled={true} />)
    expect(element).toHaveClass('app-route-content--enter')
  })
})
