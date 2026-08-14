import { describe, expect, it } from 'vitest'
import { GITHUB_AVATAR_SIZE_PX, githubAvatarUrl, githubProfileUrl } from './githubPersonUrls.ts'
import { contributors, listContributors, listMaintainers, maintainers } from './peopleManifest.ts'
import type { PersonEntry } from './peopleManifest.types.ts'
import { getRepositoryBySlug, getRepositorySlugs } from '../repositories/repositoryManifest.ts'

function collectPeople(entries: readonly PersonEntry[]): readonly PersonEntry[] {
  return entries
}

describe('githubPersonUrls', () => {
  it('builds GitHub profile and avatar URLs from login', () => {
    expect(githubProfileUrl('maiconfz')).toBe('https://github.com/maiconfz')
    expect(githubAvatarUrl('maiconfz')).toBe(
      `https://github.com/maiconfz.png?size=${GITHUB_AVATAR_SIZE_PX}`,
    )
  })
})

describe('peopleManifest', () => {
  it('lists Maicon as maintainer of every platform repository', () => {
    expect(listMaintainers()).toHaveLength(1)
    expect(maintainers[0]?.githubLogin).toBe('maiconfz')
    expect(maintainers[0]?.displayName).toBe('Maicon')
    expect(maintainers[0]?.projects.map((project) => project.repositorySlug)).toEqual(
      getRepositorySlugs(),
    )
    expect(maintainers[0]?.projects.every((project) => project.role === 'maintainer')).toBe(true)
  })

  it('has no contributors yet', () => {
    expect(listContributors()).toEqual([])
    expect(contributors).toHaveLength(0)
  })

  it('requires unique GitHub logins, display names, and valid repository slugs', () => {
    const people = collectPeople([...maintainers, ...contributors])
    const logins = new Set<string>()

    for (const person of people) {
      expect(person.githubLogin.length).toBeGreaterThan(0)
      expect(person.displayName.length).toBeGreaterThan(0)
      expect(logins.has(person.githubLogin)).toBe(false)
      logins.add(person.githubLogin)
      expect(person.projects.length).toBeGreaterThan(0)

      for (const project of person.projects) {
        expect(getRepositoryBySlug(project.repositorySlug)).toBeDefined()
      }
    }
  })
})
