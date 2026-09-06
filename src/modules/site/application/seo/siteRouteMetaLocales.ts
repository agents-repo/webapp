import enSeo from '../../../../locales/en/seo.json' with { type: 'json' }
import esSeo from '../../../../locales/es/seo.json' with { type: 'json' }
import ptBrSeo from '../../../../locales/pt-BR/seo.json' with { type: 'json' }
import ptPtSeo from '../../../../locales/pt-PT/seo.json' with { type: 'json' }
import { siteRoutes, type SiteRoutePath } from '../../presentation/routes/siteRoutes.ts'
import type { AppLocale } from '../i18n/supportedLocales.ts'
import { defaultAppLocale } from '../i18n/supportedLocales.ts'

export type SiteRouteMetaKey = keyof typeof enSeo

export interface LocalizedSiteRouteMeta {
  readonly title: string
  readonly routeLabel: string
  readonly description?: string
}

const seoByLocale: Record<AppLocale, Record<SiteRouteMetaKey, LocalizedSiteRouteMeta>> = {
  en: enSeo,
  es: esSeo,
  'pt-BR': ptBrSeo,
  'pt-PT': ptPtSeo,
}

const routeMetaKeyByPath: Record<SiteRoutePath, SiteRouteMetaKey> = {
  [siteRoutes.home]: 'home',
  [siteRoutes.packages]: 'packages',
  [siteRoutes.about]: 'about',
  [siteRoutes.community]: 'community',
  [siteRoutes.contact]: 'contact',
  [siteRoutes.helpUs]: 'helpUs',
  [siteRoutes.docs]: 'docs',
  [siteRoutes.repositories]: 'repositories',
  [siteRoutes.accessibility]: 'accessibility',
  [siteRoutes.privacy]: 'privacy',
}

function getSeoBundle(locale: AppLocale): Record<SiteRouteMetaKey, LocalizedSiteRouteMeta> {
  return seoByLocale[locale] ?? seoByLocale[defaultAppLocale]
}

export function getLocalizedSiteRouteMeta(
  locale: AppLocale,
  route: SiteRoutePath,
): LocalizedSiteRouteMeta {
  const metaKey = routeMetaKeyByPath[route]
  const bundle = getSeoBundle(locale)
  const fallbackBundle = seoByLocale[defaultAppLocale]

  return bundle[metaKey] ?? fallbackBundle[metaKey]
}

export function getLocalizedSiteRouteMetaByKey(
  locale: AppLocale,
  metaKey: SiteRouteMetaKey,
): LocalizedSiteRouteMeta {
  const bundle = getSeoBundle(locale)
  const fallbackBundle = seoByLocale[defaultAppLocale]

  return bundle[metaKey] ?? fallbackBundle[metaKey]
}
