import {
  loadPackageDetailsForBuild,
  writePackageSiteDetailsSnapshot,
} from './prefetch-package-details-lib.mjs'
import { parsePrefetchModeArg } from './prefetch-package-site-routes-lib.mjs'

const mode = parsePrefetchModeArg()
const details = await loadPackageDetailsForBuild(mode)
writePackageSiteDetailsSnapshot(details)
console.log(`Wrote ${Object.keys(details).length} package details to scripts/.generated/package-site-details.json`)
