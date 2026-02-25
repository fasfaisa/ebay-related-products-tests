const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const page = await context.newPage();

  // Helper to safely get className as string
  const cls = (el) => (typeof el?.className === 'string' ? el.className : el?.className?.baseVal ?? '');

  console.log('Navigating...');
  await page.goto('https://www.ebay.com/itm/195060516753', {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });

  if (page.url().includes('challenge')) {
    console.log('Bot challenge detected, waiting 10s...');
    await page.waitForTimeout(10000);
  }

  console.log('Scrolling slowly...');
  for (let i = 1; i <= 15; i++) {
    await page.evaluate((step) => {
      window.scrollTo(0, (document.body.scrollHeight / 15) * step);
    }, i);
    await page.waitForTimeout(700);
  }

  await page.waitForTimeout(4000);
  console.log('\nDumping page info...\n');

  const info = await page.evaluate(() => {
    // Safe class getter — handles SVG elements where className is an object
    function cls(el) {
      if (!el) return '';
      if (typeof el.className === 'string') return el.className;
      if (el.className && typeof el.className.baseVal === 'string') return el.className.baseVal;
      return '';
    }

    function safe(str, len = 100) {
      return (str ?? '').trim().substring(0, len);
    }

    const results = {};

    // All h2 elements
    results.h2_elements = Array.from(document.querySelectorAll('h2'))
      .map(h => `  CLASS="${safe(cls(h), 60)}" | TEXT="${safe(h.textContent, 60)}"`)
      .join('\n');

    // Elements with similar/recs/related in class or id
    const keywords = ['similar', 'recs', 'related', 'recommendation'];
    const matched = new Set();
    keywords.forEach(kw => {
      document.querySelectorAll(`[class*="${kw}"], [id*="${kw}"]`).forEach(el => matched.add(el));
    });
    results.similar_elements = Array.from(matched)
      .map(el => `  ${el.tagName} | class="${safe(cls(el), 80)}" | id="${el.id}"`)
      .join('\n');

    // Anchor tags with recs in href
    results.recs_links = Array.from(document.querySelectorAll('a[href*="recs"]'))
      .map(a => `  HREF="${safe(a.href, 100)}" | CLASS="${safe(cls(a), 60)}" | TEXT="${safe(a.textContent, 30)}"`)
      .join('\n');

    // Count of /itm/ links and sample
    const itmLinks = Array.from(document.querySelectorAll('a[href*="/itm/"]'));
    results.itm_links_count = itmLinks.length;
    results.itm_links_sample = itmLinks
      .slice(0, 8)
      .map(a => `  HREF="${safe(a.href, 80)}" | PARENT="${safe(cls(a.parentElement), 60)}"`)
      .join('\n');

    // Lists with 1-20 direct li children
    results.lists = Array.from(document.querySelectorAll('ul, ol'))
      .filter(l => {
        const n = l.querySelectorAll(':scope > li').length;
        return n >= 1 && n <= 20;
      })
      .map(l => {
        const n = l.querySelectorAll(':scope > li').length;
        return `  ${l.tagName} | class="${safe(cls(l), 80)}" | ${n} items | parent="${safe(cls(l.parentElement), 60)}"`;
      })
      .join('\n');

    // All data-testid attributes on page
    results.testids = Array.from(document.querySelectorAll('[data-testid]'))
      .map(el => `  ${el.tagName} | data-testid="${el.getAttribute('data-testid')}" | class="${safe(cls(el), 50)}"`)
      .join('\n');

    return results;
  });

  console.log('=== H2 ELEMENTS ===');
  console.log(info.h2_elements || '  (none)');

  console.log('\n=== SIMILAR / RECS / RELATED ELEMENTS ===');
  console.log(info.similar_elements || '  (none)');

  console.log('\n=== LINKS WITH "recs" IN HREF ===');
  console.log(info.recs_links || '  (none)');

  console.log(`\n=== /itm/ LINKS — total: ${info.itm_links_count} ===`);
  console.log(info.itm_links_sample || '  (none)');

  console.log('\n=== LISTS WITH 1-20 ITEMS ===');
  console.log(info.lists || '  (none)');

  console.log('\n=== DATA-TESTID ATTRIBUTES ===');
  console.log(info.testids || '  (none)');

  console.log('\nKeeping browser open 15s for manual inspection...');
  await page.waitForTimeout(15000);
  await browser.close();
})();