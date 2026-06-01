import type { RegistryCatalog, RegistryPackage } from '../domain/package'

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

const isEstimateOverallCost = (
  value: unknown,
): value is RegistryPackage['estimateOverallCost'] => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.estimatedCost === 'number' &&
    (value.band === 'low' || value.band === 'moderate' || value.band === 'high')
  )
}

const hasRegistryPackageStrings = (value: Record<string, unknown>): boolean => {
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.owner === 'string' &&
    typeof value.latest === 'string' &&
    typeof value.category === 'string'
  )
}

const isRegistryPackage = (value: unknown): value is RegistryPackage => {
  if (!isRecord(value)) {
    return false
  }

  if (!hasRegistryPackageStrings(value)) {
    return false
  }

  if (!isStringArray(value.tags)) {
    return false
  }

  if (value.status !== 'active' && value.status !== 'inactive') {
    return false
  }

  if (!isEstimateOverallCost(value.estimateOverallCost)) {
    return false
  }

  return value.quickstart === undefined || typeof value.quickstart === 'string'
}

export const isRegistryCatalog = (value: unknown): value is RegistryCatalog => {
  if (!isRecord(value)) {
    return false
  }

  if (typeof value.schemaVersion !== 'string' || typeof value.updatedAt !== 'string') {
    return false
  }

  return Array.isArray(value.packages) && value.packages.every((pkg) => isRegistryPackage(pkg))
}
