import type { RegistryCatalog, RegistryPackage } from '../../modules/registry/domain/package'

export function createPaginatedRegistryCatalog(packageCount = 13): RegistryCatalog {
  const packages: RegistryPackage[] = Array.from({ length: packageCount }, (_, index) => {
    const sequence = String(index + 1).padStart(2, '0')
    const name = `page-agent-${sequence}`
    const isLast = index === packageCount - 1
    return {
      id: `agents-repo/${name}`,
      namespace: 'agents-repo',
      package: name,
      path: `packages/agents-repo/${name}`,
      name,
      description: `Paginated fixture package ${sequence}.`,
      owner: 'agents-repo',
      latest: '1.0.0',
      tags: isLast ? ['paged', 'last'] : ['paged'],
      status: 'active',
      category: isLast ? 'flow' : 'agent',
      estimateOverallCost: { band: 'low' },
      installTargets: [{ id: 'cursor', status: 'supported' }],
    }
  })

  return {
    schemaVersion: '1.4.0',
    updatedAt: '2026-01-01T00:00:00.000Z',
    aliases: Object.fromEntries(packages.map((pkg) => [pkg.package, pkg.id])),
    packages,
  }
}
