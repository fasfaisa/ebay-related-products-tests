import { Page } from '@playwright/test';

export class ProductDetailPage {
  constructor(private page: Page) {}

  async goto(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await this.handleBotChallenge(url);
    await this.page.waitForSelector('h1', { state: 'attached', timeout: 20000 }).catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  private async handleBotChallenge(url: string, attempts = 3) {
    for (let i = 0; i < attempts; i++) {
      if (!this.page.url().includes('challenge')) break;
      console.warn(`⚠️  Bot challenge (attempt ${i + 1}/${attempts}) — waiting 15s...`);
      await this.page.waitForTimeout(15000);
      if (this.page.url().includes('challenge')) {
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      }
    }
  }

  async scrollToRelatedSection() {
    for (let i = 1; i <= 15; i++) {
      await this.page.evaluate((step) => {
        window.scrollTo(0, (document.body.scrollHeight / 15) * step);
      }, i);
      await this.page.waitForTimeout(500);
    }
    await this.page.waitForTimeout(3000);
  }

  async getPageTitle() {
    return this.page.title();
  }
}