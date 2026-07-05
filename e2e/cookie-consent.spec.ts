import { test, expect } from './fixtures/registry-mock'

const analyticsConsentStorageKey = 'analytics-consent'

test.describe('Cookie consent', () => {
  test('shows banner and both privacy links before a decision', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('analytics-consent')
    })

    await page.goto('/')

    const banner = page.getByRole('region', { name: 'Cookie preferences' })
    await expect(banner).toBeVisible()
    await expect(banner.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/privacy')
    await expect(banner.getByRole('link', { name: 'Política de privacidade' })).toHaveAttribute(
      'href',
      '/privacidade',
    )
  })

  test('persists reject decision and hides banner', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('analytics-consent')
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Reject analytics' }).click()

    await expect(page.getByRole('region', { name: 'Cookie preferences' })).toHaveCount(0)

    const storedConsent = await page.evaluate(
      (key) => localStorage.getItem(key),
      analyticsConsentStorageKey,
    )
    expect(storedConsent).toBe('rejected')
  })

  test('persists accept decision and hides banner', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('analytics-consent')
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Accept analytics' }).click()

    await expect(page.getByRole('region', { name: 'Cookie preferences' })).toHaveCount(0)

    const storedConsent = await page.evaluate(
      (key) => localStorage.getItem(key),
      analyticsConsentStorageKey,
    )
    expect(storedConsent).toBe('accepted')
  })
})
