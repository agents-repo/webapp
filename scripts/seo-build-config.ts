import { existsSync, readFileSync } from 'node:fs'
import { loadEnv } from 'vite'
import { getSiteRoutePaths as getStaticAndManifestSiteRoutePaths } from '../src/modules/site/presentation/routes/siteRoutes.ts'
import { GENERATED_PACKAGE_SITE_CATALOG_PATH, GENERATED_PACKAGE_SITE_ROUTES_PATH } from './package-site-routes-path.ts'

export { getSiteRoutePaths } from '../src/modules/site/presentation/routes/siteRoutes.ts'

const defaultSiteOrigin = 'https://agents-repo.org'

export function readGeneratedPackageSiteRoutes(): string[] {
  if (!existsSync(GENERATED_PACKAGE_SITE_ROUTES_PATH)) {
    return []
  }

  const parsed: unknown = JSON.parse(readFileSync(GENERATED_PACKAGE_SITE_ROUTES_PATH, 'utf8'))
  if (!Array.isArray(parsed)) {
    throw new TypeError('scripts/.generated/package-site-routes.json must be a JSON array of strings')
  }

  const routes: string[] = []
  for (const item of parsed) {
    if (typeof item !== 'string') {
      throw new TypeError('scripts/.generated/package-site-routes.json must be a JSON array of strings')
    }
    routes.push(item)
  }

  return routes
}

export function getBuildSiteRoutePaths(): string[] {
  return [...getStaticAndManifestSiteRoutePaths(), ...readGeneratedPackageSiteRoutes()]
}

export function readGeneratedPackageSiteCatalog(): unknown {
  if (!existsSync(GENERATED_PACKAGE_SITE_CATALOG_PATH)) {
    return null
  }

  return JSON.parse(readFileSync(GENERATED_PACKAGE_SITE_CATALOG_PATH, 'utf8'))
}

export function resolveViteSiteUrl(mode = process.env.MODE ?? 'production'): string | undefined {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const fromEnvFile = env.VITE_SITE_URL?.trim()
  const fromProcess = process.env.VITE_SITE_URL?.trim()

  return fromProcess || fromEnvFile
}

export function resolveBuildSiteOrigin(mode = process.env.MODE ?? 'production'): string {
  const fromEnv = resolveViteSiteUrl(mode)
  return fromEnv && fromEnv.length > 0 ? fromEnv.replace(/\/$/, '') : defaultSiteOrigin
}
