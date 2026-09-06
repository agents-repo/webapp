import type { PackageDetailDocument } from '../domain/packageDetail'
import { abortError, settleWithCallerSignal } from './callerAbort'
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

const swallowOrphanedInflightRejection = (pending: Promise<PackageDetailDocument>): void => {
  void pending.catch(() => undefined)
}

export const invalidatePackageDetailLoads = (): void => {
  loadGeneration += 1
  for (const pending of inflightByCacheKey.values()) {
    swallowOrphanedInflightRejection(pending)
  }
  inflightByCacheKey.clear()
}

export const clearRegistryPackageDetailCache = async (): Promise<void> => {
  invalidatePackageDetailLoads()
  await clearPackageDetailStorage()
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
  const cached = await readFreshPackageDetailCache(cacheKey)

  if (cached) {
    return settleWithCallerSignal(cached, options.signal)
  }

  let pending = inflightByCacheKey.get(cacheKey)
  if (!pending) {
    if (options.signal?.aborted) {
      throw abortError()
    }

    const generation = loadGeneration
    pending = loadPackageDetailFromNetwork(detailUrl)
      .then(async (detail) => {
        if (generation === loadGeneration) {
          await writePackageDetailCache(cacheKey, detail)
        }
        return detail
      })
      .finally(() => {
        inflightByCacheKey.delete(cacheKey)
      })
    swallowOrphanedInflightRejection(pending)
    inflightByCacheKey.set(cacheKey, pending)
  }

  if (options.signal?.aborted) {
    throw abortError()
  }

  return settleWithCallerSignal(pending, options.signal)
}
