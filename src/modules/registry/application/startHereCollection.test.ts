import { describe, expect, it } from 'vitest'
import type { RegistryPackage } from '../domain/package'
import { filterableRegistryCatalog } from '../../../test/fixtures/filterableRegistryCatalog'
import {
  isStartHereCollection,
  parsePackageCatalogCollection,
  restrictPackagesToCollection,
  selectStartHerePackages,
  START_HERE_PACKAGE_REFS,
} from './startHereCollection'

const helloAgent: RegistryPackage = {
  id: 'agents-repo/hello-agent',
  namespace: 'agents-repo',
  package: 'hello-agent',
  path: 'packages/agents-repo/hello-agent',
  name: 'hello-agent',
  description: 'A beginner-friendly hello agent.',
  owner: 'agents-repo',
  latest: '1.0.0',
  tags: ['hello'],
  status: 'active',
  category: 'assistant',
  estimateOverallCost: { band: 'low' },
  installTargets: [{ id: 'cursor', status: 'supported' }],
}

describe('selectStartHerePackages', () => {
  it('preserves declared order and skips missing or yanked packages', () => {
    const packages = [
      helloAgent,
      ...filterableRegistryCatalog.packages,
      {
        ...helloAgent,
        id: 'agents-repo/yanked-hello',
        package: 'yanked-hello',
        status: 'yanked' as const,
      },
    ]

    const selected = selectStartHerePackages(packages, [
      'agents-repo/hello-agent',
      'agents-repo/missing-package',
      'agents-repo/review-agent',
    ])

    expect(selected.map((pkg) => pkg.id)).toEqual(['agents-repo/hello-agent', 'agents-repo/review-agent'])
  })

  it('uses the default start-here refs when none are provided', () => {
    const packages = START_HERE_PACKAGE_REFS.map((id, index) => ({
      ...helloAgent,
      id,
      package: id.split('/')[1] ?? `pkg-${index}`,
      name: id.split('/')[1] ?? `pkg-${index}`,
    }))

    expect(selectStartHerePackages(packages)).toHaveLength(START_HERE_PACKAGE_REFS.length)
  })
})

describe('parsePackageCatalogCollection', () => {
  it('reads the collection query param', () => {
    const params = new URLSearchParams('collection=start-here&q=hello')
    expect(parsePackageCatalogCollection(params)).toBe('start-here')
  })

  it('returns null when collection is absent or blank', () => {
    expect(parsePackageCatalogCollection(new URLSearchParams())).toBeNull()
    expect(parsePackageCatalogCollection(new URLSearchParams('collection='))).toBeNull()
  })
})

describe('restrictPackagesToCollection', () => {
  it('restricts packages only for the start-here collection', () => {
    const packages = [helloAgent, ...filterableRegistryCatalog.packages]
    const restricted = restrictPackagesToCollection(packages, 'start-here')
    expect(restricted.every((pkg) => START_HERE_PACKAGE_REFS.includes(pkg.id))).toBe(true)
  })

  it('returns the original list for unknown collections', () => {
    const packages = filterableRegistryCatalog.packages
    expect(restrictPackagesToCollection(packages, 'other-collection')).toEqual(packages)
    expect(restrictPackagesToCollection(packages, null)).toEqual(packages)
  })
})

describe('isStartHereCollection', () => {
  it('matches only the start-here id', () => {
    expect(isStartHereCollection('start-here')).toBe(true)
    expect(isStartHereCollection('popular')).toBe(false)
    expect(isStartHereCollection(null)).toBe(false)
  })
})
