import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import type { CatalogCacheState } from '../../application/catalogCacheState'
import { formatCatalogUpdatedAt } from '../../application/registrySelectors'
import {
  isCatalogLoadAttemptResolved,
  setRuntimePackageCatalog,
} from '../../application/runtimePackageCatalog'
import type { RegistryCatalog } from '../../domain/package'
import {
  loadRegistryCatalog,
  type RegistryCatalogLoadResult,
} from '../../infrastructure/registryRepository'
import type { RegistryCatalogStatusNote } from '../../../site/application/websiteSettings/registryCatalogStatusNote'
import { getCatalogStatusTag } from '../pages/homePageCatalogState'
import { RegistryCatalogContext, type RegistryCatalogContextValue } from './registryCatalogContext'

interface RegistryCatalogProviderProps {
  readonly children: ReactNode
  readonly registrySettingsVersion: number
  readonly onCatalogStatusNoteChange: (note: RegistryCatalogStatusNote | null) => void
}

const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException && error.name === 'AbortError'
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

  if (result.errorMessage && result.catalog) {
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
  const [hasCompletedForcedReload, setHasCompletedForcedReload] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const inFlightRef = useRef<{ readonly promise: Promise<void>; readonly force: boolean } | null>(null)

  const runCatalogLoad = useCallback(
    (force: boolean): Promise<void> => {
      const inFlight = inFlightRef.current
      if (inFlight?.force && force) {
        return inFlight.promise
      }

      abortControllerRef.current?.abort()
      const abortController = new AbortController()
      abortControllerRef.current = abortController
      setIsLoading(true)

      const promise = (async () => {
        try {
          const result = await loadRegistryCatalog({
            signal: abortController.signal,
            ...(force ? { forceSourceResolution: true, bypassTagCache: true } : {}),
          })

          if (abortController.signal.aborted) {
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
          setHasCompletedForcedReload(force)
        } catch (error) {
          if (abortController.signal.aborted || isAbortError(error)) {
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
          setHasCompletedForcedReload(force)
          console.warn('Registry catalog load failed:', error)
        } finally {
          if (abortControllerRef.current === abortController) {
            inFlightRef.current = null
            if (!abortController.signal.aborted) {
              setIsLoading(false)
            }
          }
        }
      })()

      inFlightRef.current = { promise, force }
      return promise
    },
    [onCatalogStatusNoteChange],
  )

  const reloadCatalog = useCallback((): Promise<void> => {
    return runCatalogLoad(true)
  }, [runCatalogLoad])

  useEffect(() => {
    void runCatalogLoad(registrySettingsVersion > 0)

    return () => {
      abortControllerRef.current?.abort()
      inFlightRef.current = null
    }
  }, [registrySettingsVersion, runCatalogLoad])

  useLayoutEffect(() => {
    setRuntimePackageCatalog(catalog, {
      resolved: isCatalogLoadAttemptResolved(isLoading),
      githubRepositoryUrl,
    })
  }, [catalog, githubRepositoryUrl, isLoading])

  const value = useMemo<RegistryCatalogContextValue>(
    () => ({
      catalog,
      cacheState,
      indexUrl,
      registryBaseUrl,
      githubRepositoryUrl,
      errorMessage,
      isLoading,
      hasCompletedForcedReload,
      reloadCatalog,
    }),
    [
      cacheState,
      catalog,
      errorMessage,
      githubRepositoryUrl,
      hasCompletedForcedReload,
      indexUrl,
      isLoading,
      registryBaseUrl,
      reloadCatalog,
    ],
  )

  return <RegistryCatalogContext.Provider value={value}>{children}</RegistryCatalogContext.Provider>
}

export default RegistryCatalogProvider
