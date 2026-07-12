import { useEffect } from 'react'
import { formatDocumentTitle } from './documentTitleFormat.ts'

export { formatDocumentTitle } from './documentTitleFormat.ts'

export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    document.title = formatDocumentTitle(pageTitle)
  }, [pageTitle])
}
