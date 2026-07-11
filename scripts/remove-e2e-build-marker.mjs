import { existsSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'

const markerPath = resolve(process.cwd(), 'dist', 'e2e-build-marker.json')

if (existsSync(markerPath)) {
  unlinkSync(markerPath)
}
