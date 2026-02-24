import { Page } from '@playwright/test';

export class ProductDetailPage {
  constructor(private page: Page) {}

  async goto(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async scrollToRelatedSection() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await this.page.waitForTimeout(1500);
  }

  async getPageTitle() {
    return this.page.title();
  }
}