import { test as base, type Page } from '@playwright/test'
import {
  E2E_REGISTRY_INDEX_URL,
  searchableCatalog,
  type E2eRegistryCatalog,
} from './catalog'

export { expect } from '@playwright/test'

async function fulfillGet(
  page: Page,
  url: string,
  options: {
    readonly status?: number
    readonly contentType: string
    readonly body: string
  },
): Promise<void> {
  await page.route((candidate) => candidate.href === url, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    await route.fulfill({
      status: options.status ?? 200,
      contentType: options.contentType,
      body: options.body,
    })
  })
}

export async function mockRegistryIndex(
  page: Page,
  catalog: E2eRegistryCatalog,
  indexUrl: string = E2E_REGISTRY_INDEX_URL,
): Promise<void> {
  await fulfillGet(page, indexUrl, {
    contentType: 'application/json',
    body: JSON.stringify(catalog),
  })
}

async function fulfillJsonAndOptionalMarkdown(
  page: Page,
  options: {
    readonly jsonUrl: string
    readonly jsonBody: unknown
    readonly markdownUrl?: string
    readonly markdown?: string
  },
): Promise<void> {
  await fulfillGet(page, options.jsonUrl, {
    contentType: 'application/json',
    body: JSON.stringify(options.jsonBody),
  })

  if (!options.markdownUrl || options.markdown === undefined) {
    return
  }

  await fulfillGet(page, options.markdownUrl, {
    contentType: 'text/markdown',
    body: options.markdown,
  })
}

export async function mockChatPackageArtifacts(
  page: Page,
  options: {
    readonly instructionsUrl: string
    readonly manifest: unknown
    readonly markdownUrl?: string
    readonly markdown?: string
  },
): Promise<void> {
  await fulfillJsonAndOptionalMarkdown(page, {
    jsonUrl: options.instructionsUrl,
    jsonBody: options.manifest,
    markdownUrl: options.markdownUrl,
    markdown: options.markdown,
  })
}

export async function mockPackageDetailArtifacts(
  page: Page,
  options: {
    readonly detailUrl: string
    readonly detail: unknown
    readonly markdownUrl?: string
    readonly markdown?: string
  },
): Promise<void> {
  await fulfillJsonAndOptionalMarkdown(page, {
    jsonUrl: options.detailUrl,
    jsonBody: options.detail,
    markdownUrl: options.markdownUrl,
    markdown: options.markdown,
  })
}

export async function mockRegistryIndexFailure(
  page: Page,
  indexUrl: string = E2E_REGISTRY_INDEX_URL,
  status = 500,
): Promise<void> {
  await fulfillGet(page, indexUrl, {
    status,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'simulated failure' }),
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
