import { describe, expect, it } from 'vitest'
import { formatRegistryPackageRef, toPackageSlug } from './package'

describe('formatRegistryPackageRef', () => {
  it('joins trimmed namespace and package when both segments are shell-safe', () => {
    expect(formatRegistryPackageRef(' agents-repo ', ' sample-agent ')).toBe(
      'agents-repo/sample-agent',
    )
  })

  it('rejects segments with shell metacharacters or path separators', () => {
    expect(formatRegistryPackageRef('agents-repo', 'hello/agent')).toBeNull()
    expect(formatRegistryPackageRef('evil;rm', 'sample-agent')).toBeNull()
    expect(formatRegistryPackageRef('agents-repo', 'sample\n-agent')).toBeNull()
  })
})

describe('toPackageSlug', () => {
  it('joins namespace and package id with a double hyphen', () => {
    expect(toPackageSlug('agents-repo', 'hello-agent')).toBe('agents-repo--hello-agent')
  })

  it('keeps distinct slugs for values that would collide when slashes become hyphens', () => {
    expect(toPackageSlug('agents-repo', 'hello/agent')).toBe('agents-repo--hello_2f_agent')
    expect(toPackageSlug('agents-repo', 'hello-agent')).toBe('agents-repo--hello-agent')
    expect(toPackageSlug('agents-repo', 'hello/agent')).not.toBe(toPackageSlug('agents-repo', 'hello-agent'))
  })

  it('trims whitespace and encodes awkward characters for DOM ids', () => {
    expect(toPackageSlug(' agents-repo ', 'HELLO')).toBe('agents-repo--hello')
    expect(toPackageSlug('Foo Bar', 'pkg.id')).toBe('foo_20_bar--pkg_2e_id')
  })

  it('falls back to unknown when a segment is empty after encoding', () => {
    expect(toPackageSlug('   ', 'hello-agent')).toBe('unknown--hello-agent')
  })
})
