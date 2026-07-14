/* eslint-disable sonarjs/no-os-command-from-path -- integration test shells out to npm run build:pages */
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { before, describe, it } from 'node:test'
import { getSiteOrigin } from '../src/modules/site/application/seo/siteSeo.ts'
import { getSiteRoutePaths } from '../src/modules/site/presentation/routes/siteRoutes.ts'

const distDir = resolve(process.cwd(), 'dist')
const siteOrigin = getSiteOrigin('https://agents-repo.org')

describe('crawl files integration', () => {
  before(() => {
    execSync('npm run build:pages', {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '0' },
    })
  })

  it('writes sitemap.xml with all public routes', () => {
    const xml = readFileSync(resolve(distDir, 'sitemap.xml'), 'utf8')
    const routes = getSiteRoutePaths()

    for (const route of routes) {
      const loc = route === '/' ? `${siteOrigin}/` : `${siteOrigin}${route}`
      assert.ok(xml.includes(`<loc>${loc}</loc>`))
    }

    assert.equal(xml.match(/<url>/g)?.length, routes.length)
    assert.ok(xml.includes('<priority>1.0</priority>'))
    assert.ok(xml.includes('<priority>0.8</priority>'))
    assert.ok(xml.includes('<changefreq>monthly</changefreq>'))
  })

  it('writes robots.txt with sitemap reference', () => {
    const robots = readFileSync(resolve(distDir, 'robots.txt'), 'utf8')

    assert.ok(robots.includes('User-agent: *'))
    assert.ok(robots.includes('Allow: /'))
    assert.ok(robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`))
  })
})
