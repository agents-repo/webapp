import { useEffect, useState } from 'react'

export function useStickySearch(threshold: number): boolean {
  const [stickySearch, setStickySearch] = useState(false)

  useEffect(() => {
    const updateStickyState = (): void => {
      const nextStickySearch = globalThis.window.scrollY > threshold
      setStickySearch((prev) => (prev === nextStickySearch ? prev : nextStickySearch))
    }

    updateStickyState()
    globalThis.window.addEventListener('scroll', updateStickyState, { passive: true })

    return () => {
      globalThis.window.removeEventListener('scroll', updateStickyState)
    }
  }, [threshold])

  return stickySearch
}
