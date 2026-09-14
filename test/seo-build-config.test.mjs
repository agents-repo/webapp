import assert from 'node:assert/strict'
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { GENERATED_PACKAGE_SITE_DETAILS_PATH } from '../scripts/package-site-routes-path.ts'
import {
  expandRoutesWithLocalePrefixes,
  getBuildSitemapPaths,
  readGeneratedPackageSiteDetails,
  resolveBuildSiteOrigin,
  resolveViteSiteUrl,
  rewriteSitemapLocsToPublicPaths,
} from '../scripts/seo-build-config.ts'
import { previewTestOrigin } from '../scripts/crawl-file-origins.mjs'
import { samplePackageDetail } from '../src/test/fixtures/samplePackageDetail.ts'

const productionOrigin = 'https://agents-repo.org'

describe('seo-build-config', () => {
  let previousViteSiteUrl

  beforeEach(() => {
    previousViteSiteUrl = process.env.VITE_SITE_URL
    delete process.env.VITE_SITE_URL
  })

  afterEach(() => {
    if (previousViteSiteUrl === undefined) {
      delete process.env.VITE_SITE_URL
    } else {
      process.env.VITE_SITE_URL = previousViteSiteUrl
    }
  })

  it('resolves production origin from .env.production', () => {
    assert.equal(resolveBuildSiteOrigin('production'), productionOrigin)
    assert.equal(resolveViteSiteUrl('production'), productionOrigin)
  })

  it('prefers shell VITE_SITE_URL over env files', () => {
    process.env.VITE_SITE_URL = previewTestOrigin

    assert.equal(resolveViteSiteUrl('production'), previewTestOrigin)
    assert.equal(resolveBuildSiteOrigin('production'), previewTestOrigin)
  })

  it('strips trailing slashes from the resolved origin', () => {
    process.env.VITE_SITE_URL = 'https://example.test/'

    assert.equal(resolveBuildSiteOrigin('production'), 'https://example.test')
  })

  it('rewrites sitemap locs onto trailing-slash directory URLs', () => {
    const xml = [
      `<url><loc>${productionOrigin}/</loc></url>`,
      `<url><loc>${productionOrigin}/about</loc></url>`,
      `<url><loc>${productionOrigin}/about/</loc></url>`,
      `<url><loc>${productionOrigin}/docs/foo.md</loc></url>`,
    ].join('')

    const rewritten = rewriteSitemapLocsToPublicPaths(xml)

    assert.equal(rewritten.includes(`<loc>${productionOrigin}/</loc>`), true)
    assert.equal(rewritten.includes(`<loc>${productionOrigin}/about/</loc>`), true)
    assert.equal(rewritten.includes(`<loc>${productionOrigin}/about</loc>`), false)
    assert.equal(rewritten.includes(`<loc>${productionOrigin}/docs/foo.md</loc>`), true)
  })

  it('falls back to the default origin when no env value is set', () => {
    assert.equal(resolveBuildSiteOrigin('no-env-file-mode'), productionOrigin)
    assert.equal(resolveViteSiteUrl('no-env-file-mode'), undefined)
  })

  it('expands build routes with locale prefixes', () => {
    const expanded = expandRoutesWithLocalePrefixes(['/', '/about'])

    assert.equal(expanded.includes('/'), true)
    assert.equal(expanded.includes('/about/'), true)
    assert.equal(expanded.includes('/es/'), true)
    assert.equal(expanded.includes('/es/about/'), true)
    assert.equal(expanded.includes('/pt-br/about/'), true)
    assert.equal(getBuildSitemapPaths().length >= expanded.length, true)
  })

  it('validates generated package detail entry shape', () => {
    mkdirSync(dirname(GENERATED_PACKAGE_SITE_DETAILS_PATH), { recursive: true })
    writeFileSync(
      GENERATED_PACKAGE_SITE_DETAILS_PATH,
      JSON.stringify({
        'agents-repo/sample-agent': samplePackageDetail,
      }),
    )

    const details = readGeneratedPackageSiteDetails()
    assert.equal(details?.['agents-repo/sample-agent']?.metadata.name, 'sample-agent')

    writeFileSync(
      GENERATED_PACKAGE_SITE_DETAILS_PATH,
      JSON.stringify({
        'agents-repo/sample-agent': { package: 'agents-repo/sample-agent' },
      }),
    )

    assert.throws(
      () => readGeneratedPackageSiteDetails(),
      /entry "agents-repo\/sample-agent" is not a valid package detail document/,
    )

    unlinkSync(GENERATED_PACKAGE_SITE_DETAILS_PATH)
  })
})
