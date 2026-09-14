import { describe, expect, it } from 'vitest'
import { samplePackageDetail } from '../../../test/fixtures/samplePackageDetail.ts'
import {
  buildPackageSiteMarkdownDocument,
  getPackageSiteMarkdownPublicPath,
} from './packageSiteMarkdown.ts'

describe('packageSiteMarkdown', () => {
  it('builds a stable public markdown path', () => {
    expect(getPackageSiteMarkdownPublicPath('agents-repo', 'sample-agent')).toBe(
      '/packages/agents-repo/sample-agent.md',
    )
  })

  it('includes metadata, agents, and readme in markdown output', () => {
    const markdown = buildPackageSiteMarkdownDocument(
      'agents-repo',
      'sample-agent',
      samplePackageDetail,
      'https://agents-repo.org',
    )

    expect(markdown).toContain('# sample-agent')
    expect(markdown).toContain('A sample agent package for accessibility testing.')
    expect(markdown).toContain('https://agents-repo.org/packages/agents-repo/sample-agent.md')
    expect(markdown).toContain('## Agents')
    expect(markdown).toContain('## README')
    expect(markdown).toContain('# sample-agent')
  })
})
