export interface GuideManifestEntry {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly order: number
  readonly section: string
  readonly bodyMarkdown: string
}

export interface GuideSectionGroup {
  readonly section: string
  readonly entries: readonly GuideManifestEntry[]
}
