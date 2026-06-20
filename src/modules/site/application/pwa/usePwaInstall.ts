import { useCallback, useEffect, useState } from 'react'
import {
  isBeforeInstallPromptEvent,
  isRunningAsInstalledPwa,
  runPwaInstallPrompt,
  type BeforeInstallPromptEvent,
  type PwaInstallPromptOutcome,
} from './pwaInstall'

export function usePwaInstall() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => isRunningAsInstalledPwa())
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    if (isRunningAsInstalledPwa()) {
      return
    }

    const handleBeforeInstallPrompt = (event: Event): void => {
      if (!isBeforeInstallPromptEvent(event)) {
        return
      }

      event.preventDefault()
      setInstallPromptEvent(event)
    }

    const handleAppInstalled = (): void => {
      setInstallPromptEvent(null)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<PwaInstallPromptOutcome> => {
    const deferredPrompt = installPromptEvent

    setIsInstalling(true)

    try {
      const outcome = await runPwaInstallPrompt(deferredPrompt)

      // prompt() consumes the deferred beforeinstallprompt event; drop it so we
      // do not offer install again until the browser fires a new one.
      if (deferredPrompt) {
        setInstallPromptEvent(null)
      }

      if (outcome === 'accepted') {
        setIsInstalled(true)
      }

      return outcome
    } finally {
      setIsInstalling(false)
    }
  }, [installPromptEvent])

  return {
    canInstall: installPromptEvent !== null && !isInstalled,
    isInstalling,
    promptInstall,
  }
}
