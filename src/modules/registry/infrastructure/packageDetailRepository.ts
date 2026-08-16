import type { PackageDetailDocument } from '../domain/packageDetail'
import { settleWithCallerSignal } from './callerAbort'
import {
  buildPackageDetailCacheKey,
  clearRegistryPackageDetailCache as clearPackageDetailStorage,
  readFreshPackageDetailCache,
  writePackageDetailCache,
} from './packageDetailCache'
import { isPackageDetailDocument } from './packageDetailValidation'
import { buildRegistryPackageDetailUrl } from './registrySourceUrl'

const inflightByCacheKey = new Map<string, Promise<PackageDetailDocument>>()
let loadGeneration = 0

export const invalidatePackageDetailLoads = (): void => {
  loadGeneration += 1
  inflightByCacheKey.clear()
}

export const clearRegistryPackageDetailCache = (): void => {
  invalidatePackageDetailLoads()
  clearPackageDetailStorage()
}

export const resetPackageDetailRepositoryForTests = (): void => {
  invalidatePackageDetailLoads()
}

const loadPackageDetailFromNetwork = async (detailUrl: string): Promise<PackageDetailDocument> => {
  const response = await fetch(detailUrl, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Unable to load package detail (${response.status} ${response.statusText})`)
  }

  const payload: unknown = await response.json()

  if (!isPackageDetailDocument(payload)) {
    throw new Error('Package detail response does not match the expected schema')
  }

  return payload
}

export const loadPackageDetail = async (options: {
  readonly registryBaseUrl: string
  readonly namespace: string
  readonly packageId: string
  readonly latest: string
  readonly signal?: AbortSignal
}): Promise<PackageDetailDocument> => {
  const detailUrl = buildRegistryPackageDetailUrl(
    options.registryBaseUrl,
    options.namespace,
    options.packageId,
  )
  const cacheKey = buildPackageDetailCacheKey(
    detailUrl,
    `${options.namespace}/${options.packageId}`,
    options.latest,
  )
  const cached = readFreshPackageDetailCache(cacheKey)

  if (cached) {
    return settleWithCallerSignal(cached, options.signal)
  }

  let pending = inflightByCacheKey.get(cacheKey)
  if (!pending) {
    const generation = loadGeneration
    pending = loadPackageDetailFromNetwork(detailUrl)
      .then((detail) => {
        if (generation === loadGeneration) {
          writePackageDetailCache(cacheKey, detail)
        }
        return detail
      })
      .finally(() => {
        inflightByCacheKey.delete(cacheKey)
      })
    inflightByCacheKey.set(cacheKey, pending)
  }

  return settleWithCallerSignal(pending, options.signal)
}
