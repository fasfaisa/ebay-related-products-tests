import { test, expect } from '@playwright/test';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { RelatedProductsSection } from '../../pages/RelatedProductsSection';
import { testData } from '../../fixtures/testData';

test.describe('TC-19, TC-20 | Error Handling', () => {

  test('TC-19: Page does not crash when related products API returns 500', async ({ page }) => {
    // Intercept the eBay recommendations/related products API call
    await page.route('**/api/browse/v1/item_summary/search*', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.route('**/similar*', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    const pdp = new ProductDetailPage(page);
    await pdp.goto(testData.mainProductUrl);

    // Page should still load — no JS crash
    const title = await page.locator('h1').first();
    await expect(title).toBeVisible();

    // No error dialog should appear
    const errorDialog = page.locator('[class*="error-page"], [class*="fatal"]');
    await expect(errorDialog).not.toBeVisible();
  });

  test('TC-20: Page remains usable when API is slow (simulated timeout)', async ({ page }) => {
    await page.route('**/similar*', route => {
      // Delay response by 8 seconds to simulate timeout
      setTimeout(() => route.continue(), 8000);
    });

    const pdp = new ProductDetailPage(page);
    await pdp.goto(testData.mainProductUrl);

    // Main product info should still be visible
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('[class*="add-to-cart"], [class*="ux-call-to-action"]').first()).toBeVisible();
  });
});