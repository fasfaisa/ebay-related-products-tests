import { test, expect } from '@playwright/test';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { RelatedProductsSection } from '../../pages/RelatedProductsSection';
import { testData } from '../../fixtures/testData';

test.describe('TC-01 to TC-04 | Related Products Display', () => {

  test('TC-01: Related products section is visible on product page', async ({ page }) => {
    const pdp = new ProductDetailPage(page);
    const related = new RelatedProductsSection(page);

    await pdp.goto(testData.mainProductUrl);
    await pdp.scrollToRelatedSection();

    const visible = await related.isVisible();
    expect(visible).toBeTruthy();
  });

  test('TC-02: No more than 6 related products are displayed', async ({ page }) => {
    const pdp = new ProductDetailPage(page);
    const related = new RelatedProductsSection(page);

    await pdp.goto(testData.mainProductUrl);
    await pdp.scrollToRelatedSection();

    const count = await related.getProductCount();
    expect(count).toBeLessThanOrEqual(6);
  });

  test('TC-24: Main product does not appear in its own related list', async ({ page }) => {
    const pdp = new ProductDetailPage(page);
    const related = new RelatedProductsSection(page);

    await pdp.goto(testData.mainProductUrl);
    await pdp.scrollToRelatedSection();

    const title = await page.locator('h1').first().innerText();
    const cards = await related.getProductCards();

    for (const card of cards) {
      const cardText = await card.innerText();
      expect(cardText).not.toContain(title.substring(0, 20)); // partial match check
    }
  });
});