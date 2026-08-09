import { docsCatalog, getDocCatalogEntry } from './docsCatalog.ts'
import type { DocManifestEntry, DocSectionGroup } from './docsManifest.types.ts'
import { readFrontmatterScalar, splitDocMarkdown } from './parseDocMarkdown.ts'

const docRawModules = import.meta.glob('../../../../content/docs/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function slugFromModulePath(modulePath: string): string {
  const match = /\/([^/]+)\.md$/.exec(modulePath)
  if (!match?.[1]) {
    throw new Error(`Invalid doc module path: ${modulePath}`)
  }

  return match[1]
}

function buildDocEntries(): readonly DocManifestEntry[] {
  const entries: DocManifestEntry[] = []

  for (const [modulePath, raw] of Object.entries(docRawModules)) {
    if (typeof raw !== 'string') {
      throw new TypeError(`Doc module ${modulePath} did not load as raw text`)
    }

    const slug = slugFromModulePath(modulePath)
    const catalogEntry = getDocCatalogEntry(slug)
    if (!catalogEntry) {
      throw new Error(`Doc markdown ${slug} is missing from docsCatalog.ts`)
    }

    const { frontmatter, body } = splitDocMarkdown(raw)
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
      throw new Error(`Doc ${slug} frontmatter does not match docsCatalog.ts`)
    }

    entries.push({
      ...catalogEntry,
      bodyMarkdown: body,
    })
  }

  if (entries.length !== docsCatalog.length) {
    throw new Error('Doc markdown file count does not match docsCatalog.ts')
  }

  return entries.sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
}

const docEntries = buildDocEntries()
const docBySlug = new Map(docEntries.map((entry) => [entry.slug, entry]))

export { DOCS_BASE_PATH, getDocDetailPath, getDocRoutePaths, getDocSlugs } from './docsCatalog.ts'

export function listDocManifestEntries(): readonly DocManifestEntry[] {
  return docEntries
}

export function getDocBySlug(slug: string): DocManifestEntry | undefined {
  return docBySlug.get(slug)
}

export function listDocSectionGroups(): readonly DocSectionGroup[] {
  const sectionOrder: string[] = []
  const bySection = new Map<string, DocManifestEntry[]>()

  for (const entry of docEntries) {
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
