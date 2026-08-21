export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type PwaInstallPromptOutcome = 'accepted' | 'dismissed' | 'unavailable'

export type PwaInstallGuidanceKind =
  | 'ios-share'
  | 'firefox-android'
  | 'firefox-desktop'
  | 'safari-macos'
  | 'generic'

export interface PwaInstallGuidanceSnapshot {
  readonly userAgent: string
  readonly maxTouchPoints: number
}

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

export function detectNativeInstallPromptSupport(target: object | undefined = globalThis.window): boolean {
  return target != null && 'onbeforeinstallprompt' in target
}

export function resolvePwaInstallGuidance(snapshot: PwaInstallGuidanceSnapshot): PwaInstallGuidanceKind {
  const userAgent = snapshot.userAgent
  const isIosDevice =
    /iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && snapshot.maxTouchPoints > 1)

  if (isIosDevice) {
    return 'ios-share'
  }

  const isFirefox = /Firefox/i.test(userAgent)
  const isAndroid = /Android/i.test(userAgent)

  if (isFirefox && isAndroid) {
    return 'firefox-android'
  }

  if (isFirefox) {
    return 'firefox-desktop'
  }

  const isSafariMacos =
    /Safari/i.test(userAgent) && !/Chrome|Chromium|CriOS|Edg|OPR|Android/i.test(userAgent)

  if (isSafariMacos) {
    return 'safari-macos'
  }

  return 'generic'
}

export async function runPwaInstallPrompt(
  installPromptEvent: BeforeInstallPromptEvent | null,
): Promise<PwaInstallPromptOutcome> {
  if (!installPromptEvent) {
    return 'unavailable'
  }

  try {
    await installPromptEvent.prompt()
    const { outcome } = await installPromptEvent.userChoice

    if (outcome !== 'accepted' && outcome !== 'dismissed') {
      return 'unavailable'
    }

    return outcome
  } catch {
    return 'unavailable'
  }
}
