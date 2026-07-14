import { mkdirSync, readFileSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  injectRouteHeadIntoHtml,
  injectSpaFallbackHeadIntoHtml,
  injectLegacyDomainRedirectIntoHtml,
} from '../src/modules/site/application/seo/buildRouteHead.ts';
import { resolveBuildSiteOrigin } from './seo-build-config.ts';
import { getSiteRoutePaths } from '../src/modules/site/application/seo/siteSeoMeta.ts';

function parseModeArg() {
  const modeIndex = process.argv.indexOf('--mode');
  if (modeIndex === -1) {
    return process.env.MODE ?? 'production';
  }

  const mode = process.argv[modeIndex + 1];
  if (!mode) {
    throw new Error('Missing value for --mode');
  }

  return mode;
}

const distDir = resolve(process.cwd(), 'dist');
const e2eBuildMarkerPath = resolve(distDir, 'e2e-build-marker.json');

if (existsSync(e2eBuildMarkerPath)) {
  unlinkSync(e2eBuildMarkerPath);
}

const siteOrigin = resolveBuildSiteOrigin(parseModeArg());
const baseHtml = readFileSync(resolve(distDir, 'index.html'), 'utf8');

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

  mkdirSync(distSegmentDir, { recursive: true });
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

console.log('Prepared dist/ for GitHub Pages (.nojekyll, 404.html, route HTML).');
