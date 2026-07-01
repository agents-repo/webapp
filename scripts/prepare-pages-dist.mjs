import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  injectRouteHeadIntoHtml,
} from '../src/modules/site/application/seo/buildRouteHead.ts';
import { getSiteOrigin } from '../src/modules/site/application/seo/siteSeo.ts';
import { getSiteRoutePaths } from '../src/modules/site/application/seo/siteSeoMeta.ts';

const distDir = resolve(process.cwd(), 'dist');
const siteOrigin = getSiteOrigin(process.env.VITE_SITE_URL?.trim());
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

function writeRouteDistHtml(routePath, html) {
  switch (routePath) {
    case '/':
      writeFileSync('dist/index.html', html);
      return;
    case '/about':
      mkdirSync('dist/about', { recursive: true });
      writeFileSync('dist/about/index.html', html);
      return;
    case '/contact':
      mkdirSync('dist/contact', { recursive: true });
      writeFileSync('dist/contact/index.html', html);
      return;
    case '/help-us':
      mkdirSync('dist/help-us', { recursive: true });
      writeFileSync('dist/help-us/index.html', html);
      return;
    case '/accessibility':
      mkdirSync('dist/accessibility', { recursive: true });
      writeFileSync('dist/accessibility/index.html', html);
      return;
    default:
      throw new Error(`No dist output mapping for route: ${routePath}`);
  }
}

for (const routePath of getSiteRoutePaths()) {
  const html = injectRouteHeadIntoHtml(baseHtml, routePath, siteOrigin);
  writeRouteDistHtml(routePath, html);
}

copyFileSync(resolve(distDir, 'index.html'), resolve(distDir, '404.html'));
writeFileSync(resolve(distDir, '.nojekyll'), '');
writeFileSync(resolve(distDir, 'sitemap.xml'), buildSitemapXml(getSiteRoutePaths(), siteOrigin));

console.log('Prepared dist/ for GitHub Pages (.nojekyll, 404.html, route HTML, sitemap.xml).');
