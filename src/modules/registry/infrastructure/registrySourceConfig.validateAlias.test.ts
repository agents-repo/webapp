import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearRegistryTagListCache } from './registryTagResolver'
import { validateRegistrySourceUrlForMajorVersionAlias } from './registrySourceConfig'

const DEFAULT_FALLBACK_REPOSITORY_URL = 'https://github.com/agents-repo/registry/tree/v2.x'

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

describe('validateRegistrySourceUrlForMajorVersionAlias', () => {
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
    vi.restoreAllMocks()
  })

  it('returns null when the source URL has no major-version line alias', async () => {
    await expect(
      validateRegistrySourceUrlForMajorVersionAlias(
        'https://github.com/agents-repo/registry/tree/v1.2.0',
        DEFAULT_FALLBACK_REPOSITORY_URL,
      ),
    ).resolves.toBeNull()

    await expect(
      validateRegistrySourceUrlForMajorVersionAlias(
        'https://example.com/catalog',
        DEFAULT_FALLBACK_REPOSITORY_URL,
      ),
    ).resolves.toBeNull()
  })

  it('returns null when alias resolution succeeds', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify([{ name: 'v2.0.0' }, { name: 'v2.1.0' }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(
      validateRegistrySourceUrlForMajorVersionAlias(
        'https://github.com/agents-repo/registry/tree/v2.x',
        DEFAULT_FALLBACK_REPOSITORY_URL,
      ),
    ).resolves.toBeNull()
  })

  it('returns null for proxy URLs with aliases when tags resolve via fallback repository', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify([{ name: 'v1.0.0' }, { name: 'v1.2.0' }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(
      validateRegistrySourceUrlForMajorVersionAlias(
        'https://registry-proxy.example.workers.dev?ref=1.x',
        DEFAULT_FALLBACK_REPOSITORY_URL,
      ),
    ).resolves.toBeNull()
  })

  it('returns a user-facing error when no GitHub repository can be inferred', async () => {
    const result = await validateRegistrySourceUrlForMajorVersionAlias(
      'https://registry-proxy.example.workers.dev?ref=v1.x',
      'https://registry-proxy.example.workers.dev?ref=v1.x',
    )

    expect(result).toBe('Could not infer a GitHub repository for major-version line ref resolution.')
  })

  it('returns a user-facing error when tag listing fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(null, { status: 503, statusText: 'Service Unavailable' })),
    )

    const result = await validateRegistrySourceUrlForMajorVersionAlias(
      'https://github.com/agents-repo/registry/tree/v2.x',
      DEFAULT_FALLBACK_REPOSITORY_URL,
    )

    expect(result).toBe('Registry tags request failed (503 Service Unavailable)')
  })

  it('returns a user-facing error when no stable tag exists for the major line', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const result = await validateRegistrySourceUrlForMajorVersionAlias(
      'https://github.com/agents-repo/registry/tree/v2.x',
      DEFAULT_FALLBACK_REPOSITORY_URL,
    )

    expect(result).toBe('No stable release tag found for major version line 2.x in agents-repo/registry')
  })
})
