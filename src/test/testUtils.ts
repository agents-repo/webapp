import { resetRegistryCacheBackendsForTests } from '../modules/registry/infrastructure/indexedDbCacheBackend.ts'
import { resetChatInstructionsCacheForTests } from '../modules/registry/infrastructure/chatInstructionsCache.ts'
import { resetRegistryPackageDetailCacheForTests } from '../modules/registry/infrastructure/packageDetailCache.ts'
import { resetRegistryCatalogCacheForTests } from '../modules/registry/infrastructure/registryCatalogCache.ts'
import { clearRegistryTagListCache } from '../modules/registry/infrastructure/registryTagResolver.ts'

export function clearTestStorage(): void {
  localStorage.clear()
  sessionStorage.clear()
}

export async function resetRegistryMemoryCachesForTests(): Promise<void> {
  await Promise.all([
    resetRegistryCatalogCacheForTests(),
    resetRegistryPackageDetailCacheForTests(),
    clearRegistryTagListCache(),
    resetChatInstructionsCacheForTests(),
  ])
  await resetRegistryCacheBackendsForTests()
}
