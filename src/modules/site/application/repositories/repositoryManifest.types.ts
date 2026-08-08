export type RepositoryRole = 'data' | 'ui' | 'tooling' | 'infrastructure' | 'governance'

export interface RepositoryGuideLink {
  readonly path: string
  readonly label: string
}

export interface RepositoryManifestEntry {
  readonly slug: string
  readonly name: string
  readonly description: string
  readonly role: RepositoryRole
  readonly homepage: string
  readonly repository: string
  readonly contributing: string
  readonly issues: string
  readonly discussions?: string
  readonly security?: string
  readonly tags: readonly string[]
  readonly stack: readonly string[]
  readonly relationship: string
  readonly audience: string
  readonly quickstart?: string
  readonly guideLinks?: readonly RepositoryGuideLink[]
}
