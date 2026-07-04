export const PACKAGE_STATUS_VALUES = ['active', 'deprecated', 'archived', 'yanked'] as const
export type PackageStatus = (typeof PACKAGE_STATUS_VALUES)[number]

export const PACKAGE_COST_BANDS = ['minimal', 'low', 'moderate', 'high', 'critical', 'mixed'] as const
export type PackageCostBand = (typeof PACKAGE_COST_BANDS)[number]

export const INSTALL_TARGET_IDS = [
  'github-copilot',
  'claude-code',
  'cursor',
  'openai-codex',
] as const
export type InstallTargetId = (typeof INSTALL_TARGET_IDS)[number]

export const INDEX_INSTALL_TARGET_STATUSES = ['supported', 'experimental'] as const
export type IndexInstallTargetStatus = (typeof INDEX_INSTALL_TARGET_STATUSES)[number]

export interface InstallTargetEntry {
  id: InstallTargetId
  status: IndexInstallTargetStatus
}

export interface RegistryPackage {
  id: string
  namespace: string
  package: string
  path?: string
  name: string
  description: string
  owner: string
  latest: string
  tags: string[]
  status: PackageStatus
  category: string
  estimateOverallCost: {
    estimatedCost?: number
    band: PackageCostBand
  }
  quickstart?: string
  installTargets?: InstallTargetEntry[]
}

export interface RegistryCatalog {
  schemaVersion: string
  updatedAt: string
  aliases?: Record<string, string>
  packages: RegistryPackage[]
}

const isSlugChar = (char: string): boolean => {
  const code = char.charCodeAt(0)
  return (code >= 97 && code <= 122) || (code >= 48 && code <= 57) || char === '-'
}

const encodeSlugSegment = (value: string): string => {
  let encoded = ''
  for (const char of value.trim().toLowerCase()) {
    if (isSlugChar(char)) {
      encoded += char
      continue
    }

    encoded += `_${char.charCodeAt(0).toString(16)}_`
  }

  return encoded.length > 0 ? encoded : 'unknown'
}

export const toPackageSlug = (namespace: string, packageId: string): string => {
  return `${encodeSlugSegment(namespace)}--${encodeSlugSegment(packageId)}`
}

export const resolvePackageRef = (
  idOrLeaf: string,
  aliases?: Record<string, string>,
): string => {
  const trimmed = idOrLeaf.trim()
  if (trimmed.includes('/')) {
    return trimmed
  }

  return aliases?.[trimmed] ?? trimmed
}
