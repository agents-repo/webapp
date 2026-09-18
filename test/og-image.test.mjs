import test from 'node:test'
import assert from 'node:assert/strict'
import { OG_HEIGHT, OG_WIDTH } from '../scripts/og/constants.mjs'
import { ROUTE_OG_ARTIFACTS } from '../scripts/og/routes.mjs'
import {
  ogImageHeight,
  ogImageWidth,
  routeOgImagePathByCanonicalPath,
} from '../src/modules/site/application/seo/siteSeo.ts'
import { siteRoutes } from '../src/modules/site/presentation/routes/siteRoutes.ts'

test('OG constants match siteSeo dimensions', () => {
  assert.equal(OG_WIDTH, ogImageWidth)
  assert.equal(OG_HEIGHT, ogImageHeight)
  assert.equal(ogImageWidth, 1200)
  assert.equal(ogImageHeight, 630)
})

test('route OG public paths are unique and live under /og/', () => {
  const paths = Object.values(routeOgImagePathByCanonicalPath)
  assert.equal(new Set(paths).size, paths.length)
  for (const publicPath of paths) {
    assert.match(publicPath, /^\/og\/[a-z-]+\.jpg$/)
  }
  assert.equal(routeOgImagePathByCanonicalPath[siteRoutes.home], '/og/home.jpg')
  assert.equal(routeOgImagePathByCanonicalPath[siteRoutes.packages], '/og/packages.jpg')
  assert.equal(routeOgImagePathByCanonicalPath[siteRoutes.docs], '/og/docs.jpg')
  assert.equal(ROUTE_OG_ARTIFACTS.length, 3)

  const canonicalPathByArtifactId = {
    home: siteRoutes.home,
    packages: siteRoutes.packages,
    docs: siteRoutes.docs,
  }
  for (const { id, jpegFile } of ROUTE_OG_ARTIFACTS) {
    const canonicalPath = canonicalPathByArtifactId[id]
    assert.ok(canonicalPath, `missing canonical path mapping for OG artifact id: ${id}`)
    assert.equal(
      routeOgImagePathByCanonicalPath[canonicalPath],
      `/og/${jpegFile}`,
      `siteSeo path must match scripts manifest for ${id}`,
    )
  }
})
