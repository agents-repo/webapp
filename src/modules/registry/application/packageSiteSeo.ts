import type { AppLocale } from '../../site/application/i18n/supportedLocales.ts'
import { defaultAppLocale } from '../../site/application/i18n/supportedLocales.ts'
import enSeo from '../../../locales/en/seo.json' with { type: 'json' }
import esSeo from '../../../locales/es/seo.json' with { type: 'json' }
import ptBrSeo from '../../../locales/pt-BR/seo.json' with { type: 'json' }
import ptPtSeo from '../../../locales/pt-PT/seo.json' with { type: 'json' }
import type { RegistryCatalog, RegistryPackage } from '../domain/package.ts'
import {
  findRegistryPackage,
  namespaceExistsInCatalog,
  parsePackageSitePath,
  type PackageSiteRoute,
} from './packageSiteRoutes.ts'
import { buildRegistryPackageBrowseUrl } from '../infrastructure/registrySourceUrl.ts'

export const PACKAGE_SEO_DESCRIPTION_MAX_LENGTH = 160

type PackageSeoBundle = typeof enSeo

const seoByLocale: Record<AppLocale, PackageSeoBundle> = {
  en: enSeo,
  es: esSeo,
  'pt-BR': ptBrSeo,
  'pt-PT': ptPtSeo,
}

function getSeoBundle(locale: AppLocale): PackageSeoBundle {
  return seoByLocale[locale] ?? seoByLocale[defaultAppLocale]
}

function interpolateSeoTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  )
}

export function clampSeoDescription(
  value: string,
  maxLength = PACKAGE_SEO_DESCRIPTION_MAX_LENGTH,
): string {
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) {
    return trimmed
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`
}

export function getPackagesIndexSeoDescription(locale: AppLocale = defaultAppLocale): string {
  const bundle = getSeoBundle(locale)
  const fallbackBundle = seoByLocale[defaultAppLocale]

  return bundle.packages.description ?? fallbackBundle.packages.description
}

export function getNamespacePackagesSeoDescription(
  namespace: string,
  locale: AppLocale = defaultAppLocale,
): string {
  const bundle = getSeoBundle(locale)
  const fallbackBundle = seoByLocale[defaultAppLocale]
  const template =
    bundle.namespacePackages.description ?? fallbackBundle.namespacePackages.description

  return clampSeoDescription(interpolateSeoTemplate(template, { namespace }))
}

export function getPackageDetailSeoDescription(pkg: RegistryPackage): string {
  return clampSeoDescription(pkg.description)
}

export function getPackageSitePageTitle(
  route: PackageSiteRoute,
  catalog: RegistryCatalog | null,
  locale: AppLocale = defaultAppLocale,
): string {
  const bundle = getSeoBundle(locale)
  const fallbackBundle = seoByLocale[defaultAppLocale]

  if (route.kind === 'index') {
    return bundle.packages.title ?? fallbackBundle.packages.title
  }

  if (route.kind === 'namespace') {
    const template =
      bundle.namespacePackages.title ?? fallbackBundle.namespacePackages.title

    return interpolateSeoTemplate(template, { namespace: route.namespace })
  }

  const pkg = catalog ? findRegistryPackage(catalog, route.namespace, route.packageId) : undefined
  return pkg?.name ?? route.packageId
}

export function getPackageSiteSeoDescription(
  route: PackageSiteRoute,
  catalog: RegistryCatalog | null,
  locale: AppLocale = defaultAppLocale,
): string {
  if (route.kind === 'index') {
    return getPackagesIndexSeoDescription(locale)
  }

  if (route.kind === 'namespace') {
    return getNamespacePackagesSeoDescription(route.namespace, locale)
  }

  const pkg = catalog ? findRegistryPackage(catalog, route.namespace, route.packageId) : undefined
  if (pkg) {
    return getPackageDetailSeoDescription(pkg)
  }

  const bundle = getSeoBundle(locale)
  const fallbackBundle = seoByLocale[defaultAppLocale]
  const template =
    bundle.packageDetailFallback.description ?? fallbackBundle.packageDetailFallback.description

  return clampSeoDescription(
    interpolateSeoTemplate(template, {
      namespace: route.namespace,
      packageId: route.packageId,
    }),
  )
}

export function getPackageCodeRepositoryUrl(
  githubRepositoryUrl: string,
  namespace: string,
  packageId: string,
): string | null {
  return buildRegistryPackageBrowseUrl(githubRepositoryUrl, namespace, packageId)
}

export function shouldIndexPackageSitePath(
  pathname: string,
  catalog: RegistryCatalog | null,
  catalogResolved: boolean,
): boolean {
  const parsed = parsePackageSitePath(pathname)
  if (parsed === undefined) {
    return false
  }

  if (parsed.kind === 'index') {
    return true
  }

  if (!catalogResolved) {
    return true
  }

  if (catalog === null) {
    return false
  }

  if (parsed.kind === 'namespace') {
    return namespaceExistsInCatalog(catalog, parsed.namespace)
  }

  return findRegistryPackage(catalog, parsed.namespace, parsed.packageId) !== undefined
}
