import { useEffect } from 'react'
import { formatDocumentTitle } from './documentTitleFormat.ts'

export { formatDocumentTitle } from './documentTitleFormat.ts'

export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    const previousTitle = document.title
    document.title = formatDocumentTitle(pageTitle)

    return () => {
      document.title = previousTitle
    }
  }, [pageTitle])
}
