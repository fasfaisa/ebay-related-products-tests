import { test, expect } from '@playwright/test';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { RelatedProductsSection } from '../../pages/RelatedProductsSection';
import { testData } from '../../fixtures/testData';

test.describe('TC-12, TC-13 | Navigation', () => {

  test('TC-12: "See all" link is present and navigates to recs page', async ({ page }, testInfo) => {
    const pdp = new ProductDetailPage(page);
    const related = new RelatedProductsSection(page);

    await pdp.goto(testData.mainProductUrl);

    if (page.url().includes('challenge')) {
      console.warn(`Skipping TC-12 on ${testInfo.project.name} — bot challenge unresolved`);
      test.skip();
      return;
    }

    await pdp.scrollToRelatedSection();

    const seeAllHref = await related.getSeeAllHref();
    console.log(`See all href: ${seeAllHref}`);

    expect(seeAllHref).not.toBeNull();
    expect(seeAllHref).toContain('ebay.com/recs');

    await page.goto(seeAllHref!, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const finalUrl = page.url();
    expect(finalUrl).not.toContain('splashui/challenge');
    expect(finalUrl).toContain('ebay.com');
  });

  test('TC-13: Clicking a related product card navigates to its PDP', async ({ page }, testInfo) => {
    const pdp = new ProductDetailPage(page);
    const related = new RelatedProductsSection(page);

    await pdp.goto(testData.mainProductUrl);

    if (page.url().includes('challenge')) {
      console.warn(`Skipping TC-13 on ${testInfo.project.name} — bot challenge unresolved`);
      test.skip();
      return;
    }

    await pdp.scrollToRelatedSection();

    const firstHref = await related.getFirstProductHref();
    console.log(`First related product href: ${firstHref}`);

    if (!firstHref) {
      console.warn('No related product links found — skipping');
      test.skip();
      return;
    }

    await page.goto(firstHref, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    if (currentUrl.includes('splashui/challenge')) {
      console.warn('⚠️  Bot challenge on navigation — skipping');
      test.skip();
      return;
    }

    expect(currentUrl).toContain('/itm/');
  });
});