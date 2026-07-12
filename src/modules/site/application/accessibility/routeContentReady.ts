export function isMainRouteContentReady(mainContent: HTMLElement | null): boolean {
  return mainContent?.getAttribute('aria-busy') !== 'true'
}

export function isRouteLoadErrorVisible(mainContent: HTMLElement | null): boolean {
  return mainContent?.querySelector('[data-route-load-error]') !== null
}

export function getRouteAnnouncementMessage(
  routeLabel: string,
  mainContent: HTMLElement | null,
): string {
  if (isRouteLoadErrorVisible(mainContent)) {
    return `Failed to load ${routeLabel}`
  }

  return `Navigated to ${routeLabel}`
}
