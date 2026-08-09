import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { resolveBuildSiteOrigin } from './seo-build-config.ts'

const modeArgIndex = process.argv.indexOf('--mode')
const mode = modeArgIndex >= 0 ? process.argv[modeArgIndex + 1] : (process.env.MODE ?? 'production')

const docSourceDir = join(process.cwd(), 'src/content/docs')
const distDocsDir = join(process.cwd(), 'dist/docs')
const distRoot = join(process.cwd(), 'dist')

const siteOrigin = resolveBuildSiteOrigin(mode)

mkdirSync(distDocsDir, { recursive: true })

const markdownFiles = readdirSync(docSourceDir).filter((name) => name.endsWith('.md'))
const llmsLines = ['# Agents Repo docs', '', 'Stable markdown URLs for agents and tooling:', '']

for (const fileName of markdownFiles) {
  const slug = fileName.replace(/\.md$/, '')
  copyFileSync(join(docSourceDir, fileName), join(distDocsDir, fileName))
  llmsLines.push(`${siteOrigin}/docs/${slug}.md`)
}

llmsLines.push('')
writeFileSync(join(distRoot, 'llms.txt'), `${llmsLines.join('\n')}\n`, 'utf8')

console.log(`Copied ${markdownFiles.length} doc markdown files to dist/docs/`)
