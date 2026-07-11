import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { formatCatalogUpdatedAt } from './registrySelectors'
import type { RegistryCatalog } from '../domain/package'
import {
  loadRegistryCatalog,
  type RegistryCatalogLoadResult,
} from '../infrastructure/registryRepository'
import {
  getCatalogStatusTag,
  type CatalogCacheState,
} from '../presentation/pages/homePageCatalogState'
import type { RegistryCatalogStatusNote } from '../../site/application/websiteSettings/registryCatalogStatusNote'
import { RegistryCatalogContext, type RegistryCatalogContextValue } from './registryCatalogContext'

interface RegistryCatalogProviderProps {
  readonly children: ReactNode
  readonly registrySettingsVersion: number
  readonly onCatalogStatusNoteChange: (note: RegistryCatalogStatusNote | null) => void
}

const applyCatalogLoadResult = (
  result: RegistryCatalogLoadResult,
  setters: {
    setCatalog: (catalog: RegistryCatalog | null) => void
    setCacheState: (cacheState: CatalogCacheState) => void
    setIndexUrl: (indexUrl: string) => void
    setRegistryBaseUrl: (registryBaseUrl: string) => void
    setGithubRepositoryUrl: (githubRepositoryUrl: string) => void
    setErrorMessage: (errorMessage: string | null) => void
  },
  onCatalogStatusNoteChange: (note: RegistryCatalogStatusNote | null) => void,
): void => {
  setters.setCatalog(result.catalog)
  setters.setCacheState(result.cacheState)
  setters.setIndexUrl(result.indexUrl)
  setters.setRegistryBaseUrl(result.registryBaseUrl)
  setters.setGithubRepositoryUrl(result.githubRepositoryUrl ?? '')
  setters.setErrorMessage(result.errorMessage ?? null)

  const noteStatusTag = getCatalogStatusTag({
    catalog: result.catalog,
    cacheState: result.cacheState,
    isLoading: false,
    errorMessage: result.errorMessage ?? null,
  })

  onCatalogStatusNoteChange({
    summaryText: result.catalog
      ? `Updated ${formatCatalogUpdatedAt(result.catalog.updatedAt)} with ${result.catalog.packages.length} packages from `
      : 'Registry catalog unavailable from ',
    sourceUrl: result.indexUrl,
    statusTag: noteStatusTag,
    baseUrlRefResolution: result.baseUrlRefResolution ?? null,
    githubRepositoryRefResolution: result.githubRepositoryRefResolution ?? null,
  })

  if (result.errorMessage) {
    console.warn('Registry catalog loading fallback triggered:', result.errorMessage)
  }
}

function RegistryCatalogProvider({
  children,
  registrySettingsVersion,
  onCatalogStatusNoteChange,
}: RegistryCatalogProviderProps) {
  const [catalog, setCatalog] = useState<RegistryCatalog | null>(null)
  const [cacheState, setCacheState] = useState<CatalogCacheState>('none')
  const [indexUrl, setIndexUrl] = useState('')
  const [registryBaseUrl, setRegistryBaseUrl] = useState('')
  const [githubRepositoryUrl, setGithubRepositoryUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const abortController = new AbortController()
    let isActive = true

    const loadCatalog = async (): Promise<void> => {
      setIsLoading(true)

      try {
        const isSettingsReload = registrySettingsVersion > 0
        const result = await loadRegistryCatalog({
          signal: abortController.signal,
          ...(isSettingsReload
            ? { forceSourceResolution: true, bypassTagCache: true }
            : {}),
        })

        if (!isActive) {
          return
        }

        applyCatalogLoadResult(
          result,
          {
            setCatalog,
            setCacheState,
            setIndexUrl,
            setRegistryBaseUrl,
            setGithubRepositoryUrl,
            setErrorMessage,
          },
          onCatalogStatusNoteChange,
        )
      } catch (error) {
        if (!isActive) {
          return
        }

        const failureMessage =
          error instanceof Error ? error.message : 'Unknown registry catalog loading error'

        applyCatalogLoadResult(
          {
            catalog: null,
            indexUrl: '',
            registryBaseUrl: '',
            cacheState: 'none',
            errorMessage: failureMessage,
          },
          {
            setCatalog,
            setCacheState,
            setIndexUrl,
            setRegistryBaseUrl,
            setGithubRepositoryUrl,
            setErrorMessage,
          },
          onCatalogStatusNoteChange,
        )
        console.warn('Registry catalog load failed:', error)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadCatalog()

    return () => {
      isActive = false
      abortController.abort()
    }
  }, [onCatalogStatusNoteChange, registrySettingsVersion])

  const value = useMemo<RegistryCatalogContextValue>(
    () => ({
      catalog,
      cacheState,
      indexUrl,
      registryBaseUrl,
      githubRepositoryUrl,
      errorMessage,
      isLoading,
    }),
    [cacheState, catalog, errorMessage, githubRepositoryUrl, indexUrl, isLoading, registryBaseUrl],
  )

  return <RegistryCatalogContext.Provider value={value}>{children}</RegistryCatalogContext.Provider>
}

export default RegistryCatalogProvider
