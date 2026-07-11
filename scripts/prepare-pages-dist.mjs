import { mkdirSync, readFileSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  injectRouteHeadIntoHtml,
  injectSpaFallbackHeadIntoHtml,
  injectLegacyDomainRedirectIntoHtml,
} from '../src/modules/site/application/seo/buildRouteHead.ts';
import { getSiteOrigin } from '../src/modules/site/application/seo/siteSeo.ts';
import { getSiteRoutePaths } from '../src/modules/site/application/seo/siteSeoMeta.ts';
import { resolveViteSiteUrl } from './load-vite-env.mjs';

const distDir = resolve(process.cwd(), 'dist');
const e2eBuildMarkerPath = resolve(distDir, 'e2e-build-marker.json');

if (existsSync(e2eBuildMarkerPath)) {
  unlinkSync(e2eBuildMarkerPath);
}

const siteOrigin = getSiteOrigin(resolveViteSiteUrl());
const baseHtml = readFileSync(resolve(distDir, 'index.html'), 'utf8');

function buildSitemapXml(routePaths, origin) {
  const urls = routePaths
    .map((routePath) => {
      const loc = routePath === '/' ? `${origin}/` : `${origin}${routePath}`;
      const priority = routePath === '/' ? '1.0' : '0.8';

      return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildRobotsTxt(origin) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
}

function assertKnownSiteRoute(routePath) {
  if (!getSiteRoutePaths().includes(routePath)) {
    throw new Error(`Unknown site route for dist output: ${routePath}`);
  }
}

function writeRouteDistHtml(routePath, html) {
  assertKnownSiteRoute(routePath);

  if (routePath === '/') {
    writeFileSync('dist/index.html', html);
    return;
  }

  const segment = routePath.slice(1);
  if (!/^[a-z0-9-]+$/.test(segment)) {
    throw new Error(`Unsafe route segment for dist output: ${segment}`);
  }

  const distSegmentDir = `dist/${segment}`;
  const distSegmentFile = `${distSegmentDir}/index.html`;

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- segment validated against siteRoutes
  mkdirSync(distSegmentDir, { recursive: true });
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- segment validated against siteRoutes
  writeFileSync(distSegmentFile, html);
}

for (const routePath of getSiteRoutePaths()) {
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
writeFileSync(resolve(distDir, 'robots.txt'), buildRobotsTxt(siteOrigin));
writeFileSync(resolve(distDir, 'sitemap.xml'), buildSitemapXml(getSiteRoutePaths(), siteOrigin));

console.log('Prepared dist/ for GitHub Pages (.nojekyll, 404.html, robots.txt, route HTML, sitemap.xml).');
