import type { RegistryCatalogContextValue } from '../../modules/registry/presentation/catalog/registryCatalogContext'
import type { RegistryCatalogLoadResult } from '../../modules/registry/infrastructure/registryRepository'
import { sampleRegistryCatalog } from './sampleRegistryCatalog'

export const sampleCatalogLoadResult: RegistryCatalogLoadResult = {
  catalog: sampleRegistryCatalog,
  cacheState: 'fresh',
  indexUrl: 'https://example.com/index.json',
  registryBaseUrl: 'https://example.com/registry',
  githubRepositoryUrl: 'https://github.com/agents-repo/registry',
  errorMessage: undefined,
  baseUrlRefResolution: null,
  githubRepositoryRefResolution: null,
}

export const loadedCatalogContext: RegistryCatalogContextValue = {
  catalog: sampleCatalogLoadResult.catalog,
  cacheState: sampleCatalogLoadResult.cacheState,
  indexUrl: sampleCatalogLoadResult.indexUrl,
  registryBaseUrl: sampleCatalogLoadResult.registryBaseUrl,
  githubRepositoryUrl: sampleCatalogLoadResult.githubRepositoryUrl ?? '',
  errorMessage: sampleCatalogLoadResult.errorMessage ?? null,
  isLoading: false,
}

export const loadingCatalogContext: RegistryCatalogContextValue = {
  catalog: null,
  cacheState: 'none',
  indexUrl: '',
  registryBaseUrl: '',
  githubRepositoryUrl: '',
  errorMessage: null,
  isLoading: true,
}

export const reloadingCatalogContext: RegistryCatalogContextValue = {
  ...loadedCatalogContext,
  isLoading: true,
}
