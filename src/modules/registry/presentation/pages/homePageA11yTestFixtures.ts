import type { RegistryCatalogLoadResult } from '../../infrastructure/registryRepository'
import { sampleRegistryCatalog } from '../../../../test/fixtures/sampleRegistryCatalog'

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
