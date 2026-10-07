export function prefersReducedMotion(): boolean {
  if (typeof globalThis.matchMedia !== 'function') {
    return false
  }

  return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
}
