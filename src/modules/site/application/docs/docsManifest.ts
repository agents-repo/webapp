import type { AppLocale } from '../i18n/supportedLocales.ts'
import { defaultAppLocale, localeFromUrlSlug } from '../i18n/supportedLocales.ts'
import { docsCatalog, getDocCatalogEntry } from './docsCatalog.ts'
import type { DocManifestEntry, DocSectionGroup } from './docsManifest.types.ts'
import { readFrontmatterScalar, splitDocMarkdown } from './parseDocMarkdown.ts'

const englishDocRawModules = import.meta.glob('../../../../content/docs/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const localizedDocRawModules = import.meta.glob('../../../../content/docs/*/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function slugFromEnglishModulePath(modulePath: string): string {
  const match = /\/([^/]+)\.md$/.exec(modulePath)
  if (!match?.[1]) {
    throw new Error(`Invalid doc module path: ${modulePath}`)
  }

  return match[1]
}

function parseLocalizedDocModulePath(modulePath: string): { locale: AppLocale; slug: string } | null {
  const match = /\/content\/docs\/([^/]+)\/([^/]+)\.md$/.exec(modulePath)
  if (!match?.[1] || !match[2]) {
    return null
  }

  const locale = localeFromUrlSlug(match[1])
  if (!locale) {
    return null
  }

  return { locale, slug: match[2] }
}

function buildEnglishDocEntry(modulePath: string, raw: string): DocManifestEntry {
  const slug = slugFromEnglishModulePath(modulePath)
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

  return {
    ...catalogEntry,
    bodyMarkdown: body,
    usesEnglishFallback: false,
  }
}

function buildLocalizedDocEntry(
  locale: AppLocale,
  slug: string,
  raw: string,
): DocManifestEntry {
  const catalogEntry = getDocCatalogEntry(slug)
  if (!catalogEntry) {
    throw new Error(`Localized doc markdown ${slug} is missing from docsCatalog.ts`)
  }

  const { frontmatter, body } = splitDocMarkdown(raw)
  const frontmatterTitle = readFrontmatterScalar(frontmatter, 'title')
  const frontmatterDescription = readFrontmatterScalar(frontmatter, 'description')
  const frontmatterSection = readFrontmatterScalar(frontmatter, 'section')
  const frontmatterOrder = Number(readFrontmatterScalar(frontmatter, 'order'))

  if (frontmatterSection !== catalogEntry.section || frontmatterOrder !== catalogEntry.order) {
    throw new Error(`Localized doc ${locale}/${slug} frontmatter section/order does not match docsCatalog.ts`)
  }

  return {
    slug,
    title: frontmatterTitle ?? catalogEntry.title,
    description: frontmatterDescription ?? catalogEntry.description,
    order: catalogEntry.order,
    section: catalogEntry.section,
    bodyMarkdown: body,
    usesEnglishFallback: false,
  }
}

function buildEnglishDocEntries(): Map<string, DocManifestEntry> {
  const entries = new Map<string, DocManifestEntry>()

  for (const [modulePath, raw] of Object.entries(englishDocRawModules)) {
    if (typeof raw !== 'string') {
      throw new TypeError(`Doc module ${modulePath} did not load as raw text`)
    }

    const entry = buildEnglishDocEntry(modulePath, raw)
    entries.set(entry.slug, entry)
  }

  if (entries.size !== docsCatalog.length) {
    throw new Error('Doc markdown file count does not match docsCatalog.ts')
  }

  return entries
}

function buildLocalizedDocEntries(): Map<AppLocale, Map<string, DocManifestEntry>> {
  const byLocale = new Map<AppLocale, Map<string, DocManifestEntry>>()

  for (const [modulePath, raw] of Object.entries(localizedDocRawModules)) {
    if (typeof raw !== 'string') {
      throw new TypeError(`Localized doc module ${modulePath} did not load as raw text`)
    }

    const parsed = parseLocalizedDocModulePath(modulePath)
    if (!parsed) {
      continue
    }

    const entry = buildLocalizedDocEntry(parsed.locale, parsed.slug, raw)
    let localeEntries = byLocale.get(parsed.locale)
    if (!localeEntries) {
      localeEntries = new Map<string, DocManifestEntry>()
      byLocale.set(parsed.locale, localeEntries)
    }

    localeEntries.set(entry.slug, entry)
  }

  return byLocale
}

const englishDocBySlug = buildEnglishDocEntries()
const localizedDocByLocale = buildLocalizedDocEntries()

export { DOCS_BASE_PATH, getDocDetailPath, getDocRoutePaths, getDocSlugs } from './docsCatalog.ts'

export function listDocManifestEntries(locale: AppLocale = defaultAppLocale): readonly DocManifestEntry[] {
  return docsCatalog
    .map((catalogEntry) => getDocBySlug(catalogEntry.slug, locale))
    .filter((entry): entry is DocManifestEntry => entry !== undefined)
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
}

export function getDocBySlug(slug: string, locale: AppLocale = defaultAppLocale): DocManifestEntry | undefined {
  const englishEntry = englishDocBySlug.get(slug)
  if (!englishEntry) {
    return undefined
  }

  if (locale === defaultAppLocale) {
    return englishEntry
  }

  const localizedEntry = localizedDocByLocale.get(locale)?.get(slug)
  if (localizedEntry) {
    return localizedEntry
  }

  return {
    ...englishEntry,
    usesEnglishFallback: true,
  }
}

export function listDocSectionGroups(locale: AppLocale = defaultAppLocale): readonly DocSectionGroup[] {
  const sectionOrder: string[] = []
  const bySection = new Map<string, DocManifestEntry[]>()

  for (const entry of listDocManifestEntries(locale)) {
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
