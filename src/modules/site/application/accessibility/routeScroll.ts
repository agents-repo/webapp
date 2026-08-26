export const ROUTE_SCROLL_STORAGE_KEY = 'agents-repo-webapp-route-scroll'
const MAX_STORED_POSITIONS = 50

const INSTANT_SCROLL_BEHAVIOR = 'instant' satisfies ScrollBehavior

function readRouteScrollPositions(): Record<string, number> {
  try {
    const raw = globalThis.sessionStorage.getItem(ROUTE_SCROLL_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    const positions: Record<string, number> = {}
    for (const [historyKey, top] of Object.entries(parsed)) {
      if (typeof top === 'number' && Number.isFinite(top)) {
        positions[historyKey] = top
      }
    }

    return positions
  } catch {
    return {}
  }
}

function persistRouteScrollPositions(positions: Record<string, number>): void {
  try {
    globalThis.sessionStorage.setItem(ROUTE_SCROLL_STORAGE_KEY, JSON.stringify(positions))
  } catch {
    // Ignore quota or private-mode failures; in-memory navigation still works for the tab.
  }
}

export function getRouteScrollPosition(historyKey: string): number | undefined {
  return readRouteScrollPositions()[historyKey]
}

export function writeRouteScrollPosition(historyKey: string, top: number): void {
  const positions = readRouteScrollPositions()
  if (Object.hasOwn(positions, historyKey)) {
    delete positions[historyKey]
  }

  positions[historyKey] = Math.max(0, Math.round(top))

  const extraCount = Object.keys(positions).length - MAX_STORED_POSITIONS
  if (extraCount > 0) {
    for (const key of Object.keys(positions).slice(0, extraCount)) {
      delete positions[key]
    }
  }

  persistRouteScrollPositions(positions)
}

export function getLocationHashTargetId(hash: string): string | null {
  if (!hash.startsWith('#') || hash.length < 2) {
    return null
  }

  const raw = hash.slice(1)
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export function applyWindowScroll(top: number): void {
  globalThis.window.scrollTo({
    top,
    left: 0,
    behavior: INSTANT_SCROLL_BEHAVIOR,
  })
}

export function applyHashTargetScroll(hash: string): void {
  const targetId = getLocationHashTargetId(hash)
  const target = targetId === null ? null : document.getElementById(targetId)
  if (target && typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ block: 'start', behavior: INSTANT_SCROLL_BEHAVIOR })
    return
  }

  applyWindowScroll(0)
}
