import { test, expect } from './fixtures/registry-mock'

const analyticsConsentStorageKey = 'analytics-consent'

test.describe('Cookie consent', () => {
  test('shows banner and locale privacy link before a decision', async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.removeItem(key)
    }, analyticsConsentStorageKey)

    await page.goto('/')

    const banner = page.getByRole('region', { name: 'Cookie preferences' })
    await expect(banner).toBeVisible()
    await expect(banner.getByRole('link', { name: 'privacy policy' })).toHaveAttribute('href', '/privacy/')
  })

  test('persists reject decision and hides banner', async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.removeItem(key)
    }, analyticsConsentStorageKey)

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
    await page.addInitScript((key) => {
      localStorage.removeItem(key)
    }, analyticsConsentStorageKey)

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
