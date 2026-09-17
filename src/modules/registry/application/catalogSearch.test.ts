import { describe, expect, it } from 'vitest'
import type { RegistryPackage } from '../domain/package'
import {
  buildPackageSearchMatchContextMap,
  getPackageSearchMatchContext,
} from './catalogSearch'

const samplePackage: RegistryPackage = {
  id: 'agents-repo/sample-agent',
  namespace: 'agents-repo',
  package: 'sample-agent',
  path: 'packages/agents-repo/sample-agent',
  name: 'sample-agent',
  description: 'A sample agent package for accessibility testing.',
  owner: 'agents-repo',
  latest: '1.0.0',
  tags: ['sample', 'automation'],
  status: 'active',
  category: 'assistant',
  estimateOverallCost: { band: 'low' },
  installTargets: [{ id: 'cursor', status: 'supported' }],
}

describe('getPackageSearchMatchContext', () => {
  it('returns null for an empty query', () => {
    expect(getPackageSearchMatchContext(samplePackage, '')).toBeNull()
    expect(getPackageSearchMatchContext(samplePackage, '   ')).toBeNull()
  })

  it('detects name matches', () => {
    expect(getPackageSearchMatchContext(samplePackage, 'sample-agent')?.fields).toContain('name')
  })

  it('detects description matches with a snippet', () => {
    const context = getPackageSearchMatchContext(samplePackage, 'accessibility')
    expect(context?.fields).toContain('description')
    expect(context?.descriptionSnippet).toContain('accessibility')
  })

  it('detects tag matches', () => {
    expect(getPackageSearchMatchContext(samplePackage, 'automation')?.fields).toContain('tag')
  })

  it('detects owner matches with and without @ prefix', () => {
    expect(getPackageSearchMatchContext(samplePackage, '@agents-repo')?.fields).toContain('owner')
    expect(getPackageSearchMatchContext(samplePackage, 'agents-repo')?.fields).toContain('owner')
  })

  it('detects category matches', () => {
    expect(getPackageSearchMatchContext(samplePackage, 'assistant')?.fields).toContain('category')
  })

  it('detects matches for a namespace/package query', () => {
    const context = getPackageSearchMatchContext(samplePackage, 'agents-repo/sample-agent')
    expect(context).not.toBeNull()
    expect(context?.fields).toContain('name')
    expect(context?.fields).toContain('owner')
  })

  it('detects matches for an @namespace/package query', () => {
    const context = getPackageSearchMatchContext(samplePackage, '@agents-repo/sample-agent')
    expect(context).not.toBeNull()
    expect(context?.fields).toContain('name')
    expect(context?.fields).toContain('owner')
  })

  it('builds description snippets using the term that matched', () => {
    const padding = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(3)
    const pkg: RegistryPackage = {
      ...samplePackage,
      description: `${padding}Maintained by agents-repo for sample workflows.${padding}`,
    }
    const context = getPackageSearchMatchContext(pkg, '@agents-repo')
    expect(context?.fields).toContain('description')
    expect(context?.descriptionSnippet).toContain('agents-repo')
    expect(context?.descriptionSnippet?.startsWith('…')).toBe(true)
    expect(context?.descriptionSnippet?.endsWith('…')).toBe(true)
  })
})

describe('buildPackageSearchMatchContextMap', () => {
  it('returns an empty map for an empty query', () => {
    expect(buildPackageSearchMatchContextMap([samplePackage], '')).toEqual(new Map())
  })

  it('maps package ids to match context', () => {
    const matches = buildPackageSearchMatchContextMap([samplePackage], 'sample')
    expect(matches.get(samplePackage.id)?.fields).toContain('name')
  })
})
