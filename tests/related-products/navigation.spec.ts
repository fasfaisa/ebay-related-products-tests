import { test, expect } from '@playwright/test';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { RelatedProductsSection } from '../../pages/RelatedProductsSection';
import { testData } from '../../fixtures/testData';

test.describe('TC-12, TC-13 | Navigation', () => {

  test('TC-12: "See all" link is present and navigates away', async ({ page }) => {
    const pdp = new ProductDetailPage(page);
    const related = new RelatedProductsSection(page);

    await pdp.goto(testData.mainProductUrl);
    await pdp.scrollToRelatedSection();

    const seeAll = await related.getSeeAllLink();
    await expect(seeAll).toBeVisible();

    const [newPage] = await Promise.all([
      page.waitForNavigation(),
      seeAll.click()
    ]);

    expect(page.url()).not.toBe(testData.mainProductUrl);
  });

  test('TC-13: Clicking a related product card navigates to its PDP', async ({ page }) => {
    const pdp = new ProductDetailPage(page);
    const related = new RelatedProductsSection(page);

    await pdp.goto(testData.mainProductUrl);
    await pdp.scrollToRelatedSection();

    const originalUrl = page.url();
    await related.clickFirstProductCard();
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).not.toBe(originalUrl);
    expect(page.url()).toContain('/itm/'); // eBay product pages always have /itm/
  });
});