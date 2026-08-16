import {
  findSiteRoutePath,
  normalizeSitePathname,
  siteRoutes,
  type SiteRoutePath,
} from '../../presentation/routes/siteRoutes.ts'
import {
  getDocDetailPath,
  getDocCatalogEntry,
} from '../docs/docsCatalog.ts'
import { isUnlistedDocDetailPath, parseDocSlugFromPathname } from '../docs/docsNestedSiteRoutes.ts'
import {
  getRepositoryDetailPath,
  isUnlistedRepositoryDetailPath,
  parseRepositorySlugFromPathname,
} from '../nestedSiteRoutes.ts'
import { getRepositoryBySlug } from '../repositories/repositoryManifest.ts'
import {
  getNamespacePackagesPath,
  getPackageDetailPath,
  isUnlistedPackageSitePath,
  parsePackageSitePath,
  type PackageSiteRoute,
} from '../../../registry/application/packageSiteRoutes.ts'
import {
  getPackageSiteSeoDescription,
  getPackagesIndexSeoDescription,
} from '../../../registry/application/packageSiteSeo.ts'
import {
  getRuntimePackageCatalog,
  isRuntimePackageCatalogResolved,
} from '../../../registry/application/runtimePackageCatalog.ts'
import type { RegistryCatalog } from '../../../registry/domain/package.ts'

export type { SiteRoutePath } from '../../presentation/routes/siteRoutes.ts'
export { getSiteRoutePaths, isKnownSiteRoute } from '../../presentation/routes/siteRoutes.ts'

export interface SiteSeoMeta {
  readonly description: string
  readonly canonicalPath: string
}

export const siteSeoMeta: Record<SiteRoutePath, SiteSeoMeta> = {
  [siteRoutes.home]: {
    description:
      'Browse agents and flows for GitHub Copilot, Cursor, Claude Code, and OpenAI Codex from the open registry.',
    canonicalPath: siteRoutes.home,
  },
  [siteRoutes.packages]: {
    description: getPackagesIndexSeoDescription(),
    canonicalPath: siteRoutes.packages,
  },
  [siteRoutes.about]: {
    description:
      'Learn about Agents Repo: browse curated agents and flows for GitHub Copilot, Cursor, Claude Code, and OpenAI Codex.',
    canonicalPath: siteRoutes.about,
  },
  [siteRoutes.community]: {
    description:
      'Meet Agents Repo maintainers and contributors, and see who maintains the platform repositories.',
    canonicalPath: siteRoutes.community,
  },
  [siteRoutes.contact]: {
    description:
      'Contact Agents Repo through GitHub Discussions and Issues for tracked work, or join X and Reddit for community discussion and ideas.',
    canonicalPath: siteRoutes.contact,
  },
  [siteRoutes.helpUs]: {
    description:
      'Help improve the open agents registry. Contribute packages for GitHub Copilot, Cursor, Claude Code, and OpenAI Codex.',
    canonicalPath: siteRoutes.helpUs,
  },
  [siteRoutes.docs]: {
    description:
      'Docs for browsing the catalog, installing packages with the CLI, contributing to the registry, and downloading markdown for AI agents.',
    canonicalPath: siteRoutes.docs,
  },
  [siteRoutes.repositories]: {
    description:
      'Repositories in the agents-repo organization: registry, webapp, CLI, registry-proxy, and shared governance.',
    canonicalPath: siteRoutes.repositories,
  },
  [siteRoutes.accessibility]: {
    description:
      'Accessibility statement and conformance report for Agents Repo, targeting WCAG 2.2 Level AA.',
    canonicalPath: siteRoutes.accessibility,
  },
  [siteRoutes.privacy]: {
    description:
      'Privacy policy for Agents Repo: data collection, cookies, analytics consent, and your rights in the EU, US, and Brazil.',
    canonicalPath: siteRoutes.privacy,
  },
  [siteRoutes.privacyPtBr]: {
    description:
      'Política de privacidade do Agents Repo: coleta de dados, cookies, consentimento de analytics e seus direitos.',
    canonicalPath: siteRoutes.privacyPtBr,
  },
}

function getPackageCanonicalPath(route: PackageSiteRoute): string {
  if (route.kind === 'index') {
    return siteRoutes.packages
  }

  if (route.kind === 'namespace') {
    return getNamespacePackagesPath(route.namespace)
  }

  return getPackageDetailPath(route.namespace, route.packageId)
}

export function getSiteSeoMeta(
  pathname: string,
  catalog: RegistryCatalog | null = getRuntimePackageCatalog(),
  catalogResolved = isRuntimePackageCatalogResolved(),
): SiteSeoMeta {
  const normalizedPath = normalizeSitePathname(pathname)
  const matchedRoute = findSiteRoutePath(normalizedPath)

  if (matchedRoute) {
    return siteSeoMeta[matchedRoute]
  }

  const repositorySlug = parseRepositorySlugFromPathname(normalizedPath)
  if (repositorySlug) {
    const entry = getRepositoryBySlug(repositorySlug)
    if (entry) {
      return {
        description: entry.description,
        canonicalPath: getRepositoryDetailPath(repositorySlug),
      }
    }
  }

  const docSlug = parseDocSlugFromPathname(normalizedPath)
  if (docSlug) {
    const doc = getDocCatalogEntry(docSlug)
    if (doc) {
      return {
        description: doc.description,
        canonicalPath: getDocDetailPath(docSlug),
      }
    }
  }

  const packageRoute = parsePackageSitePath(normalizedPath)
  if (packageRoute) {
    return {
      description: getPackageSiteSeoDescription(packageRoute, catalog),
      canonicalPath: getPackageCanonicalPath(packageRoute),
    }
  }

  if (isUnlistedPackageSitePath(normalizedPath, catalog, catalogResolved)) {
    return siteSeoMeta[siteRoutes.packages]
  }

  if (isUnlistedDocDetailPath(normalizedPath)) {
    return siteSeoMeta[siteRoutes.docs]
  }

  if (isUnlistedRepositoryDetailPath(normalizedPath)) {
    return siteSeoMeta[siteRoutes.repositories]
  }

  return siteSeoMeta[siteRoutes.home]
}
