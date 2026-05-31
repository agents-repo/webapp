export type CostBand = 'low' | 'moderate' | 'high'
export type PackageStatus = 'active' | 'inactive'

export interface RegistryPackage {
  id: string
  name: string
  description: string
  owner: string
  latest: string
  tags: string[]
  status: PackageStatus
  category: string
  estimateOverallCost: {
    estimatedCost: number
    band: CostBand
  }
  quickstart?: string
}

export interface RegistryCatalog {
  schemaVersion: string
  updatedAt: string
  packages: RegistryPackage[]
}
