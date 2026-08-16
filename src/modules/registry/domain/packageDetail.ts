import type { PackageCostBand, PackageStatus } from './package'

export interface PackageDetailEstimateCost {
  readonly estimatedCost: number
  readonly band: PackageCostBand
}

export interface PackageDetailEntry {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly status: PackageStatus
  readonly category: string
  readonly estimateCost: PackageDetailEstimateCost
  readonly instructionPath: string
  readonly agents?: readonly string[]
}

export interface PackageDetailArtifact {
  readonly target: string
  readonly file: string
}

export interface PackageDetailVersionEntry {
  readonly version: string
  readonly createdAt: string
  readonly srcArtifact: string
  readonly artifacts: readonly PackageDetailArtifact[]
  readonly instructionsArtifact?: string
}

export interface PackageDetailMetadata {
  readonly schemaVersion: string
  readonly name: string
  readonly description: string
  readonly owner: string
  readonly license?: string
  readonly homepage?: string
  readonly repository?: string
  readonly maintainers?: readonly string[]
  readonly tags?: readonly string[]
  readonly status?: PackageStatus
  readonly category?: string
  readonly version?: string
  readonly estimateOverallCost?: {
    readonly estimatedCost?: number
    readonly band: PackageCostBand
  }
  readonly installTargets?: readonly { readonly id: string; readonly status: string }[]
}

export interface PackageDetailDocument {
  readonly schemaVersion: string
  readonly package: string
  readonly version: string
  readonly metadata: PackageDetailMetadata
  readonly readmeMarkdown?: string
  readonly agents: readonly PackageDetailEntry[]
  readonly flows: readonly PackageDetailEntry[]
  readonly versions: {
    readonly latest: string
    readonly entries: readonly PackageDetailVersionEntry[]
  }
  readonly chatWeb?: boolean
  readonly instructionsPath?: string
}
