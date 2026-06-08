import { copyFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');

copyFileSync(resolve(distDir, 'index.html'), resolve(distDir, '404.html'));
writeFileSync(resolve(distDir, '.nojekyll'), '');

console.log('Prepared dist/ for GitHub Pages (.nojekyll and 404.html).');
