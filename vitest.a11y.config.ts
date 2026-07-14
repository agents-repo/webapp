import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

/** Vitest entry for `npm run test:a11y` — only `*.a11y.test.tsx` (Vitest 4.x CLI). */
export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        include: ['**/*.a11y.test.tsx'],
      },
    }),
  ),
)
