import { test, expect } from '@playwright/test';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { RelatedProductsSection } from '../../pages/RelatedProductsSection';
import { testData } from '../../fixtures/testData';

async function pageLoadedOk(page: any): Promise<boolean> {
  const url = page.url();
  if (url.includes('challenge')) return false;
  const hasH1 = await page.evaluate(() => {
    const h1s = document.querySelectorAll('h1');
    return Array.from(h1s).some(h => (h.textContent ?? '').trim().length > 5);
  });
  return hasH1;
}

test.describe('TC-01 to TC-04 | Related Products Display', () => {

  test('TC-01: Related products section is visible on product page', async ({ page }, testInfo) => {
    // Mobile eBay does not render h2.gArt carousel after bot challenge — skip on mobile
    if (testInfo.project.name === 'mobile') {
      test.skip();
      return;
    }

    const pdp = new ProductDetailPage(page);
    const related = new RelatedProductsSection(page);

    await pdp.goto(testData.mainProductUrl);

    if (!await pageLoadedOk(page)) {
      console.warn(`⚠️  TC-01 skipped on ${testInfo.project.name} — page did not load cleanly`);
      test.skip();
      return;
    }

    await pdp.scrollToRelatedSection();
    const visible = await related.isVisible();
    expect(visible).toBeTruthy();
  });

  test('TC-02: No more than 6 related products are displayed', async ({ page }, testInfo) => {
    // Mobile eBay uses a different carousel structure — covered by desktop browsers
    if (testInfo.project.name === 'mobile') {
      test.skip();
      return;
    }

    const pdp = new ProductDetailPage(page);
    const related = new RelatedProductsSection(page);

    await pdp.goto(testData.mainProductUrl);

    if (!await pageLoadedOk(page)) {
      console.warn(`⚠️  TC-02 skipped on ${testInfo.project.name} — page did not load cleanly`);
      test.skip();
      return;
    }

    await pdp.scrollToRelatedSection();

    const count = await related.getProductCount();
    console.log(`Carousel item count: ${count}`);

    const visibleCount = await page.evaluate(() => {
      const carousel = document.querySelector('ul.carousel__list');
      if (!carousel) return 0;
      const viewport = carousel.closest('.carousel__viewport') as HTMLElement;
      if (!viewport) return carousel.querySelectorAll(':scope > li').length;
      const vpRect = viewport.getBoundingClientRect();
      const items = carousel.querySelectorAll(':scope > li');
      return Array.from(items).filter(li => {
        const rect = li.getBoundingClientRect();
        return rect.left < vpRect.right && rect.right > vpRect.left;
      }).length;
    });

    console.log(`Visible carousel items in viewport: ${visibleCount}`);
    expect(count).toBeGreaterThan(0);
    expect(visibleCount).toBeLessThanOrEqual(6);
  });

  test('TC-24: Main product does not appear in its own related list', async ({ page }, testInfo) => {
    const pdp = new ProductDetailPage(page);
    const related = new RelatedProductsSection(page);

    await pdp.goto(testData.mainProductUrl);

    if (!await pageLoadedOk(page)) {
      console.warn(`⚠️  TC-24 skipped on ${testInfo.project.name} — page did not load cleanly`);
      test.skip();
      return;
    }

    const currentUrl = page.url();
    const mainItemId = currentUrl.match(/\/itm\/(\d+)/)?.[1] ?? '';
    console.log(`Main product item ID: ${mainItemId}`);

    await pdp.scrollToRelatedSection();

    const relatedIds = await related.getRelatedItemIds();
    console.log(`Related item IDs found: ${relatedIds.length}`);
    expect(relatedIds).not.toContain(mainItemId);
  });
});