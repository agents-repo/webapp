import {
  loadPackageSiteCatalogForBuild,
  parsePrefetchModeArg,
  writePackageSiteBuildSnapshot,
} from './prefetch-package-site-routes-lib.mjs'

const mode = parsePrefetchModeArg()
const catalog = await loadPackageSiteCatalogForBuild(mode)
const routes = writePackageSiteBuildSnapshot(catalog)
console.log(`Wrote ${routes.length} package site routes to scripts/.generated/package-site-routes.json`)
