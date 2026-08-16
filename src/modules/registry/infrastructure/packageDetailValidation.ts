import {
  PACKAGE_COST_BANDS,
  PACKAGE_STATUS_VALUES,
  type PackageCostBand,
  type PackageStatus,
} from '../domain/package'
import type {
  PackageDetailDocument,
  PackageDetailEntry,
  PackageDetailMetadata,
  PackageDetailVersionEntry,
} from '../domain/packageDetail'

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

const isPackageStatus = (value: unknown): value is PackageStatus => {
  return typeof value === 'string' && (PACKAGE_STATUS_VALUES as readonly string[]).includes(value)
}

const isPackageCostBand = (value: unknown): value is PackageCostBand => {
  return typeof value === 'string' && (PACKAGE_COST_BANDS as readonly string[]).includes(value)
}

const isEstimateCost = (value: unknown): value is PackageDetailEntry['estimateCost'] => {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.estimatedCost === 'number' && Number.isInteger(value.estimatedCost) && isPackageCostBand(value.band)
}

const isSafePathSegment = (segment: string): boolean => {
  return segment.length > 0 && segment !== '.' && segment !== '..'
}

const isSafeInstructionPath = (value: string, packageRef: string, version: string): boolean => {
  if (!value.endsWith('.agent.md') || value.includes('\\') || value.includes('\0')) {
    return false
  }

  const segments = value.split('/')
  if (segments.length !== 7 || !segments.every(isSafePathSegment)) {
    return false
  }

  return (
    segments[0] === 'packages' &&
    `${segments[1]}/${segments[2]}` === packageRef &&
    segments[3] === 'versions' &&
    segments[4] === version &&
    (segments[5] === 'agents' || segments[5] === 'flows')
  )
}

const isDetailEntry = (
  value: unknown,
  packageRef: string,
  version: string,
): value is PackageDetailEntry => {
  if (!isRecord(value)) {
    return false
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.name !== 'string' ||
    typeof value.description !== 'string' ||
    !isPackageStatus(value.status) ||
    typeof value.category !== 'string' ||
    typeof value.instructionPath !== 'string' ||
    !isEstimateCost(value.estimateCost)
  ) {
    return false
  }

  if (value.agents !== undefined && !isStringArray(value.agents)) {
    return false
  }

  return isSafeInstructionPath(value.instructionPath, packageRef, version)
}

const isVersionEntry = (value: unknown): value is PackageDetailVersionEntry => {
  if (!isRecord(value) || typeof value.version !== 'string' || typeof value.createdAt !== 'string') {
    return false
  }

  if (typeof value.srcArtifact !== 'string' || !Array.isArray(value.artifacts)) {
    return false
  }

  if (value.instructionsArtifact !== undefined && typeof value.instructionsArtifact !== 'string') {
    return false
  }

  return value.artifacts.every(
    (artifact) =>
      isRecord(artifact) && typeof artifact.target === 'string' && typeof artifact.file === 'string',
  )
}

const isMetadata = (value: unknown): value is PackageDetailMetadata => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.schemaVersion === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.owner === 'string'
  )
}

function hasOptionalDetailFields(value: Record<string, unknown>): boolean {
  if (value.readmeMarkdown !== undefined && typeof value.readmeMarkdown !== 'string') {
    return false
  }

  if (value.chatWeb !== undefined && typeof value.chatWeb !== 'boolean') {
    return false
  }

  return value.instructionsPath === undefined || typeof value.instructionsPath === 'string'
}

interface PackageDetailShape extends Record<string, unknown> {
  readonly schemaVersion: string
  readonly package: string
  readonly version: string
  readonly metadata: PackageDetailMetadata
  readonly agents: unknown[]
  readonly flows: unknown[]
  readonly versions: Record<string, unknown>
}

function isPackageDetailShape(value: Record<string, unknown>): value is PackageDetailShape {
  return (
    typeof value.schemaVersion === 'string' &&
    typeof value.package === 'string' &&
    typeof value.version === 'string' &&
    isMetadata(value.metadata) &&
    Array.isArray(value.agents) &&
    Array.isArray(value.flows) &&
    isRecord(value.versions)
  )
}

export const isPackageDetailDocument = (value: unknown): value is PackageDetailDocument => {
  if (!isRecord(value) || !isPackageDetailShape(value) || !hasOptionalDetailFields(value)) {
    return false
  }

  const { latest, entries } = value.versions
  if (typeof latest !== 'string' || !Array.isArray(entries)) {
    return false
  }

  return (
    value.agents.every((entry) => isDetailEntry(entry, value.package, value.version)) &&
    value.flows.every((entry) => isDetailEntry(entry, value.package, value.version)) &&
    entries.every(isVersionEntry)
  )
}
