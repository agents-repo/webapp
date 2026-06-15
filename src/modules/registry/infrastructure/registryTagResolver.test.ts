import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearRegistryTagListCache,
  fetchGitHubRepositoryTagNames,
  pickLatestStableTagForMajorVersion,
  resolveLatestStableTagForMajorVersion,
} from './registryTagResolver'

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>()

  get length(): number {
    return this.data.size
  }

  clear(): void {
    this.data.clear()
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  key(index: number): string | null {
    const keys = [...this.data.keys()]
    return keys[index] ?? null
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }
}

describe('registryTagResolver', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    })
    vi.restoreAllMocks()
  })

  afterEach(() => {
    clearRegistryTagListCache()
  })

  it('picks the latest stable tag for a major version line', () => {
    const tagNames = ['v1.0.0', 'v1.1.0', 'v1.2.0', 'v1.2.0-rc.1', 'v1.10.0', 'v2.0.0']

    expect(pickLatestStableTagForMajorVersion(tagNames, 1)).toBe('v1.10.0')
    expect(pickLatestStableTagForMajorVersion(tagNames, 2)).toBe('v2.0.0')
    expect(pickLatestStableTagForMajorVersion(tagNames, 3)).toBeNull()
  })

  it('fetches GitHub tags and caches them in localStorage', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ name: 'v1.0.0' }, { name: 'v1.2.0' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const firstFetch = await fetchGitHubRepositoryTagNames('agents-repo', 'registry')
    const secondFetch = await fetchGitHubRepositoryTagNames('agents-repo', 'registry')

    expect(firstFetch).toEqual(['v1.0.0', 'v1.2.0'])
    expect(secondFetch).toEqual(['v1.0.0', 'v1.2.0'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('resolves the latest stable tag for a major version line', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ name: 'v1.0.0' }, { name: 'v1.2.0' }, { name: 'v2.0.0' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(resolveLatestStableTagForMajorVersion('agents-repo', 'registry', 1)).resolves.toBe('v1.2.0')
  })

  it('throws when no stable tag matches the requested major line', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ name: 'v2.0.0' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(resolveLatestStableTagForMajorVersion('agents-repo', 'registry', 1)).rejects.toThrow(
      'No stable release tag found for major version line 1.x',
    )
  })
})
