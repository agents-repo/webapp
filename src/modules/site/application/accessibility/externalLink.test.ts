import { describe, expect, it } from 'vitest'
import { externalLinkAccessibleName } from './externalLink'

describe('externalLinkAccessibleName', () => {
  it('appends the new-tab cue to the label', () => {
    expect(externalLinkAccessibleName('Webapp issues')).toBe('Webapp issues (opens in a new tab)')
  })
})
