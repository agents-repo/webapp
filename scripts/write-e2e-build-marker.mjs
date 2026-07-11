import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const markerPath = resolve(process.cwd(), 'dist', 'e2e-build-marker.json')

writeFileSync(markerPath, `${JSON.stringify({ e2e: true })}\n`)
console.log('Wrote dist/e2e-build-marker.json for Playwright e2e guard.')
