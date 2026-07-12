export function isMainRouteContentReady(mainContent: HTMLElement | null): boolean {
  return mainContent?.getAttribute('aria-busy') !== 'true'
}
