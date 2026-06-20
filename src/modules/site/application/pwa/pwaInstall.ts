export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type PwaInstallPromptOutcome = 'accepted' | 'dismissed' | 'unavailable'

export function isBeforeInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  return (
    'prompt' in event &&
    typeof (event as BeforeInstallPromptEvent).prompt === 'function' &&
    'userChoice' in event
  )
}

export function detectInstalledPwaState(displayModeStandalone: boolean, iosStandalone: boolean): boolean {
  return displayModeStandalone || iosStandalone
}

export function isRunningAsInstalledPwa(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return detectInstalledPwaState(
    window.matchMedia('(display-mode: standalone)').matches,
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true,
  )
}

export async function runPwaInstallPrompt(
  installPromptEvent: BeforeInstallPromptEvent | null,
): Promise<PwaInstallPromptOutcome> {
  if (!installPromptEvent) {
    return 'unavailable'
  }

  await installPromptEvent.prompt()
  const { outcome } = await installPromptEvent.userChoice

  if (outcome !== 'accepted' && outcome !== 'dismissed') {
    return 'unavailable'
  }

  return outcome
}
