import { test as base } from '@playwright/test'
import {
  E2E_REGISTRY_INDEX_URL,
  searchableCatalog,
  type E2eRegistryCatalog,
} from './catalog'

export { expect } from '@playwright/test'

export async function mockRegistryIndex(
  page: import('@playwright/test').Page,
  catalog: E2eRegistryCatalog,
  indexUrl: string = E2E_REGISTRY_INDEX_URL,
): Promise<void> {
  await page.route((url) => url.href === indexUrl, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(catalog),
    })
  })
}

export async function mockChatPackageArtifacts(
  page: import('@playwright/test').Page,
  options: {
    readonly instructionsUrl: string
    readonly manifest: unknown
    readonly markdownUrl?: string
    readonly markdown?: string
  },
): Promise<void> {
  await page.route((url) => url.href === options.instructionsUrl, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(options.manifest),
    })
  })

  if (!options.markdownUrl || options.markdown === undefined) {
    return
  }

  await page.route((url) => url.href === options.markdownUrl, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'text/markdown',
      body: options.markdown,
    })
  })
}

export async function mockRegistryIndexFailure(
  page: import('@playwright/test').Page,
  indexUrl: string = E2E_REGISTRY_INDEX_URL,
  status = 500,
): Promise<void> {
  await page.route((url) => url.href === indexUrl, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'simulated failure' }),
    })
  })
}

export const test = base.extend<{ catalog: E2eRegistryCatalog }>({
  catalog: async ({}, use) => {
    await use(searchableCatalog)
  },
  page: async ({ page, catalog }, use) => {
    await mockRegistryIndex(page, catalog)
    await use(page)
  },
})
