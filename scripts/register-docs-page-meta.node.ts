import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerDocPageMetaResolver } from '../src/modules/site/application/docs/docsPageMeta.ts'
import { getDocCatalogEntry } from '../src/modules/site/application/docs/docsCatalog.ts'
import { readFrontmatterScalar, splitDocMarkdown } from '../src/modules/site/application/docs/parseDocMarkdown.ts'
import type { AppLocale } from '../src/modules/site/application/i18n/supportedLocales.ts'
import { localeDefinitions } from '../src/modules/site/application/i18n/supportedLocales.ts'

const contentDocsDir = join(dirname(fileURLToPath(import.meta.url)), '../src/content/docs')

function readLocalizedDocPageMeta(
  locale: AppLocale,
  slug: string,
): { title: string; description: string } | undefined {
  const definition = localeDefinitions.find((entry) => entry.id === locale)
  if (!definition?.urlSlug) {
    return undefined
  }

  const markdownPath = join(contentDocsDir, definition.urlSlug, `${slug}.md`)
  if (!existsSync(markdownPath)) {
    return undefined
  }

  const raw = readFileSync(markdownPath, 'utf8')
  const { frontmatter } = splitDocMarkdown(raw)
  const catalogEntry = getDocCatalogEntry(slug)
  const title = readFrontmatterScalar(frontmatter, 'title') || catalogEntry?.title
  const description = readFrontmatterScalar(frontmatter, 'description') || catalogEntry?.description

  if (!title || !description) {
    return undefined
  }

  return { title, description }
}

const localizedMetaByLocale = new Map<AppLocale, Map<string, { title: string; description: string }>>()

for (const definition of localeDefinitions) {
  if (!definition.urlSlug) {
    continue
  }

  const localeDir = join(contentDocsDir, definition.urlSlug)
  if (!existsSync(localeDir)) {
    continue
  }

  const bySlug = new Map<string, { title: string; description: string }>()
  for (const fileName of readdirSync(localeDir)) {
    if (!fileName.endsWith('.md')) {
      continue
    }

    const slug = fileName.replace(/\.md$/, '')
    const meta = readLocalizedDocPageMeta(definition.id, slug)
    if (meta) {
      bySlug.set(slug, meta)
    }
  }

  localizedMetaByLocale.set(definition.id, bySlug)
}

registerDocPageMetaResolver((slug, locale) => localizedMetaByLocale.get(locale)?.get(slug))
