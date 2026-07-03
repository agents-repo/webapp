import { describe, expect, it } from 'vitest'
import {
  buildRegistryArtifactPath,
  buildRegistryArtifactUrl,
  buildRegistryIndexUrl,
  buildRegistryPackageBrowseUrl,
  getRegistryBaseUrlFromIndexUrl,
  getRegistryIndexCacheLookupKey,
  getRegistrySourceCacheIdentity,
  normalizeRegistryBaseUrl,
  trimLeadingSlashes,
  trimTrailingSlashes,
} from './registrySourceUrl'

describe('registrySourceUrl', () => {
  it('normalizes GitHub repository URLs to the default registry ref when no tree ref is present', () => {
    expect(normalizeRegistryBaseUrl('https://github.com/agents-repo/registry')).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/v2.x',
    )
  })

  it('normalizes GitHub tree URLs to raw tag refs', () => {
    expect(normalizeRegistryBaseUrl('https://github.com/agents-repo/registry/tree/v1.1.0')).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/v1.1.0',
    )
  })

  it('treats additional tree path segments as repository paths, not ref segments', () => {
    expect(normalizeRegistryBaseUrl('https://github.com/agents-repo/registry/tree/main/packages')).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/main',
    )
  })

  it('supports explicit slash refs via refs/heads in tree URLs', () => {
    expect(normalizeRegistryBaseUrl('https://github.com/agents-repo/registry/tree/refs/heads/feature/foo')).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/feature/foo',
    )
  })

  it('normalizes GitHub blob URLs using the provided ref segment', () => {
    expect(normalizeRegistryBaseUrl('https://github.com/agents-repo/registry/blob/main')).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/main',
    )
  })

  it('passes through non-GitHub and raw URLs unchanged except trailing slash trimming', () => {
    expect(normalizeRegistryBaseUrl('https://raw.githubusercontent.com/agents-repo/registry/main/')).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/main',
    )
    expect(normalizeRegistryBaseUrl('https://registry.example.workers.dev/source/')).toBe(
      'https://registry.example.workers.dev/source',
    )
  })

  it('strips .git suffix on GitHub repository URLs', () => {
    expect(normalizeRegistryBaseUrl('https://github.com/agents-repo/registry.git')).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/v2.x',
    )
  })

  it('keeps invalid URLs as normalized input', () => {
    expect(normalizeRegistryBaseUrl('not-a-url///')).toBe('not-a-url')
  })

  it('builds index URL by normalizing slash boundaries', () => {
    expect(buildRegistryIndexUrl('https://example.com/base/', '/packages/index.json')).toBe(
      'https://example.com/base/packages/index.json',
    )
  })

  it('builds index URL while preserving existing query parameters', () => {
    expect(buildRegistryIndexUrl('https://registry-proxy.example.workers.dev?ref=main', 'packages/index.json')).toBe(
      'https://registry-proxy.example.workers.dev/packages/index.json?ref=main',
    )
    expect(
      buildRegistryIndexUrl('https://registry-proxy.example.workers.dev/catalog/?ref=release-2026-06', '/packages/index.json'),
    ).toBe('https://registry-proxy.example.workers.dev/catalog/packages/index.json?ref=release-2026-06')
  })

  it('reconstructs base URLs from index URLs built by buildRegistryIndexUrl', () => {
    expect(
      getRegistryBaseUrlFromIndexUrl(
        buildRegistryIndexUrl('https://example.com/base/', 'packages/index.json'),
        'packages/index.json',
      ),
    ).toBe('https://example.com/base')

    expect(
      getRegistryBaseUrlFromIndexUrl(
        buildRegistryIndexUrl('https://registry-proxy.example.workers.dev?ref=main', 'packages/index.json'),
        'packages/index.json',
      ),
    ).toBe('https://registry-proxy.example.workers.dev/?ref=main')

    expect(
      getRegistryBaseUrlFromIndexUrl(
        buildRegistryIndexUrl('https://raw.githubusercontent.com/agents-repo/registry/v1.2.0', 'packages/index.json'),
        'packages/index.json',
      ),
    ).toBe('https://raw.githubusercontent.com/agents-repo/registry/v1.2.0')

    expect(
      getRegistryBaseUrlFromIndexUrl(
        buildRegistryIndexUrl('https://registry.example.workers.dev/catalog/', 'custom/catalog.json'),
        'custom/catalog.json',
      ),
    ).toBe('https://registry.example.workers.dev/catalog')
  })

  it('does not strip the index path when the index URL pathname has an extra trailing slash', () => {
    expect(
      getRegistryBaseUrlFromIndexUrl('https://example.com/base/packages/index.json/', 'packages/index.json'),
    ).toBe('https://example.com/base/packages/index.json')
  })

  it('returns the full index URL when the index path suffix does not match', () => {
    expect(
      getRegistryBaseUrlFromIndexUrl('https://example.com/other/path.json', 'packages/index.json'),
    ).toBe('https://example.com/other/path.json')
  })

  it('returns an empty string for malformed index URLs', () => {
    expect(getRegistryBaseUrlFromIndexUrl('not-a-url', 'packages/index.json')).toBe('')
  })

  it('trims leading and trailing slashes', () => {
    expect(trimTrailingSlashes('https://example.com///')).toBe('https://example.com')
    expect(trimLeadingSlashes('///packages/index.json')).toBe('packages/index.json')
  })

  it('builds artifact path with namespace, version and target id', () => {
    expect(buildRegistryArtifactPath('agents-repo', 'hello-agent', '1.0.0', 'cursor')).toBe(
      'packages/agents-repo/hello-agent/versions/1.0.0/1.0.0-cursor.zip',
    )
  })

  it('builds artifact URL while preserving query parameters', () => {
    expect(
      buildRegistryArtifactUrl(
        'https://registry-proxy.example.workers.dev?ref=main',
        'agents-repo',
        'hello-agent',
        '1.0.0',
        'github-copilot',
      ),
    ).toBe(
      'https://registry-proxy.example.workers.dev/packages/agents-repo/hello-agent/versions/1.0.0/1.0.0-github-copilot.zip?ref=main',
    )
  })

  it('builds artifact URL for raw GitHub base URLs', () => {
    expect(
      buildRegistryArtifactUrl(
        'https://raw.githubusercontent.com/agents-repo/registry/main',
        'agents-repo',
        'hello-agent',
        '1.1.0',
        'claude-code',
      ),
    ).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/main/packages/agents-repo/hello-agent/versions/1.1.0/1.1.0-claude-code.zip',
    )
  })

  it('builds package browse URL from GitHub repository root', () => {
    expect(
      buildRegistryPackageBrowseUrl('https://github.com/agents-repo/registry', 'agents-repo', 'hello-agent'),
    ).toBe('https://github.com/agents-repo/registry/tree/v2.x/packages/agents-repo/hello-agent')
  })

  it('builds package browse URL from GitHub tree ref URLs', () => {
    expect(
      buildRegistryPackageBrowseUrl('https://github.com/agents-repo/registry/tree/v1.1.0', 'agents-repo', 'hello-agent'),
    ).toBe('https://github.com/agents-repo/registry/tree/v1.1.0/packages/agents-repo/hello-agent')
  })

  it('builds package browse URL from explicit slash refs in tree URLs', () => {
    expect(
      buildRegistryPackageBrowseUrl(
        'https://github.com/agents-repo/registry/tree/refs/heads/feature/foo',
        'agents-repo',
        'hello-agent',
      ),
    ).toBe('https://github.com/agents-repo/registry/tree/feature/foo/packages/agents-repo/hello-agent')
  })

  it('returns null for non-GitHub browse source URLs', () => {
    expect(
      buildRegistryPackageBrowseUrl('https://registry-proxy.example.workers.dev?ref=main', 'agents-repo', 'hello-agent'),
    ).toBeNull()
    expect(buildRegistryPackageBrowseUrl('not-a-url', 'agents-repo', 'hello-agent')).toBeNull()
    expect(buildRegistryPackageBrowseUrl('https://github.com/agents-repo/registry', '   ', 'hello-agent')).toBeNull()
  })

  it('builds cache lookup keys that ignore query-string refs', () => {
    expect(
      getRegistryIndexCacheLookupKey(
        'https://registry-proxy.example.workers.dev/packages/index.json?ref=v1.2.0',
        'packages/index.json',
      ),
    ).toBe('https://registry-proxy.example.workers.dev/packages/index.json')
    expect(
      getRegistryIndexCacheLookupKey(
        'https://registry-proxy.example.workers.dev/packages/index.json?ref=1.x',
        'packages/index.json',
      ),
    ).toBe('https://registry-proxy.example.workers.dev/packages/index.json')
  })

  it('builds cache lookup keys that normalize raw GitHub path refs', () => {
    expect(
      getRegistryIndexCacheLookupKey(
        'https://raw.githubusercontent.com/agents-repo/registry/v1.2.0/packages/index.json',
        'packages/index.json',
      ),
    ).toBe('https://raw.githubusercontent.com/agents-repo/registry/{ref}/packages/index.json')
    expect(getRegistrySourceCacheIdentity('https://github.com/agents-repo/registry/tree/v1.x', 'packages/index.json'))
      .toEqual({
        lookupKey: 'https://raw.githubusercontent.com/agents-repo/registry/{ref}/packages/index.json',
        indexPath: 'packages/index.json',
        sourceRef: null,
      })
  })
})
