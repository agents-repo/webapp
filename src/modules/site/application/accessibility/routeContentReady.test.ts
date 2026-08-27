import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  getRouteAnnouncementMessage,
  isMainRouteContentReady,
  isRouteLoadErrorVisible,
  whenMainRouteContentReady,
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

  it('returns true when main is missing', () => {
    expect(isMainRouteContentReady(null)).toBe(true)
  })
})

describe('whenMainRouteContentReady', () => {
  it('runs immediately when main is already ready', () => {
    const main = document.createElement('main')
    main.id = 'main-content'
    document.body.append(main)
    const onReady = vi.fn()

    try {
      const stop = whenMainRouteContentReady(onReady)
      expect(onReady).toHaveBeenCalledTimes(1)
      stop()
    } finally {
      main.remove()
    }
  })

  it('waits until aria-busy is cleared', async () => {
    const main = document.createElement('main')
    main.id = 'main-content'
    main.setAttribute('aria-busy', 'true')
    document.body.append(main)
    const onReady = vi.fn()

    try {
      const stop = whenMainRouteContentReady(onReady)
      expect(onReady).not.toHaveBeenCalled()

      main.removeAttribute('aria-busy')

      await waitFor(() => {
        expect(onReady).toHaveBeenCalledTimes(1)
      })
      stop()
    } finally {
      main.remove()
    }
  })

  it('runs immediately when #main-content is missing', () => {
    const onReady = vi.fn()

    const stop = whenMainRouteContentReady(onReady)

    expect(onReady).toHaveBeenCalledTimes(1)
    stop()
  })
})

describe('isRouteLoadErrorVisible', () => {
  it('returns true when main contains a route load error marker', () => {
    const main = document.createElement('main')
    const error = document.createElement('div')
    error.dataset.routeLoadError = ''
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
    error.dataset.routeLoadError = ''
    main.append(error)

    expect(getRouteAnnouncementMessage('About', main)).toBe('Failed to load About')
  })
})
