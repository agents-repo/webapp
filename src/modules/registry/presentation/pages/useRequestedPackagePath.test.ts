import { describe, expect, it } from 'vitest'
import { getRequestedPackagePath } from './useRequestedPackagePath'

describe('getRequestedPackagePath', () => {
  it('uses route params for package detail paths', () => {
    expect(getRequestedPackagePath('/packages/agents-repo/sample-agent', 'agents-repo', 'sample-agent')).toEqual({
      displayPath: 'agents-repo/sample-agent',
      searchQuery: 'agents-repo/sample-agent',
    })
  })

  it('uses route params for namespace-only paths', () => {
    expect(getRequestedPackagePath('/packages/unknown-ns', 'unknown-ns')).toEqual({
      displayPath: 'unknown-ns',
      searchQuery: 'unknown-ns',
    })
  })

  it('parses extra-segment catch-all paths', () => {
    expect(getRequestedPackagePath('/packages/agents-repo/sample-agent/extra')).toEqual({
      displayPath: 'agents-repo/sample-agent',
      searchQuery: 'agents-repo/sample-agent',
    })
  })
})
