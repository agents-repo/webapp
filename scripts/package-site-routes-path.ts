import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDir = dirname(fileURLToPath(import.meta.url))

export const GENERATED_PACKAGE_SITE_ROUTES_PATH = resolve(
  scriptsDir,
  '.generated/package-site-routes.json',
)

export const GENERATED_PACKAGE_SITE_CATALOG_PATH = resolve(
  scriptsDir,
  '.generated/package-site-catalog.json',
)
