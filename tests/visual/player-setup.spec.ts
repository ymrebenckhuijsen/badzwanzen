import { test, expect } from '@playwright/test'

test('spelersbeheer-scherm in standaard/initiële staat', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Badzwanzen' })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  await expect(page).toHaveScreenshot('player-setup.png', { animations: 'disabled' })
})
