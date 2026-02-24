# eBay Related Products – Playwright Test Suite

## Overview
Automated tests for the Related Products (Best Sellers) feature on eBay product detail pages.

## Prerequisites
- Node.js v18+
- npm v9+

## Setup
```bash
git clone <your-repo-url>
cd ebay-related-products-tests
npm install
npx playwright install
```

## Configuration
Copy `.env.example` to `.env` and set your target product URL:
```
BASE_URL=https://www.ebay.com
MAIN_PRODUCT_URL=/itm/YOUR_PRODUCT_ID
```

## Run Tests
```bash
# All tests
npx playwright test

# Specific spec file
npx playwright test tests/related-products/display.spec.ts

# Headed mode (see the browser)
npx playwright test --headed

# HTML report
npx playwright show-report
```

## Test Coverage
| TC ID | Description | Spec File |
|-------|-------------|-----------|
| TC-01 | Section renders on PDP | display.spec.ts |
| TC-02 | Max 6 products shown | display.spec.ts |
| TC-13 | Clicking card navigates to PDP | navigation.spec.ts |
| TC-19 | API 500 error handled gracefully | error-handling.spec.ts |