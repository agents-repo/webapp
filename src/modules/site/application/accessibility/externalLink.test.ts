import { describe, expect, it } from 'vitest'
import { externalLinkAccessibleName, externalLinkOpensInNewTabLabelEn } from './externalLink'

describe('externalLinkAccessibleName', () => {
  it('appends the new-tab cue to the label', () => {
    expect(externalLinkAccessibleName('Webapp issues', externalLinkOpensInNewTabLabelEn)).toBe(
      'Webapp issues (opens in a new tab)',
    )
  })
})
