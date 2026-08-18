import type { RegistryCatalog } from '../domain/package.ts'

let runtimePackageCatalog: RegistryCatalog | null = null
let runtimePackageCatalogResolved = false
let runtimeGithubRepositoryUrl = ''

export function isCatalogLoadAttemptResolved(isLoading: boolean): boolean {
  return !isLoading
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
