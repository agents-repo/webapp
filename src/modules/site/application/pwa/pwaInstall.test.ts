import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  detectInstalledPwaState,
  isBeforeInstallPromptEvent,
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
  })
})
