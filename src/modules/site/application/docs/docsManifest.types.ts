export interface DocManifestEntry {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly order: number
  readonly section: string
  readonly bodyMarkdown: string
}

export interface DocSectionGroup {
  readonly section: string
  readonly entries: readonly DocManifestEntry[]
}
