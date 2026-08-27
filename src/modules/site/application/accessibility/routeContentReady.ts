export function isMainRouteContentReady(mainContent: HTMLElement | null): boolean {
  if (mainContent === null) {
    return true
  }

  return mainContent.getAttribute('aria-busy') !== 'true'
}

export function whenMainRouteContentReady(onReady: () => void): () => void {
  const mainContent = document.getElementById('main-content')
  if (mainContent === null || isMainRouteContentReady(mainContent)) {
    onReady()
    return () => {}
  }

  const observer = new MutationObserver(() => {
    if (isMainRouteContentReady(document.getElementById('main-content'))) {
      observer.disconnect()
      onReady()
    }
  })

  observer.observe(mainContent, {
    attributes: true,
    attributeFilter: ['aria-busy'],
    childList: true,
    subtree: true,
  })

  return () => {
    observer.disconnect()
  }
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
