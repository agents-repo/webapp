export interface E2eInstallTargetEntry {
  readonly id: 'github-copilot' | 'claude-code' | 'cursor' | 'openai-codex'
  readonly status: 'supported' | 'experimental'
}

export interface E2eRegistryPackage {
  readonly id: string
  readonly namespace: string
  readonly package: string
  readonly name: string
  readonly description: string
  readonly owner: string
  readonly latest: string
  readonly tags: string[]
  readonly status: 'active' | 'deprecated' | 'archived' | 'yanked'
  readonly category: string
  readonly estimateOverallCost: {
    readonly band: 'minimal' | 'low' | 'moderate' | 'high' | 'critical' | 'mixed'
  }
  readonly installTargets?: readonly E2eInstallTargetEntry[]
}

export interface E2eRegistryCatalog {
  readonly schemaVersion: string
  readonly updatedAt: string
  readonly aliases?: Readonly<Record<string, string>>
  readonly packages: readonly E2eRegistryPackage[]
}

/** Index URL resolved when the app is built with `.env.e2e` / `vite --mode e2e`. */
export const E2E_REGISTRY_INDEX_URL = 'https://e2e.local/registry/packages/index.json'

export const searchableCatalog: E2eRegistryCatalog = {
  schemaVersion: '1.3.0',
  updatedAt: '2026-01-01T00:00:00.000Z',
  aliases: {
    'sample-agent': 'agents-repo/sample-agent',
    'demo-flow': 'agents-repo/demo-flow',
    'legacy-tool': 'other-org/legacy-tool',
  },
  packages: [
    {
      id: 'agents-repo/sample-agent',
      namespace: 'agents-repo',
      package: 'sample-agent',
      name: 'sample-agent',
      description: 'A sample agent package for E2E testing.',
      owner: 'agents-repo',
      latest: '1.0.0',
      tags: ['sample'],
      status: 'active',
      category: 'agent',
      estimateOverallCost: { band: 'low' },
      installTargets: [{ id: 'cursor', status: 'supported' }],
    },
    {
      id: 'agents-repo/demo-flow',
      namespace: 'agents-repo',
      package: 'demo-flow',
      name: 'demo-flow',
      description: 'A demo flow package for search filtering.',
      owner: 'agents-repo',
      latest: '2.1.0',
      tags: ['demo', 'flow'],
      status: 'active',
      category: 'flow',
      estimateOverallCost: { band: 'low' },
      installTargets: [{ id: 'cursor', status: 'supported' }],
    },
    {
      id: 'other-org/legacy-tool',
      namespace: 'other-org',
      package: 'legacy-tool',
      name: 'legacy-tool',
      description: 'Deprecated tooling package.',
      owner: 'other-org',
      latest: '0.9.0',
      tags: ['legacy'],
      status: 'deprecated',
      category: 'tool',
      estimateOverallCost: { band: 'moderate' },
      installTargets: [{ id: 'github-copilot', status: 'experimental' }],
    },
  ],
}

export const alternateOverrideCatalog: E2eRegistryCatalog = {
  schemaVersion: '1.3.0',
  updatedAt: '2026-02-01T00:00:00.000Z',
  packages: [
    {
      id: 'e2e-org/override-agent',
      namespace: 'e2e-org',
      package: 'override-agent',
      name: 'override-agent',
      description: 'Loaded from a runtime registry URL override.',
      owner: 'e2e-org',
      latest: '3.0.0',
      tags: ['override'],
      status: 'active',
      category: 'agent',
      estimateOverallCost: { band: 'low' },
      installTargets: [{ id: 'cursor', status: 'supported' }],
    },
  ],
}

export const E2E_OVERRIDE_REGISTRY_BASE_URL = 'https://override.e2e.local/registry'
export const E2E_OVERRIDE_INDEX_URL = `${E2E_OVERRIDE_REGISTRY_BASE_URL}/packages/index.json`
