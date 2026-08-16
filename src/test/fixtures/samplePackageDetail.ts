import type { PackageDetailDocument } from '../../modules/registry/domain/packageDetail'

export const samplePackageDetail: PackageDetailDocument = {
  schemaVersion: '1.0.0',
  package: 'agents-repo/sample-agent',
  version: '1.0.0',
  metadata: {
    schemaVersion: '1.0.0',
    name: 'sample-agent',
    description: 'A sample agent package for accessibility testing.',
    owner: 'agents-repo',
    license: 'MIT',
    homepage: 'https://agents-repo.org',
    maintainers: ['agents-repo'],
    tags: ['sample'],
    status: 'active',
    category: 'agent',
    version: '1.0.0',
    estimateOverallCost: { band: 'low' },
  },
  readmeMarkdown: '# sample-agent\n\nA sample README.',
  agents: [
    {
      id: 'sample-agent',
      name: 'sample-agent',
      description: 'A sample agent.',
      status: 'active',
      category: 'assistant',
      estimateCost: { estimatedCost: 1, band: 'minimal' },
      instructionPath: 'packages/agents-repo/sample-agent/versions/1.0.0/agents/sample-agent.agent.md',
    },
  ],
  flows: [],
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
  chatWeb: true,
  instructionsPath: '/pkg/agents-repo/sample-agent/1.0.0/instructions.json',
}
