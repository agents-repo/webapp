import { useEffect } from 'react'
import { formatDocumentTitle } from './documentTitleFormat.ts'

export { formatDocumentTitle } from './documentTitleFormat.ts'

/**
 * Sets `document.title` for the active view. Routed pages use `RouteDocumentTitle`
 * in the app shell instead; keep this hook for isolated views or tests that set
 * a title without restoring it on unmount.
 */
export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    document.title = formatDocumentTitle(pageTitle)
  }, [pageTitle])
}
