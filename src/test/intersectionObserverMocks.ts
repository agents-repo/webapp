function createIntersectingEntry(target: Element): IntersectionObserverEntry {
  const rect = target.getBoundingClientRect()

  return {
    isIntersecting: true,
    target,
    intersectionRatio: 1,
    boundingClientRect: rect,
    intersectionRect: rect,
    rootBounds: null,
    time: Date.now(),
  }
}

const intersectionObserverStubFields = {
  root: null as Element | Document | null,
  rootMargin: '0px',
  scrollMargin: '0px',
  thresholds: [] as readonly number[],
}

/**
 * Vitest stub that reports every observed target as intersecting immediately.
 * Registered globally in `src/test/setup.ts`.
 */
export class ImmediateIntersectionObserver implements IntersectionObserver {
  readonly root = intersectionObserverStubFields.root

  readonly rootMargin = intersectionObserverStubFields.rootMargin

  readonly scrollMargin = intersectionObserverStubFields.scrollMargin

  readonly thresholds = intersectionObserverStubFields.thresholds

  private readonly callback: IntersectionObserverCallback

  private readonly observedTargets = new Set<Element>()

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element): void {
    this.observedTargets.add(target)
    this.callback([createIntersectingEntry(target)], this)
  }

  unobserve(target: Element): void {
    this.observedTargets.delete(target)
  }

  disconnect(): void {
    this.observedTargets.clear()
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

/**
 * Vitest stub that never invokes the callback — use when testing pre-intersection UI.
 */
export class PendingIntersectionObserver implements IntersectionObserver {
  readonly root = intersectionObserverStubFields.root

  readonly rootMargin = intersectionObserverStubFields.rootMargin

  readonly scrollMargin = intersectionObserverStubFields.scrollMargin

  readonly thresholds = intersectionObserverStubFields.thresholds

  private readonly observedTargets = new Set<Element>()

  observe(target: Element): void {
    this.observedTargets.add(target)
  }

  unobserve(target: Element): void {
    this.observedTargets.delete(target)
  }

  disconnect(): void {
    this.observedTargets.clear()
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}
