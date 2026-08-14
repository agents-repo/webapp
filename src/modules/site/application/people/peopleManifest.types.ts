export type PersonProjectRole = 'maintainer' | 'contributor'

export interface PersonProjectTag {
  readonly repositorySlug: string
  readonly role: PersonProjectRole
}

export interface PersonEntry {
  readonly githubLogin: string
  readonly displayName: string
  readonly projects: readonly PersonProjectTag[]
}
