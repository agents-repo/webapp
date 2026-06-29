import { useEffect } from 'react'

const siteName = 'Agents Repo'

export function formatDocumentTitle(pageTitle: string): string {
  return `${pageTitle} — ${siteName}`
}

export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    const previousTitle = document.title
    document.title = formatDocumentTitle(pageTitle)

    return () => {
      document.title = previousTitle
    }
  }, [pageTitle])
}
