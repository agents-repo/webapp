import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  detectInstalledPwaState,
  detectNativeInstallPromptSupport,
  isBeforeInstallPromptEvent,
  resolvePwaInstallGuidance,
  runPwaInstallPrompt,
} from './pwaInstall'

describe('pwaInstall', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isBeforeInstallPromptEvent', () => {
    it('accepts events with prompt and userChoice', () => {
      const event = new Event('beforeinstallprompt') as Event & {
        prompt: () => Promise<void>
        userChoice: Promise<{ outcome: 'accepted'; platform: string }>
      }
      event.prompt = vi.fn().mockResolvedValue(undefined)
      event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })

      expect(isBeforeInstallPromptEvent(event)).toBe(true)
    })

    it('rejects plain events', () => {
      expect(isBeforeInstallPromptEvent(new Event('beforeinstallprompt'))).toBe(false)
    })
  })

  describe('detectInstalledPwaState', () => {
    it('returns true when display-mode is standalone', () => {
      expect(detectInstalledPwaState(true, false)).toBe(true)
    })

    it('returns true when iOS standalone flag is set', () => {
      expect(detectInstalledPwaState(false, true)).toBe(true)
    })

    it('returns false in a normal browser tab', () => {
      expect(detectInstalledPwaState(false, false)).toBe(false)
    })
  })

  describe('runPwaInstallPrompt', () => {
    it('returns unavailable when no deferred prompt exists', async () => {
      await expect(runPwaInstallPrompt(null)).resolves.toBe('unavailable')
    })

    it('returns accepted after the user installs', async () => {
      const installPromptEvent = new Event('beforeinstallprompt') as Event & {
        prompt: () => Promise<void>
        userChoice: Promise<{ outcome: 'accepted'; platform: string }>
      }
      installPromptEvent.prompt = vi.fn().mockResolvedValue(undefined)
      installPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })

      await expect(runPwaInstallPrompt(installPromptEvent)).resolves.toBe('accepted')
      expect(installPromptEvent.prompt).toHaveBeenCalledOnce()
    })

    it('returns dismissed when the user closes the prompt', async () => {
      const installPromptEvent = new Event('beforeinstallprompt') as Event & {
        prompt: () => Promise<void>
        userChoice: Promise<{ outcome: 'dismissed'; platform: string }>
      }
      installPromptEvent.prompt = vi.fn().mockResolvedValue(undefined)
      installPromptEvent.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })

      await expect(runPwaInstallPrompt(installPromptEvent)).resolves.toBe('dismissed')
      expect(installPromptEvent.prompt).toHaveBeenCalledOnce()
    })

    it('returns unavailable when prompt throws', async () => {
      const installPromptEvent = new Event('beforeinstallprompt') as Event & {
        prompt: () => Promise<void>
        userChoice: Promise<{ outcome: 'accepted'; platform: string }>
      }
      installPromptEvent.prompt = vi.fn().mockRejectedValue(new Error('prompt failed'))
      installPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })

      await expect(runPwaInstallPrompt(installPromptEvent)).resolves.toBe('unavailable')
    })
  })

  describe('detectNativeInstallPromptSupport', () => {
    it('is true when onbeforeinstallprompt exists on the target', () => {
      expect(detectNativeInstallPromptSupport({ onbeforeinstallprompt: null })).toBe(true)
    })

    it('is false when the target has no install prompt property', () => {
      expect(detectNativeInstallPromptSupport({})).toBe(false)
    })
  })

  describe('resolvePwaInstallGuidance', () => {
    it('prefers iOS Share over Firefox branding', () => {
      expect(
        resolvePwaInstallGuidance({
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/128.0 Mobile/15E148 Safari/605.1.15',
          maxTouchPoints: 5,
        }),
      ).toBe('ios-share')
    })

    it('treats iPadOS desktop-class Safari as iOS Share', () => {
      expect(
        resolvePwaInstallGuidance({
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
          maxTouchPoints: 5,
        }),
      ).toBe('ios-share')
    })

    it('resolves Firefox on Android', () => {
      expect(
        resolvePwaInstallGuidance({
          userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0',
          maxTouchPoints: 5,
        }),
      ).toBe('firefox-android')
    })

    it('resolves Firefox on desktop', () => {
      expect(
        resolvePwaInstallGuidance({
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
          maxTouchPoints: 0,
        }),
      ).toBe('firefox-desktop')
    })

    it('resolves Safari on macOS', () => {
      expect(
        resolvePwaInstallGuidance({
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
          maxTouchPoints: 0,
        }),
      ).toBe('safari-macos')
    })

    it('does not treat Chrome as Safari', () => {
      expect(
        resolvePwaInstallGuidance({
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          maxTouchPoints: 0,
        }),
      ).toBe('generic')
    })
  })
})
