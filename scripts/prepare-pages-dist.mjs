import { mkdirSync, readFileSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  injectRouteHeadIntoHtml,
  injectSpaFallbackHeadIntoHtml,
  injectLegacyDomainRedirectIntoHtml,
} from '../src/modules/site/application/seo/buildRouteHead.ts';
import { isRegistryCatalog } from '../src/modules/registry/infrastructure/registryCatalogValidation.ts';
import { setRuntimePackageCatalog } from '../src/modules/registry/application/runtimePackageCatalog.ts';
import {
  getBuildSiteRoutePaths,
  readGeneratedPackageSiteCatalog,
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
const buildRoutePaths = getBuildSiteRoutePaths();

function assertKnownSiteRoute(routePath) {
  if (!buildRoutePaths.includes(routePath)) {
    throw new Error(`Unknown site route for dist output: ${routePath}`);
  }
}

function writeRouteDistHtml(routePath, html) {
  assertKnownSiteRoute(routePath);

  if (routePath === '/') {
    writeFileSync('dist/index.html', html);
    return;
  }

  const segments = routePath.slice(1).split('/');
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

for (const routePath of buildRoutePaths) {
  const html = injectLegacyDomainRedirectIntoHtml(
    injectRouteHeadIntoHtml(baseHtml, routePath, siteOrigin),
  );
  writeRouteDistHtml(routePath, html);
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
