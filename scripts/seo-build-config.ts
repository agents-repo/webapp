import { loadEnv } from 'vite'
import { getSiteRoutePaths } from '../src/modules/site/presentation/routes/siteRoutes.ts'

const defaultSiteOrigin = 'https://agents-repo.org'

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

export { getSiteRoutePaths }
