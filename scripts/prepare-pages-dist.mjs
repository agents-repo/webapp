import './register-docs-page-meta.node.ts';
import './register-repository-page-locales.node.ts';
import { mkdirSync, readFileSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  injectRouteHeadIntoHtml,
  injectSpaFallbackHeadIntoHtml,
  injectLegacyDomainRedirectIntoHtml,
} from '../src/modules/site/application/seo/buildRouteHead.ts';
import { stripLocalePrefix } from '../src/modules/site/application/i18n/localePath.ts';
import { injectRouteBodyFallbackIntoHtml } from '../src/modules/site/application/seo/routeBodyFallback.ts';
import { parsePackageSitePath } from '../src/modules/registry/application/packageSiteRoutes.ts';
import { isRegistryCatalog } from '../src/modules/registry/infrastructure/registryCatalogValidation.ts';
import { setRuntimePackageCatalog } from '../src/modules/registry/application/runtimePackageCatalog.ts';
import {
  getBuildSitemapPaths,
  readGeneratedPackageSiteCatalog,
  readGeneratedPackageSiteDetails,
  resolveBuildSiteOrigin,
  rewriteSitemapLocsToPublicPaths,
} from './seo-build-config.ts';
import {
  parsePrefetchModeArg,
  resolveConfiguredIndexUrl,
} from './prefetch-package-site-routes-lib.mjs';

const distDir = resolve(process.cwd(), 'dist');
const e2eBuildMarkerPath = resolve(distDir, 'e2e-build-marker.json');

if (existsSync(e2eBuildMarkerPath)) {
  unlinkSync(e2eBuildMarkerPath);
}

const mode = parsePrefetchModeArg();
const siteOrigin = resolveBuildSiteOrigin(mode);
const generatedCatalog = readGeneratedPackageSiteCatalog();
if (generatedCatalog && isRegistryCatalog(generatedCatalog)) {
  const configured = resolveConfiguredIndexUrl(mode);
  setRuntimePackageCatalog(generatedCatalog, {
    resolved: true,
    githubRepositoryUrl: configured.githubRepositoryUrl,
  });
}

const baseHtml = readFileSync(resolve(distDir, 'index.html'), 'utf8');
const buildRoutePaths = getBuildSitemapPaths();
const generatedDetails = readGeneratedPackageSiteDetails();
const resolvedCatalog =
  generatedCatalog && isRegistryCatalog(generatedCatalog) ? generatedCatalog : null;

function assertKnownSiteRoute(routePath) {
  if (!buildRoutePaths.includes(routePath)) {
    throw new Error(`Unknown site route for dist output: ${routePath}`);
  }
}

function writeRouteDistHtml(routePath, html) {
  assertKnownSiteRoute(routePath)

  const pathWithoutTrailingSlash =
    routePath.endsWith('/') && routePath.length > 1 ? routePath.slice(0, -1) : routePath

  if (pathWithoutTrailingSlash === '/') {
    writeFileSync('dist/index.html', html)
    return
  }

  const segments = pathWithoutTrailingSlash.slice(1).split('/')
  for (const segment of segments) {
    if (!/^[a-z0-9-]+$/.test(segment)) {
      throw new Error(`Unsafe route segment for dist output: ${segment}`);
    }
  }

  const distSegmentDir = `dist/${segments.join('/')}`;
  const distSegmentFile = `${distSegmentDir}/index.html`;

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- segments validated against siteRoutes
  mkdirSync(distSegmentDir, { recursive: true });
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- segments validated against siteRoutes
  writeFileSync(distSegmentFile, html);
}

function buildRouteHtml(routePath) {
  const packageRoute = parsePackageSitePath(stripLocalePrefix(routePath));
  const packageDetail =
    packageRoute?.kind === 'detail'
      ? generatedDetails?.[`${packageRoute.namespace}/${packageRoute.packageId}`]
      : undefined;

  return injectRouteBodyFallbackIntoHtml(
    injectLegacyDomainRedirectIntoHtml(
      injectRouteHeadIntoHtml(baseHtml, routePath, siteOrigin),
    ),
    routePath,
    siteOrigin,
    {
      catalog: resolvedCatalog,
      packageDetail,
    },
  );
}

for (const routePath of buildRoutePaths) {
  writeRouteDistHtml(routePath, buildRouteHtml(routePath));
}

writeFileSync(
  resolve(distDir, '404.html'),
  injectLegacyDomainRedirectIntoHtml(injectSpaFallbackHeadIntoHtml(baseHtml)),
);
writeFileSync(resolve(distDir, '.nojekyll'), '');

const sitemapPath = resolve(distDir, 'sitemap.xml');
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  writeFileSync(sitemapPath, rewriteSitemapLocsToPublicPaths(sitemap));
}

console.log('Prepared dist/ for GitHub Pages (.nojekyll, 404.html, route HTML).');
