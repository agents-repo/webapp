import { describe, expect, it } from 'vitest'
import { samplePackageDetail } from '../../../test/fixtures/samplePackageDetail'
import { isPackageDetailDocument } from './packageDetailValidation'

describe('isPackageDetailDocument', () => {
  it('accepts a well-formed latest-snapshot detail document', () => {
    expect(isPackageDetailDocument(samplePackageDetail)).toBe(true)
  })

  it('rejects instructionPath values that traverse or leave the package snapshot', () => {
    const sampleAgent = samplePackageDetail.agents[0]
    expect(sampleAgent).toBeDefined()
    if (!sampleAgent) {
      return
    }

    const withTraversal = {
      ...samplePackageDetail,
      agents: [
        {
          ...sampleAgent,
          instructionPath:
            'packages/agents-repo/sample-agent/versions/1.0.0/agents/../evil.agent.md',
        },
      ],
    }
    const otherPackage = {
      ...samplePackageDetail,
      agents: [
        {
          ...sampleAgent,
          instructionPath: 'packages/other/pkg/versions/1.0.0/agents/sample-agent.agent.md',
        },
      ],
    }

    expect(isPackageDetailDocument(withTraversal)).toBe(false)
    expect(isPackageDetailDocument(otherPackage)).toBe(false)
  })
})
