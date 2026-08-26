export function isMainRouteContentReady(mainContent: HTMLElement | null): boolean {
  return mainContent?.getAttribute('aria-busy') !== 'true'
}

export function whenMainRouteContentReady(onReady: () => void): () => void {
  const run = (): boolean => {
    if (!isMainRouteContentReady(document.getElementById('main-content'))) {
      return false
    }

    onReady()
    return true
  }

  if (run()) {
    return () => {}
  }

  const mainContent = document.getElementById('main-content')
  if (!mainContent) {
    return () => {}
  }

  const observer = new MutationObserver(() => {
    if (run()) {
      observer.disconnect()
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
