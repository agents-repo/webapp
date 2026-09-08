import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import i18n from '../src/modules/site/application/i18n/i18n.ts'
import { localeDefinitions } from '../src/modules/site/application/i18n/supportedLocales.ts'

const localesDir = join(dirname(fileURLToPath(import.meta.url)), '../src/locales')

for (const definition of localeDefinitions) {
  const pagesPath = join(localesDir, definition.id, 'pages.json')
  const pages = JSON.parse(readFileSync(pagesPath, 'utf8')) as Record<string, unknown>
  i18n.addResourceBundle(definition.id, 'pages', pages, true, true)
}
