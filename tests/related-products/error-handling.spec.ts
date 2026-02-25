import { test, expect } from '@playwright/test';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { testData } from '../../fixtures/testData';

test.describe('TC-19, TC-20 | Error Handling', () => {

  test('TC-19: Page does not crash when related products API returns 500', async ({ page }) => {
    await page.route('**/api/browse/v1/item_summary/search*', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });
    await page.route('**/recs*', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    const pdp = new ProductDetailPage(page);
    await pdp.goto(testData.mainProductUrl);

    // Verify page has product content — h1 exists with text
    const titleExists = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1');
      return Array.from(h1s).some(h => (h.textContent ?? '').trim().length > 5);
    });
    expect(titleExists).toBeTruthy();

    // Page should not show a fatal error state
    const hasFatalError = await page.evaluate(() => {
      return document.querySelector('[class*="error-page"], [class*="fatal-error"]') !== null;
    });
    expect(hasFatalError).toBeFalsy();
  });

  test('TC-20: Page remains usable when API is slow (simulated timeout)', async ({ page }) => {
    await page.route('**/recs*', route => {
      setTimeout(() => route.continue(), 8000);
    });

    const pdp = new ProductDetailPage(page);
    await pdp.goto(testData.mainProductUrl);

    const pageReady = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1');
      const atcButton = document.querySelector('[data-testid="x-atc-action"]');
      return {
        hasTitle: Array.from(h1s).some(h => (h.textContent ?? '').trim().length > 5),
        hasAtcButton: atcButton !== null,
      };
    });

    console.log('Page ready state:', pageReady);
    expect(pageReady.hasTitle).toBeTruthy();
    expect(pageReady.hasAtcButton).toBeTruthy();
  });
});