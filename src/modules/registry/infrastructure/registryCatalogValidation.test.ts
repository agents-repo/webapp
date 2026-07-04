import { describe, expect, it } from 'vitest'
import { isRegistryCatalog } from './registryCatalogValidation'

const makeValidPackage = (): Record<string, unknown> => ({
  id: 'agents-repo/hello-agent',
  namespace: 'agents-repo',
  package: 'hello-agent',
  name: 'hello-agent',
  description: 'Hello Agent package',
  owner: 'agents-repo',
  latest: '1.0.0',
  tags: ['agent'],
  status: 'active',
  category: 'assistant',
  estimateOverallCost: {
    estimatedCost: 1,
    band: 'low',
  },
  installTargets: [
    { id: 'github-copilot', status: 'supported' },
    { id: 'cursor', status: 'experimental' },
  ],
})

describe('isRegistryCatalog', () => {
  it('accepts a catalog with installTargets and registry-aligned enums', () => {
    const payload = {
      schemaVersion: '1.3.0',
      updatedAt: '2026-06-08T02:09:56.645Z',
      packages: [makeValidPackage()],
    }

    expect(isRegistryCatalog(payload)).toBe(true)
  })

  it('accepts packages without installTargets', () => {
    const pkg = makeValidPackage()
    delete pkg.installTargets

    const payload = {
      schemaVersion: '1.3.0',
      updatedAt: '2026-06-08T02:09:56.645Z',
      packages: [pkg],
    }

    expect(isRegistryCatalog(payload)).toBe(true)
  })

  it('accepts optional estimatedCost and mixed cost band', () => {
    const pkg = makeValidPackage()
    pkg.estimateOverallCost = { band: 'mixed' }
    delete (pkg.estimateOverallCost as Record<string, unknown>).estimatedCost

    const payload = {
      schemaVersion: '1.3.0',
      updatedAt: '2026-06-08T02:09:56.645Z',
      packages: [pkg],
    }

    expect(isRegistryCatalog(payload)).toBe(true)
  })

  it('rejects legacy inactive status', () => {
    const pkg = makeValidPackage()
    pkg.status = 'inactive'

    const payload = {
      schemaVersion: '1.3.0',
      updatedAt: '2026-06-08T02:09:56.645Z',
      packages: [pkg],
    }

    expect(isRegistryCatalog(payload)).toBe(false)
  })

  it('rejects invalid install target id', () => {
    const pkg = makeValidPackage()
    pkg.installTargets = [{ id: 'vscode', status: 'supported' }]

    const payload = {
      schemaVersion: '1.3.0',
      updatedAt: '2026-06-08T02:09:56.645Z',
      packages: [pkg],
    }

    expect(isRegistryCatalog(payload)).toBe(false)
  })

  it('rejects duplicate install target ids', () => {
    const pkg = makeValidPackage()
    pkg.installTargets = [
      { id: 'cursor', status: 'supported' },
      { id: 'cursor', status: 'experimental' },
    ]

    const payload = {
      schemaVersion: '1.3.0',
      updatedAt: '2026-06-08T02:09:56.645Z',
      packages: [pkg],
    }

    expect(isRegistryCatalog(payload)).toBe(false)
  })

  it('rejects planned install target status in index projection', () => {
    const pkg = makeValidPackage()
    pkg.installTargets = [{ id: 'cursor', status: 'planned' }]

    const payload = {
      schemaVersion: '1.3.0',
      updatedAt: '2026-06-08T02:09:56.645Z',
      packages: [pkg],
    }

    expect(isRegistryCatalog(payload)).toBe(false)
  })

  it('rejects invalid updatedAt values', () => {
    const payload = {
      schemaVersion: '1.3.0',
      updatedAt: 'not-a-date',
      packages: [makeValidPackage()],
    }

    expect(isRegistryCatalog(payload)).toBe(false)
  })

  it('rejects estimatedCost values outside the supported integer range', () => {
    const pkg = makeValidPackage()
    pkg.estimateOverallCost = { estimatedCost: 0, band: 'low' }

    expect(
      isRegistryCatalog({
        schemaVersion: '1.3.0',
        updatedAt: '2026-06-08T02:09:56.645Z',
        packages: [pkg],
      }),
    ).toBe(false)

    pkg.estimateOverallCost = { estimatedCost: 11, band: 'low' }

    expect(
      isRegistryCatalog({
        schemaVersion: '1.3.0',
        updatedAt: '2026-06-08T02:09:56.645Z',
        packages: [pkg],
      }),
    ).toBe(false)
  })

  it('rejects empty installTargets arrays and non-array packages', () => {
    const pkg = makeValidPackage()
    pkg.installTargets = []

    expect(
      isRegistryCatalog({
        schemaVersion: '1.3.0',
        updatedAt: '2026-06-08T02:09:56.645Z',
        packages: [pkg],
      }),
    ).toBe(false)

    expect(
      isRegistryCatalog({
        schemaVersion: '1.3.0',
        updatedAt: '2026-06-08T02:09:56.645Z',
        packages: 'not-an-array',
      }),
    ).toBe(false)
  })

  it('rejects invalid quickstart types', () => {
    const pkg = makeValidPackage()
    pkg.quickstart = 42

    expect(
      isRegistryCatalog({
        schemaVersion: '1.3.0',
        updatedAt: '2026-06-08T02:09:56.645Z',
        packages: [pkg],
      }),
    ).toBe(false)
  })

})
