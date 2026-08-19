import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import {
  resolveBuildSiteOrigin,
  resolveViteSiteUrl,
  rewriteSitemapLocsToPublicPaths,
} from '../scripts/seo-build-config.ts'
import { previewTestOrigin } from '../scripts/crawl-file-origins.mjs'

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

  it('falls back to the default origin when no env value is set', () => {
    assert.equal(resolveBuildSiteOrigin('no-env-file-mode'), productionOrigin)
    assert.equal(resolveViteSiteUrl('no-env-file-mode'), undefined)
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
})
