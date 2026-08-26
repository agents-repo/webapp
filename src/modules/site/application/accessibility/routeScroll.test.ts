import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ROUTE_SCROLL_STORAGE_KEY,
  applyHashTargetScroll,
  applyWindowScroll,
  getLocationHashTargetId,
  getRouteScrollPosition,
  writeRouteScrollPosition,
} from './routeScroll'

describe('getLocationHashTargetId', () => {
  it('returns null for an empty or bare hash', () => {
    expect(getLocationHashTargetId('')).toBeNull()
    expect(getLocationHashTargetId('#')).toBeNull()
  })

  it('decodes the hash target id', () => {
    expect(getLocationHashTargetId('#section')).toBe('section')
    expect(getLocationHashTargetId('#main-content')).toBe('main-content')
    expect(getLocationHashTargetId('#heading%20one')).toBe('heading one')
  })
})

describe('route scroll positions', () => {
  afterEach(() => {
    sessionStorage.removeItem(ROUTE_SCROLL_STORAGE_KEY)
  })

  it('stores and reads a position for a history key', () => {
    writeRouteScrollPosition('abc', 420)

    expect(getRouteScrollPosition('abc')).toBe(420)
  })

  it('returns undefined when the key has not been saved', () => {
    expect(getRouteScrollPosition('missing')).toBeUndefined()
  })

  it('caps stored positions at 50 entries', () => {
    for (let index = 0; index < 51; index += 1) {
      writeRouteScrollPosition(`key-${index}`, index)
    }

    expect(getRouteScrollPosition('key-0')).toBeUndefined()
    expect(getRouteScrollPosition('key-1')).toBe(1)
    expect(getRouteScrollPosition('key-50')).toBe(50)
  })
})

describe('applyWindowScroll', () => {
  it('scrolls the window instantly', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    applyWindowScroll(240)

    expect(scrollTo).toHaveBeenCalledWith({ top: 240, left: 0, behavior: 'instant' })
    scrollTo.mockRestore()
  })
})

describe('applyHashTargetScroll', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('scrolls the matching element into view', () => {
    const target = document.createElement('section')
    target.id = 'section'
    document.body.append(target)
    const scrollIntoView = vi.fn()
    Object.defineProperty(target, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    applyHashTargetScroll('#section')

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' })
    expect(scrollTo).not.toHaveBeenCalled()
    scrollTo.mockRestore()
  })

  it('falls back to the top when the target is missing', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    applyHashTargetScroll('#missing')

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
    scrollTo.mockRestore()
  })
})
