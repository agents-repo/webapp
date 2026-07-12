import { describe, expect, it } from 'vitest'
import { isMainRouteContentReady } from './routeContentReady'

describe('isMainRouteContentReady', () => {
  it('returns false when main is marked busy', () => {
    const main = document.createElement('main')
    main.setAttribute('aria-busy', 'true')

    expect(isMainRouteContentReady(main)).toBe(false)
  })

  it('returns true when main is not busy', () => {
    const main = document.createElement('main')

    expect(isMainRouteContentReady(main)).toBe(true)
  })
})
