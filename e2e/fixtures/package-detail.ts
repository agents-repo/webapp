import type { E2eRegistryPackage } from './catalog.ts'

export const sampleAgentPackageDetail = {
  schemaVersion: '1.0.0',
  package: 'agents-repo/sample-agent',
  version: '1.0.0',
  metadata: {
    schemaVersion: '1.0.0',
    name: 'sample-agent',
    description: 'A sample agent package for E2E testing.',
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
} as const

export function createE2ePackageDetailFromCatalogEntry(pkg: E2eRegistryPackage) {
  const packageId = `${pkg.namespace}/${pkg.package}`
  const version = pkg.latest
  const isFlow = pkg.category === 'flow'
  const catalogEntry = {
    id: pkg.package,
    name: pkg.name,
    description: pkg.description,
    status: pkg.status,
    category: pkg.category,
    estimateCost: { estimatedCost: 1, band: 'minimal' as const },
    instructionPath: isFlow
      ? `packages/${pkg.namespace}/${pkg.package}/versions/${version}/flows/${pkg.package}.flow.md`
      : `packages/${pkg.namespace}/${pkg.package}/versions/${version}/agents/${pkg.package}.agent.md`,
  }

  return {
    ...sampleAgentPackageDetail,
    package: packageId,
    version,
    metadata: {
      ...sampleAgentPackageDetail.metadata,
      name: pkg.name,
      description: pkg.description,
      owner: pkg.owner,
      tags: [...pkg.tags],
      status: pkg.status,
      category: pkg.category,
      version,
      estimateOverallCost: pkg.estimateOverallCost,
    },
    readmeMarkdown: `# ${pkg.name}\n\n${pkg.description}`,
    agents: isFlow ? [] : [catalogEntry],
    flows: isFlow ? [catalogEntry] : [],
    chatWeb: pkg.chatWeb ?? sampleAgentPackageDetail.chatWeb,
    instructionsPath: `/pkg/${pkg.namespace}/${pkg.package}/${version}/instructions.json`,
    versions: {
      latest: version,
      entries: [
        {
          version,
          createdAt: '2026-01-01T00:00:00.000Z',
          srcArtifact: `${version}-src.zip`,
          artifacts: [{ target: 'cursor' as const, file: `${version}-cursor.zip` }],
        },
      ],
    },
  }
}
