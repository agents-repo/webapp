import { describe, expect, it } from 'vitest'
import { samplePackageDetail } from '../../../test/fixtures/samplePackageDetail'
import {
  getPackageFreshnessLabel,
  getPackageLastUpdatedAt,
  PACKAGE_FRESHNESS_RECENT_DAYS,
} from './packageFreshness'

describe('packageFreshness', () => {
  it('uses the newest of metadata.updatedAt and latest version createdAt', () => {
    const detail = {
      ...samplePackageDetail,
      metadata: {
        ...samplePackageDetail.metadata,
        updatedAt: '2026-06-01T00:00:00.000Z',
      },
      versions: {
        latest: '1.0.0',
        entries: [
          {
            version: '1.0.0',
            createdAt: '2026-01-01T00:00:00.000Z',
            srcArtifact: '1.0.0-src.zip',
            artifacts: [{ target: 'cursor', file: '1.0.0-cursor.zip' }],
          },
        ],
      },
    }

    expect(getPackageLastUpdatedAt(detail)).toBe('2026-06-01T00:00:00.000Z')
  })

  it('falls back to latest version createdAt when metadata.updatedAt is absent', () => {
    expect(getPackageLastUpdatedAt(samplePackageDetail)).toBe('2026-01-01T00:00:00.000Z')
  })

  it(`returns recentlyUpdated when age is at most ${PACKAGE_FRESHNESS_RECENT_DAYS} days`, () => {
    const now = new Date('2026-03-01T00:00:00.000Z')
    const lastUpdatedAt = '2026-01-01T00:00:00.000Z'

    expect(getPackageFreshnessLabel(lastUpdatedAt, now)).toBe('recentlyUpdated')
  })

  it(`returns null when age exceeds ${PACKAGE_FRESHNESS_RECENT_DAYS} days`, () => {
    const now = new Date('2026-06-01T00:00:00.000Z')
    const lastUpdatedAt = '2026-01-01T00:00:00.000Z'

    expect(getPackageFreshnessLabel(lastUpdatedAt, now)).toBeNull()
  })
})
