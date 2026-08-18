import type { RegistryCatalog } from '../domain/package.ts'

let runtimePackageCatalog: RegistryCatalog | null = null
let runtimePackageCatalogResolved = false
let runtimeGithubRepositoryUrl = ''

export function shouldAwaitCatalogMembershipRecheck(options: {
  readonly catalog: RegistryCatalog | null
  readonly isLoading: boolean
  readonly hasCompletedForcedReload: boolean
  readonly isMember: boolean
}): boolean {
  if (options.isMember) {
    return false
  }

  if (options.isLoading) {
    return true
  }

  return options.catalog !== null && !options.hasCompletedForcedReload
}

export function isCatalogLoadAttemptResolved(
  isLoading: boolean,
  membershipRecheck?: {
    readonly catalog: RegistryCatalog | null
    readonly hasCompletedForcedReload: boolean
    readonly isMember: boolean
  },
): boolean {
  if (isLoading) {
    return false
  }

  if (!membershipRecheck) {
    return true
  }

  return !shouldAwaitCatalogMembershipRecheck({
    isLoading,
    ...membershipRecheck,
  })
}

export function setRuntimePackageCatalog(
  catalog: RegistryCatalog | null,
  options: { readonly resolved?: boolean; readonly githubRepositoryUrl?: string } = {},
): void {
  runtimePackageCatalog = catalog
  runtimePackageCatalogResolved = options.resolved ?? catalog !== null
  if (options.githubRepositoryUrl !== undefined) {
    runtimeGithubRepositoryUrl = options.githubRepositoryUrl
  }
}

export function getRuntimePackageCatalog(): RegistryCatalog | null {
  return runtimePackageCatalog
}

export function isRuntimePackageCatalogResolved(): boolean {
  return runtimePackageCatalogResolved
}

export function getRuntimeGithubRepositoryUrl(): string {
  return runtimeGithubRepositoryUrl
}

export function resetRuntimePackageCatalogForTests(): void {
  runtimePackageCatalog = null
  runtimePackageCatalogResolved = false
  runtimeGithubRepositoryUrl = ''
}
