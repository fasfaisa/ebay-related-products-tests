import { Page } from '@playwright/test';

export class RelatedProductsSection {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async isVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector('h2.gArt', { state: 'visible', timeout: 20000 });
      return true;
    } catch {
      return false;
    }
  }

  async getProductCount(): Promise<number> {
    return await this.page.evaluate(() => {
      const heading = document.querySelector('h2.gArt');
      if (!heading) return 0;

      let container = heading.parentElement;
      while (container && !container.querySelector('ul.carousel__list, ul[class*="recs"], ul[class*="item"]')) {
        container = container.parentElement;
        if (!container || container.tagName === 'BODY') return 0;
      }
      if (!container) return 0;

      // Try carousel__list first (desktop)
      const carousel = container.querySelector('ul.carousel__list');
      if (carousel) return carousel.querySelectorAll(':scope > li').length;

      // Fallback for mobile — any ul with li children near the heading
      const anyList = container.querySelector('ul');
      if (anyList) return anyList.querySelectorAll(':scope > li').length;

      return 0;
    });
  }

  async waitForSeeAllLink(timeout = 15000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const found = await this.page.evaluate(() => {
        return document.querySelector('a.recs-see-all-link-align-with-subtitle') !== null;
      });
      if (found) return;
      await this.page.waitForTimeout(500);
    }
  }

  async getSeeAllHref(): Promise<string | null> {
    // Wait specifically for the recs link to appear after scroll
    await this.waitForSeeAllLink(15000);
    return await this.page.evaluate(() => {
      const links = document.querySelectorAll('a.recs-see-all-link-align-with-subtitle');
      // Return the first visible one
      for (const link of Array.from(links)) {
        const rect = link.getBoundingClientRect();
        if (rect.width > 0) return (link as HTMLAnchorElement).href;
      }
      // Fallback — return any recs link
      const any = document.querySelector('a[href*="ebay.com/recs"]') as HTMLAnchorElement;
      return any ? any.href : null;
    });
  }

  async getFirstProductHref(): Promise<string | null> {
    return await this.page.evaluate(() => {
      const carousel = document.querySelector('ul.carousel__list');
      if (carousel) {
        const link = carousel.querySelector('a[href*="/itm/"]') as HTMLAnchorElement;
        if (link) return link.href;
      }
      // Fallback — find any itm link near an h2.gArt
      const heading = document.querySelector('h2.gArt');
      if (!heading) return null;
      let container = heading.parentElement;
      while (container && container.tagName !== 'BODY') {
        const link = container.querySelector('a[href*="/itm/"]') as HTMLAnchorElement;
        if (link) return link.href;
        container = container.parentElement;
      }
      return null;
    });
  }

  async getRelatedItemIds(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const carousel = document.querySelector('ul.carousel__list');
      const container = carousel || document.querySelector('h2.gArt')?.closest('div');
      if (!container) return [];
      const links = container.querySelectorAll('a[href*="/itm/"]');
      return Array.from(links).map(a => {
        const match = (a as HTMLAnchorElement).href.match(/\/itm\/(\d+)/);
        return match ? match[1] : '';
      }).filter(Boolean);
    });
  }
}