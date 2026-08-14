import { getRepositorySlugs } from '../repositories/repositoryManifest.ts'
import type { PersonEntry, PersonProjectTag } from './peopleManifest.types.ts'

const allPlatformMaintainerProjects: readonly PersonProjectTag[] = getRepositorySlugs().map(
  (repositorySlug) => ({
    repositorySlug,
    role: 'maintainer',
  }),
)

export const maintainers: readonly PersonEntry[] = [
  {
    githubLogin: 'maiconfz',
    displayName: 'Maicon',
    projects: allPlatformMaintainerProjects,
  },
]

export const contributors: readonly PersonEntry[] = []

export function listMaintainers(): readonly PersonEntry[] {
  return maintainers
}

export function listContributors(): readonly PersonEntry[] {
  return contributors
}
