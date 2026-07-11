import { createContext, useContext } from 'react'

import type { RegistryCatalog } from '../domain/package'
import type { CatalogCacheState } from '../presentation/pages/homePageCatalogState'

export interface RegistryCatalogContextValue {
  readonly catalog: RegistryCatalog | null
  readonly cacheState: CatalogCacheState
  readonly indexUrl: string
  readonly registryBaseUrl: string
  readonly githubRepositoryUrl: string
  readonly errorMessage: string | null
  readonly isLoading: boolean
}

export const RegistryCatalogContext = createContext<RegistryCatalogContextValue | null>(null)

export function useRegistryCatalog(): RegistryCatalogContextValue {
  const context = useContext(RegistryCatalogContext)

  if (!context) {
    throw new Error('useRegistryCatalog must be used within RegistryCatalogProvider')
  }

  return context
}
