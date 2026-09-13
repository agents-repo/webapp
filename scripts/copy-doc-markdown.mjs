/* eslint-disable security/detect-non-literal-fs-filename -- dist output paths derived from locale doc slugs and content/docs directories */
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { localizedSitePath } from '../src/modules/site/application/i18n/localePath.ts'
import { defaultAppLocale, localeFromUrlSlug } from '../src/modules/site/application/i18n/supportedLocales.ts'
import { normalizeSitePathname } from '../src/modules/site/application/routes/sitePath.ts'
import { buildPackageSiteMarkdownDocument, getPackageSiteMarkdownPublicPath } from '../src/modules/registry/application/packageSiteMarkdown.ts'
import { isRegistryCatalog } from '../src/modules/registry/infrastructure/registryCatalogValidation.ts'
import { resolveBuildSiteOrigin, readGeneratedPackageSiteCatalog, readGeneratedPackageSiteDetails } from './seo-build-config.ts'

const modeArgIndex = process.argv.indexOf('--mode')
const mode = modeArgIndex >= 0 ? process.argv[modeArgIndex + 1] : (process.env.MODE ?? 'production')

const docSourceDir = join(process.cwd(), 'src/content/docs')
const distRoot = join(process.cwd(), 'dist')

const siteOrigin = resolveBuildSiteOrigin(mode)

function docMarkdownPublicPath(slug, locale) {
  const detailPath = `/docs/${slug}`
  const normalizedPath = normalizeSitePathname(localizedSitePath(detailPath, locale))
  return `${normalizedPath}.md`
}

function distPathForDocMarkdown(slug, locale) {
  const publicPath = docMarkdownPublicPath(slug, locale)
  return join(distRoot, ...publicPath.slice(1).split('/'))
}

function copyDocMarkdown(sourcePath, slug, locale, llmsLines) {
  const destinationPath = distPathForDocMarkdown(slug, locale)
  mkdirSync(dirname(destinationPath), { recursive: true })
  copyFileSync(sourcePath, destinationPath)
  llmsLines.push(`${siteOrigin}${docMarkdownPublicPath(slug, locale)}`)
}

const llmsLines = ['# Agents Repo docs', '', 'Stable markdown URLs for agents and tooling:', '']
let copiedCount = 0

for (const entry of readdirSync(docSourceDir, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.md')) {
    const slug = entry.name.replace(/\.md$/, '')
    copyDocMarkdown(join(docSourceDir, entry.name), slug, defaultAppLocale, llmsLines)
    copiedCount += 1
    continue
  }

  if (!entry.isDirectory()) {
    continue
  }

  const locale = localeFromUrlSlug(entry.name)
  if (!locale) {
    continue
  }

  const localeDir = join(docSourceDir, entry.name)
  for (const fileName of readdirSync(localeDir).filter((name) => name.endsWith('.md'))) {
    const slug = fileName.replace(/\.md$/, '')
    copyDocMarkdown(join(localeDir, fileName), slug, locale, llmsLines)
    copiedCount += 1
  }
}

const generatedCatalog = readGeneratedPackageSiteCatalog()
const generatedDetails = readGeneratedPackageSiteDetails()
let packageMarkdownCount = 0

if (generatedCatalog && isRegistryCatalog(generatedCatalog) && generatedDetails) {
  llmsLines.push('', '## Package markdown fallbacks', '')

  for (const pkg of generatedCatalog.packages) {
    const detail = generatedDetails[`${pkg.namespace}/${pkg.package}`]
    if (!detail) {
      throw new Error(`Missing package detail for ${pkg.namespace}/${pkg.package}`)
    }

    const publicPath = getPackageSiteMarkdownPublicPath(pkg.namespace, pkg.package)
    const destinationPath = join(distRoot, ...publicPath.slice(1).split('/'))
    const markdown = buildPackageSiteMarkdownDocument(pkg.namespace, pkg.package, detail, siteOrigin)

    mkdirSync(dirname(destinationPath), { recursive: true })
    writeFileSync(destinationPath, markdown, 'utf8')
    llmsLines.push(`${siteOrigin}${publicPath}`)
    packageMarkdownCount += 1
  }
}

llmsLines.push('')
writeFileSync(join(distRoot, 'llms.txt'), `${llmsLines.join('\n')}\n`, 'utf8')

console.log(`Copied ${copiedCount} doc markdown files into dist/`)
if (packageMarkdownCount > 0) {
  console.log(`Wrote ${packageMarkdownCount} package markdown fallbacks into dist/`)
}
