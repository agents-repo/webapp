import { loadEnv } from 'vite'
import { getSiteRoutePaths } from '../src/modules/site/presentation/routes/siteRoutes.ts'

const defaultSiteOrigin = 'https://agents-repo.org'

export function resolveBuildSiteOrigin(mode = process.env.MODE ?? 'production'): string {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const fromEnv = env.VITE_SITE_URL?.trim()
  return fromEnv && fromEnv.length > 0 ? fromEnv.replace(/\/$/, '') : defaultSiteOrigin
}

export { getSiteRoutePaths }
