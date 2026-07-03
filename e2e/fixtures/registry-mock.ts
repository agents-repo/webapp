import { test as base, expect } from '@playwright/test'
import {
  E2E_REGISTRY_INDEX_URL,
  searchableCatalog,
  type E2eRegistryCatalog,
} from './catalog'

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

export { expect }
