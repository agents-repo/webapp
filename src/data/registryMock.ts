export type CostBand = 'low' | 'moderate' | 'high'

export interface RegistryPackage {
  id: string
  name: string
  description: string
  latest: string
  tags: string[]
  status: 'active' | 'inactive'
  category: string
  estimateOverallCost: {
    estimatedCost: number
    band: CostBand
  }
  quickstart?: string
}

interface RegistryCatalogSource {
  schemaVersion: string
  updatedAt: string
  packages: RegistryPackage[]
}

export interface RegistryPackageView extends RegistryPackage {
  searchIndex: string
}

export interface RegistryCatalogView {
  schemaVersion: string
  updatedAt: string
  packages: RegistryPackageView[]
}

const source: RegistryCatalogSource = {
  schemaVersion: '1.0.0',
  updatedAt: '2026-05-26T17:05:22.666Z',
  packages: [
    {
      id: 'agents-repo-package-creation',
      name: 'agents-repo-package-creation',
      description:
        'Agents and flow for creating, reviewing, and validating new registry packages for agents-repo from requirements to submission-ready source.',
      latest: '1.0.0',
      tags: [
        'agents-repo-package-creation',
        'authoring',
        'validation',
        'review',
        'registry',
      ],
      status: 'active',
      category: 'assistant',
      estimateOverallCost: {
        estimatedCost: 6,
        band: 'moderate',
      },
    },
    {
      id: 'hello-agent',
      name: 'hello-agent',
      description: 'Hello Agent package scaffolded by package-create',
      latest: '1.0.0',
      tags: ['agent', 'hello'],
      status: 'active',
      category: 'assistant',
      estimateOverallCost: {
        estimatedCost: 1,
        band: 'low',
      },
      quickstart:
        'https://github.com/agents-repo/registry/blob/main/packages/hello-agent/README.md',
    },
  ],
}

const toSearchIndex = (pkg: RegistryPackage): string => {
  return [pkg.name, pkg.description, pkg.tags.join(' ')].join(' ').toLowerCase()
}

export const registryCatalog: RegistryCatalogView = {
  schemaVersion: source.schemaVersion,
  updatedAt: source.updatedAt,
  packages: source.packages.map((pkg) => ({
    ...pkg,
    searchIndex: toSearchIndex(pkg),
  })),
}
