import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { loadEnv } from 'vite'
import { searchableCatalog } from '../e2e/fixtures/catalog.ts'
import { buildPackageSiteRoutesFromCatalog } from '../src/modules/registry/application/packageSiteRoutes.ts'
import { isRegistryCatalog } from '../src/modules/registry/infrastructure/registryCatalogValidation.ts'
import {
  buildRegistryIndexUrl,
  DEFAULT_REGISTRY_GITHUB_REPOSITORY_URL,
  DEFAULT_REGISTRY_INDEX_PATH,
  DEFAULT_REGISTRY_SOURCE_URL,
  normalizeRegistryBaseUrl,
} from '../src/modules/registry/infrastructure/registrySourceUrl.ts'
import {
  extractMajorVersionLineAliasFromSourceUrl,
  inferRegistryRepositoryIdentity,
  substituteRegistryRef,
} from '../src/modules/registry/infrastructure/registryMajorVersionRef.ts'
import { resolveLatestStableTagForMajorVersion } from '../src/modules/registry/infrastructure/registryTagResolver.ts'
import { GENERATED_PACKAGE_SITE_CATALOG_PATH, GENERATED_PACKAGE_SITE_ROUTES_PATH } from './package-site-routes-path.ts'

export function parsePrefetchModeArg(argv = process.argv, env = process.env) {
  const modeIndex = argv.indexOf('--mode')
  if (modeIndex === -1) {
    return env.MODE ?? 'production'
  }

  const mode = argv[modeIndex + 1]
  if (!mode) {
    throw new Error('Missing value for --mode')
  }

  return mode
}

export function resolveConfiguredIndexUrl(mode, options = {}) {
  const envLoader = options.loadEnv ?? loadEnv
  const env = envLoader(mode, process.cwd(), 'VITE_')
  const sourceUrl = env.VITE_REGISTRY_REPOSITORY_URL?.trim() || DEFAULT_REGISTRY_SOURCE_URL
  const configuredBaseUrl = env.VITE_REGISTRY_BASE_URL?.trim() || sourceUrl
  const indexPath = env.VITE_REGISTRY_INDEX_PATH?.trim() || DEFAULT_REGISTRY_INDEX_PATH
  const githubRepositoryUrl =
    env.VITE_REGISTRY_GITHUB_REPOSITORY_URL?.trim() || DEFAULT_REGISTRY_GITHUB_REPOSITORY_URL
  const baseUrl = normalizeRegistryBaseUrl(configuredBaseUrl)

  return {
    baseUrl,
    indexPath,
    githubRepositoryUrl,
    indexUrl: buildRegistryIndexUrl(baseUrl, indexPath),
  }
}

export async function resolveProductionIndexUrl(mode, options = {}) {
  const configured = resolveConfiguredIndexUrl(mode, options)
  const alias = extractMajorVersionLineAliasFromSourceUrl(configured.baseUrl)

  if (!alias) {
    return configured.indexUrl
  }

  const identity = inferRegistryRepositoryIdentity(configured.baseUrl, configured.githubRepositoryUrl)
  if (!identity) {
    throw new Error('Could not infer a GitHub repository for major-version line ref resolution.')
  }

  const resolvedRef = await resolveLatestStableTagForMajorVersion(identity.owner, identity.repo, alias.major, {
    sourceUrl: configured.baseUrl,
    fallbackRepositoryUrl: configured.githubRepositoryUrl,
  })
  const resolvedBaseUrl = normalizeRegistryBaseUrl(substituteRegistryRef(configured.baseUrl, resolvedRef))
  return buildRegistryIndexUrl(resolvedBaseUrl, configured.indexPath)
}

export async function loadProductionCatalog(indexUrl, fetchImpl = fetch) {
  const response = await fetchImpl(indexUrl, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch registry index for package sitemap routes (${response.status} ${response.statusText}) from ${indexUrl}`,
    )
  }

  const payload = await response.json()
  if (!isRegistryCatalog(payload)) {
    throw new Error(`Registry index at ${indexUrl} does not match the expected catalog schema`)
  }

  return payload
}

export async function loadPackageSiteCatalogForBuild(mode, options = {}) {
  if (mode === 'e2e') {
    return searchableCatalog
  }

  return loadProductionCatalog(await resolveProductionIndexUrl(mode, options), options.fetch)
}

export function writePackageSiteBuildSnapshot(catalog) {
  const routes = buildPackageSiteRoutesFromCatalog(catalog)
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- generated path is a repo-relative constant
  mkdirSync(dirname(GENERATED_PACKAGE_SITE_ROUTES_PATH), { recursive: true })
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- generated path is a repo-relative constant
  writeFileSync(GENERATED_PACKAGE_SITE_ROUTES_PATH, `${JSON.stringify(routes, null, 2)}\n`)
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- generated path is a repo-relative constant
  writeFileSync(GENERATED_PACKAGE_SITE_CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`)
  return routes
}
