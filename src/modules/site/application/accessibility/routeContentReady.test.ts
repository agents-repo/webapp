import { describe, expect, it } from 'vitest'
import {
  getRouteAnnouncementMessage,
  isMainRouteContentReady,
  isRouteLoadErrorVisible,
} from './routeContentReady'

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

describe('isRouteLoadErrorVisible', () => {
  it('returns true when main contains a route load error marker', () => {
    const main = document.createElement('main')
    const error = document.createElement('div')
    error.setAttribute('data-route-load-error', '')
    main.append(error)

    expect(isRouteLoadErrorVisible(main)).toBe(true)
  })

  it('returns false when main has no route load error marker', () => {
    const main = document.createElement('main')
    main.innerHTML = '<h1>About</h1>'

    expect(isRouteLoadErrorVisible(main)).toBe(false)
  })
})

describe('getRouteAnnouncementMessage', () => {
  it('announces navigation when route content loaded successfully', () => {
    const main = document.createElement('main')
    main.innerHTML = '<h1>About</h1>'

    expect(getRouteAnnouncementMessage('About', main)).toBe('Navigated to About')
  })

  it('announces load failure when route error fallback is visible', () => {
    const main = document.createElement('main')
    const error = document.createElement('div')
    error.setAttribute('data-route-load-error', '')
    main.append(error)

    expect(getRouteAnnouncementMessage('About', main)).toBe('Failed to load About')
  })
})
