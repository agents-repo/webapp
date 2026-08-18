import { useEffect } from 'react'

import { useRegistryCatalog } from './registryCatalogContext'

export function useCatalogMembershipRecheck(options: {
  readonly enabled: boolean
  readonly isMember: boolean
}): void {
  const { catalog, isLoading, hasCompletedForcedReload, reloadCatalog } = useRegistryCatalog()

  useEffect(() => {
    if (!options.enabled || isLoading || catalog === null || options.isMember || hasCompletedForcedReload) {
      return
    }

    void reloadCatalog()
  }, [
    catalog,
    hasCompletedForcedReload,
    isLoading,
    options.enabled,
    options.isMember,
    reloadCatalog,
  ])
}
