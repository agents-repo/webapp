import { describe, expect, it } from 'vitest'
import { REGISTRY_ISSUES_URL } from '../../site/application/community/githubProjectUrls.ts'
import { buildPackageIssuesUrl } from './packageIssuesUrl'

describe('buildPackageIssuesUrl', () => {
  it('builds package repo issues URL from metadata.repository', () => {
    const link = buildPackageIssuesUrl(
      {
        schemaVersion: '1.0.0',
        name: 'sample-agent',
        description: 'Sample',
        owner: 'agents-repo',
        repository: 'https://github.com/example/sample-agent',
      },
      'agents-repo/sample-agent',
    )

    expect(link).toEqual({
      url: 'https://github.com/example/sample-agent/issues',
      kind: 'packageRepo',
    })
  })

  it('builds package repo issues URL from a GitHub homepage when repository is absent', () => {
    const link = buildPackageIssuesUrl(
      {
        schemaVersion: '1.0.0',
        name: 'sample-agent',
        description: 'Sample',
        owner: 'agents-repo',
        homepage: 'https://github.com/example/sample-agent/tree/main',
      },
      'agents-repo/sample-agent',
    )

    expect(link).toEqual({
      url: 'https://github.com/example/sample-agent/issues',
      kind: 'packageRepo',
    })
  })

  it('falls back to registry issues with prefilled title and body', () => {
    const link = buildPackageIssuesUrl(
      {
        schemaVersion: '1.0.0',
        name: 'sample-agent',
        description: 'Sample',
        owner: 'agents-repo',
      },
      'agents-repo/sample-agent',
    )

    expect(link.kind).toBe('registry')
    expect(link.url.startsWith(`${REGISTRY_ISSUES_URL}/new?`)).toBe(true)
    expect(link.url).toContain('agents-repo%2Fsample-agent')
    expect(link.url).toContain('Package')
  })
})
