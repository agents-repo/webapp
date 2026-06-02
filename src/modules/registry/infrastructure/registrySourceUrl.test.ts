import { describe, expect, it } from 'vitest'
import {
  buildRegistryIndexUrl,
  normalizeRegistryBaseUrl,
  trimLeadingSlashes,
  trimTrailingSlashes,
} from './registrySourceUrl'

describe('registrySourceUrl', () => {
  it('normalizes GitHub repository URLs to raw main by default', () => {
    expect(normalizeRegistryBaseUrl('https://github.com/agents-repo/registry')).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/main',
    )
  })

  it('normalizes GitHub tree URLs to raw tag refs', () => {
    expect(normalizeRegistryBaseUrl('https://github.com/agents-repo/registry/tree/v1.1.0')).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/v1.1.0',
    )
  })

  it('normalizes GitHub refs that include slashes', () => {
    expect(normalizeRegistryBaseUrl('https://github.com/agents-repo/registry/tree/feature/foo')).toBe(
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
      'https://raw.githubusercontent.com/agents-repo/registry/main',
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

  it('trims leading and trailing slashes', () => {
    expect(trimTrailingSlashes('https://example.com///')).toBe('https://example.com')
    expect(trimLeadingSlashes('///packages/index.json')).toBe('packages/index.json')
  })
})
