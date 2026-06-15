import { describe, expect, it } from 'vitest'
import {
  extractMajorVersionLineAliasFromSourceUrl,
  extractRegistryRef,
  inferRegistryRepositoryIdentity,
  parseMajorVersionLineAlias,
  substituteRegistryRef,
} from './registryMajorVersionRef'

describe('registryMajorVersionRef', () => {
  it('detects major-version line aliases', () => {
    expect(parseMajorVersionLineAlias('1.x')).toEqual({ alias: '1.x', major: 1 })
    expect(parseMajorVersionLineAlias('v2.x')).toEqual({ alias: 'v2.x', major: 2 })
    expect(parseMajorVersionLineAlias('feature/foo')).toBeNull()
    expect(parseMajorVersionLineAlias('1.2.x')).toBeNull()
  })

  it('extracts refs from GitHub tree URLs and proxy query params', () => {
    expect(extractRegistryRef('https://github.com/agents-repo/registry/tree/1.x')).toBe('1.x')
    expect(extractRegistryRef('https://registry-proxy.example.workers.dev?ref=1.x')).toBe('1.x')
    expect(extractRegistryRef('https://github.com/agents-repo/registry/tree/v1.2.0')).toBe('v1.2.0')
    expect(extractRegistryRef('https://github.com/agents-repo/registry/tree/refs/heads/feature/foo')).toBe(
      'feature/foo',
    )
  })

  it('extracts major-version aliases from supported source URLs', () => {
    expect(
      extractMajorVersionLineAliasFromSourceUrl('https://registry-proxy.example.workers.dev?ref=1.x'),
    ).toEqual({
      alias: '1.x',
      major: 1,
    })
    expect(
      extractMajorVersionLineAliasFromSourceUrl('https://github.com/agents-repo/registry/tree/v2.x'),
    ).toEqual({
      alias: 'v2.x',
      major: 2,
    })
  })

  it('substitutes refs in query params and GitHub tree URLs', () => {
    expect(
      substituteRegistryRef('https://registry-proxy.example.workers.dev?ref=1.x', 'v1.2.0'),
    ).toBe('https://registry-proxy.example.workers.dev/?ref=v1.2.0')
    expect(
      substituteRegistryRef('https://github.com/agents-repo/registry/tree/1.x', 'v1.2.0'),
    ).toBe('https://github.com/agents-repo/registry/tree/v1.2.0')
  })

  it('infers repository identity from GitHub URLs with fallback', () => {
    expect(inferRegistryRepositoryIdentity('https://registry-proxy.example.workers.dev?ref=1.x', 'https://github.com/agents-repo/registry')).toEqual({
      owner: 'agents-repo',
      repo: 'registry',
    })
    expect(
      inferRegistryRepositoryIdentity(
        'https://github.com/custom-owner/custom-repo/tree/1.x',
        'https://github.com/agents-repo/registry',
      ),
    ).toEqual({
      owner: 'custom-owner',
      repo: 'custom-repo',
    })
  })
})
