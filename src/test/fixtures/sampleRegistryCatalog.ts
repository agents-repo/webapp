import type { RegistryCatalog } from '../../modules/registry/domain/package'

export const sampleRegistryCatalog: RegistryCatalog = {
  schemaVersion: '1.0.0',
  updatedAt: '2026-01-01T00:00:00.000Z',
  packages: [
    {
      id: 'sample-agent',
      name: 'sample-agent',
      description: 'A sample agent package for accessibility testing.',
      owner: 'agents-repo',
      latest: '1.0.0',
      tags: ['sample'],
      status: 'active',
      category: 'agent',
      estimateOverallCost: {
        band: 'low',
      },
      installTargets: [
        {
          id: 'cursor',
          status: 'supported',
        },
      ],
    },
  ],
}
