import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { sampleAgentPackageDetail } from '../e2e/fixtures/package-detail.ts'
import { buildRegistryPackageDetailUrl } from '../src/modules/registry/infrastructure/registrySourceUrl.ts'
import { isRegistryCatalog } from '../src/modules/registry/infrastructure/registryCatalogValidation.ts'
import { readGeneratedPackageSiteCatalog } from './seo-build-config.ts'
import { GENERATED_PACKAGE_SITE_DETAILS_PATH } from './package-site-routes-path.ts'
import {
  loadPackageSiteCatalogForBuild,
  resolveProductionBaseUrl,
} from './prefetch-package-site-routes-lib.mjs'

const DEFAULT_CONCURRENCY = 10

function packageDetailKey(namespace, packageId) {
  return `${namespace}/${packageId}`
}

async function forEachWithConcurrency(items, concurrency, worker) {
  let nextIndex = 0

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      await worker(items[currentIndex], currentIndex)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()),
  )
}

function isValidPackageDetailEntry(entry) {
  return (
    entry &&
    typeof entry === 'object' &&
    typeof entry.name === 'string' &&
    typeof entry.description === 'string'
  )
}

function isMinimalPackageDetail(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.package === 'string' &&
    typeof value.version === 'string' &&
    value.metadata &&
    typeof value.metadata === 'object' &&
    typeof value.metadata.name === 'string' &&
    typeof value.metadata.description === 'string' &&
    (value.readmeMarkdown === undefined || typeof value.readmeMarkdown === 'string') &&
    Array.isArray(value.agents) &&
    value.agents.every(isValidPackageDetailEntry) &&
    Array.isArray(value.flows) &&
    value.flows.every(isValidPackageDetailEntry)
  )
}

async function fetchPackageDetail(detailUrl, fetchImpl = fetch) {
  const response = await fetchImpl(detailUrl, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch package detail (${response.status} ${response.statusText}) from ${detailUrl}`,
    )
  }

  const payload = await response.json()
  if (!isMinimalPackageDetail(payload)) {
    throw new Error(`Package detail at ${detailUrl} does not match the expected schema`)
  }

  return payload
}

function readValidatedGeneratedCatalog() {
  const catalog = readGeneratedPackageSiteCatalog()
  if (catalog === null) {
    return null
  }

  if (!isRegistryCatalog(catalog)) {
    throw new Error(
      'scripts/.generated/package-site-catalog.json does not match the expected catalog schema',
    )
  }

  return catalog
}

export async function loadPackageDetailsForBuild(mode, options = {}) {
  const catalog =
    options.catalog ??
    readValidatedGeneratedCatalog() ??
    await loadPackageSiteCatalogForBuild(mode, options)
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY

  if (mode === 'e2e') {
    const details = {}
    for (const pkg of catalog.packages) {
      details[packageDetailKey(pkg.namespace, pkg.package)] = sampleAgentPackageDetail
    }
    return details
  }

  const registryBaseUrl = await resolveProductionBaseUrl(mode, options)
  const details = {}

  await forEachWithConcurrency(catalog.packages, concurrency, async (pkg) => {
    const detailUrl = buildRegistryPackageDetailUrl(
      registryBaseUrl,
      pkg.namespace,
      pkg.package,
    )
    const detail = await fetchPackageDetail(detailUrl, options.fetch)
    details[packageDetailKey(pkg.namespace, pkg.package)] = detail
  })

  return details
}

export function writePackageSiteDetailsSnapshot(details) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- generated path is a repo-relative constant
  mkdirSync(dirname(GENERATED_PACKAGE_SITE_DETAILS_PATH), { recursive: true })
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- generated path is a repo-relative constant
  writeFileSync(GENERATED_PACKAGE_SITE_DETAILS_PATH, `${JSON.stringify(details, null, 2)}\n`)
  return details
}
