import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_GTM_CONTAINER_ID,
  loadGoogleTagManager,
  resolveGtmContainerId,
} from './googleTagManager.ts'

describe('resolveGtmContainerId', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses VITE_GTM_ID when set', () => {
    vi.stubEnv('VITE_GTM_ID', 'GTM-TEST1234')
    expect(resolveGtmContainerId()).toBe('GTM-TEST1234')
  })

  it('falls back to default when env is unset', () => {
    vi.stubEnv('VITE_GTM_ID', '')
    expect(resolveGtmContainerId()).toBe(DEFAULT_GTM_CONTAINER_ID)
  })

  it('returns null when env value is invalid', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubEnv('VITE_GTM_ID', 'invalid')

    expect(resolveGtmContainerId()).toBeNull()
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })
})

describe('loadGoogleTagManager', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    vi.stubEnv('MODE', 'production')
  })

  afterEach(() => {
    document.head.innerHTML = ''
    vi.unstubAllEnvs()
  })

  it('does not load when MODE is not production', () => {
    vi.stubEnv('MODE', 'e2e')
    loadGoogleTagManager('GTM-TEST1234')
    expect(document.querySelector('script[data-gtm-id="GTM-TEST1234"]')).toBeNull()
  })

  it('injects GTM script once in production MODE', () => {
    loadGoogleTagManager('GTM-TEST1234')

    const script = document.querySelector('script[data-gtm-id="GTM-TEST1234"]')
    expect(script).not.toBeNull()
    expect(script?.textContent).toContain('googletagmanager.com/gtm.js')
    expect(script?.textContent).toContain('GTM-TEST1234')

    loadGoogleTagManager('GTM-TEST1234')
    expect(document.querySelectorAll('script[data-gtm-id="GTM-TEST1234"]')).toHaveLength(1)
  })

  it('does not load when VITE_GTM_ID is invalid', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubEnv('VITE_GTM_ID', 'invalid')

    loadGoogleTagManager()

    expect(document.querySelector('script[data-gtm-id]')).toBeNull()
    errorSpy.mockRestore()
  })

  it('does not load when an invalid container ID is passed directly', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    loadGoogleTagManager('not-a-gtm-id')

    expect(document.querySelector('script[data-gtm-id]')).toBeNull()
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
