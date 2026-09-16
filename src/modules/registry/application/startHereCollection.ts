import type { RegistryPackage } from '../domain/package'

export const START_HERE_COLLECTION_ID = 'start-here'

export const PACKAGE_CATALOG_COLLECTION_PARAM = 'collection'

/**
 * Curated beginner-friendly packages from the live registry catalog.
 * Proposed from agents-repo/registry main index; review in draft PR before merge.
 */
export const START_HERE_PACKAGE_REFS: readonly string[] = [
  'agents-repo/hello-agent',
  'agents-repo/agents-repo-package-creation',
  'maiconfz/feature-exploration-planner',
  'maiconfz/github-interactive-issue-implementation-planner',
  'maiconfz/ai-first-project-readiness',
]

export function parsePackageCatalogCollection(searchParams: URLSearchParams): string | null {
  const value = (searchParams.get(PACKAGE_CATALOG_COLLECTION_PARAM) ?? '').trim()
  return value.length > 0 ? value : null
}

export function isStartHereCollection(collection: string | null): boolean {
  return collection === START_HERE_COLLECTION_ID
}

export function selectStartHerePackages(
  packages: readonly RegistryPackage[],
  refs: readonly string[] = START_HERE_PACKAGE_REFS,
): RegistryPackage[] {
  const packageById = new Map<string, RegistryPackage>()

  for (const pkg of packages) {
    if (pkg.status === 'yanked') {
      continue
    }

    packageById.set(pkg.id, pkg)
  }

  const selected: RegistryPackage[] = []

  for (const ref of refs) {
    const pkg = packageById.get(ref)
    if (pkg) {
      selected.push(pkg)
    }
  }

  return selected
}

export function restrictPackagesToCollection(
  packages: readonly RegistryPackage[],
  collection: string | null,
): readonly RegistryPackage[] {
  if (!isStartHereCollection(collection)) {
    return packages
  }

  return selectStartHerePackages(packages)
}
