import { Page, Locator } from '@playwright/test';

export class RelatedProductsSection {
  private section: Locator;

  constructor(private page: Page) {
    // eBay's related/similar items section — adjust selector after inspecting the real page
    this.section = page.locator('[class*="similar"], [class*="related"], #viTabs_0_is').first();
  }

  async isVisible() {
    return this.section.isVisible();
  }

  async getProductCards() {
    return this.section.locator('.s-item, [class*="item"]').all();
  }

  async getProductCount() {
    const cards = await this.getProductCards();
    return cards.length;
  }

  async getSeeAllLink() {
    return this.page.locator('a:has-text("See all")').first();
  }

  async getHeartIcons() {
    return this.page.locator('[aria-label*="watch"], [class*="watchlist"]').all();
  }

  async clickFirstHeartIcon() {
    const icons = await this.getHeartIcons();
    if (icons.length > 0) await icons[0].click();
  }

  async clickFirstProductCard() {
    const cards = await this.getProductCards();
    if (cards.length > 0) await cards[0].click();
  }
}