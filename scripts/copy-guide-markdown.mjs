import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { resolveBuildSiteOrigin } from './seo-build-config.ts'

const modeArgIndex = process.argv.indexOf('--mode')
const mode = modeArgIndex >= 0 ? process.argv[modeArgIndex + 1] : (process.env.MODE ?? 'production')

const guideSourceDir = join(process.cwd(), 'src/content/guide')
const distGuideDir = join(process.cwd(), 'dist/guide')
const distRoot = join(process.cwd(), 'dist')

const siteOrigin = resolveBuildSiteOrigin(mode)

mkdirSync(distGuideDir, { recursive: true })

const markdownFiles = readdirSync(guideSourceDir).filter((name) => name.endsWith('.md'))
const llmsLines = ['# Agents Repo guides', '', 'Stable markdown URLs for agents and tooling:', '']

for (const fileName of markdownFiles) {
  const slug = fileName.replace(/\.md$/, '')
  copyFileSync(join(guideSourceDir, fileName), join(distGuideDir, fileName))
  llmsLines.push(`${siteOrigin}/guide/${slug}.md`)
}

llmsLines.push('')
writeFileSync(join(distRoot, 'llms.txt'), `${llmsLines.join('\n')}\n`, 'utf8')

console.log(`Copied ${markdownFiles.length} guide markdown files to dist/guide/`)
