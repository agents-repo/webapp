import { getGuideCatalogEntry, guideCatalog } from './guideCatalog.ts'
import type { GuideManifestEntry, GuideSectionGroup } from './guideManifest.types.ts'
import { readFrontmatterScalar, splitGuideMarkdown } from './parseGuideMarkdown.ts'

const guideRawModules = import.meta.glob('../../../../content/guide/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function slugFromModulePath(modulePath: string): string {
  const match = /\/([^/]+)\.md$/.exec(modulePath)
  if (!match?.[1]) {
    throw new Error(`Invalid guide module path: ${modulePath}`)
  }

  return match[1]
}

function buildGuideEntries(): readonly GuideManifestEntry[] {
  const entries: GuideManifestEntry[] = []

  for (const [modulePath, raw] of Object.entries(guideRawModules)) {
    if (typeof raw !== 'string') {
      throw new TypeError(`Guide module ${modulePath} did not load as raw text`)
    }

    const slug = slugFromModulePath(modulePath)
    const catalogEntry = getGuideCatalogEntry(slug)
    if (!catalogEntry) {
      throw new Error(`Guide markdown ${slug} is missing from guideCatalog.ts`)
    }

    const { frontmatter, body } = splitGuideMarkdown(raw)
    const frontmatterTitle = readFrontmatterScalar(frontmatter, 'title')
    const frontmatterDescription = readFrontmatterScalar(frontmatter, 'description')
    const frontmatterSection = readFrontmatterScalar(frontmatter, 'section')
    const frontmatterOrder = Number(readFrontmatterScalar(frontmatter, 'order'))

    if (
      frontmatterTitle !== catalogEntry.title ||
      frontmatterDescription !== catalogEntry.description ||
      frontmatterSection !== catalogEntry.section ||
      frontmatterOrder !== catalogEntry.order
    ) {
      throw new Error(`Guide ${slug} frontmatter does not match guideCatalog.ts`)
    }

    entries.push({
      ...catalogEntry,
      bodyMarkdown: body,
    })
  }

  if (entries.length !== guideCatalog.length) {
    throw new Error('Guide markdown file count does not match guideCatalog.ts')
  }

  return entries.sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
}

const guideEntries = buildGuideEntries()
const guideBySlug = new Map(guideEntries.map((entry) => [entry.slug, entry]))

export { GUIDE_BASE_PATH, getGuideDetailPath, getGuideRoutePaths, getGuideSlugs } from './guideCatalog.ts'

export function listGuideManifestEntries(): readonly GuideManifestEntry[] {
  return guideEntries
}

export function getGuideBySlug(slug: string): GuideManifestEntry | undefined {
  return guideBySlug.get(slug)
}

export function listGuideSectionGroups(): readonly GuideSectionGroup[] {
  const sectionOrder: string[] = []
  const bySection = new Map<string, GuideManifestEntry[]>()

  for (const entry of guideEntries) {
    if (!bySection.has(entry.section)) {
      bySection.set(entry.section, [])
      sectionOrder.push(entry.section)
    }

    bySection.get(entry.section)?.push(entry)
  }

  return sectionOrder.map((section) => ({
    section,
    entries: bySection.get(section) ?? [],
  }))
}
