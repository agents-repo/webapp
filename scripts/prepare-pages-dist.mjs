import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  injectRouteHeadIntoHtml,
} from '../src/modules/site/application/seo/buildRouteHead.ts';
import { getSiteOrigin } from '../src/modules/site/application/seo/siteSeo.ts';
import { getSiteRoutePaths } from '../src/modules/site/application/seo/siteSeoMeta.ts';

const distDir = resolve(process.cwd(), 'dist');
const siteOrigin = getSiteOrigin(process.env.VITE_SITE_URL?.trim());
const baseHtml = readFileSync(resolve(distDir, 'index.html'), 'utf8');

function routeToDistPath(routePath) {
  if (routePath === '/') {
    return resolve(distDir, 'index.html');
  }

  return resolve(distDir, routePath.slice(1), 'index.html');
}

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

for (const routePath of getSiteRoutePaths()) {
  const outputPath = routeToDistPath(routePath);
  const html = injectRouteHeadIntoHtml(baseHtml, routePath, siteOrigin);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html);
}

copyFileSync(resolve(distDir, 'index.html'), resolve(distDir, '404.html'));
writeFileSync(resolve(distDir, '.nojekyll'), '');
writeFileSync(resolve(distDir, 'sitemap.xml'), buildSitemapXml(getSiteRoutePaths(), siteOrigin));

console.log('Prepared dist/ for GitHub Pages (.nojekyll, 404.html, route HTML, sitemap.xml).');
