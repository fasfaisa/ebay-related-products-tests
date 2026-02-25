/**
 * testData.ts
 * -----------
 * Runtime test data consumed directly inside spec files.
 * All selectors are the EXACT values from the eBay DOM
 * as specified in the QA Skills Assessment.
 *
 * Selector reference:
 *  - Section container : div._0wWlq  (contains h2.gArt "Similar Items")
 *  - Section heading   : h2.gArt
 *  - "See all" link    : .ULaF.recs-see-all-link-align-with-subtitle
 *  - Add to Cart btn   : [data-testid="x-atc-action"]  /  #atcBtn_btn_1
 *  - Heart icon        : [aria-label="Add to watchlist"]
 */

export const testData = {
  // Real eBay wallet product listing used as the primary test fixture.
  // Replace the item ID if this listing expires.
  mainProductUrl: '/itm/389656904564',

  selectors: {
    // Outer section wrapper — exact class name from eBay DOM
    relatedSection: 'div._0wWlq',

    // Individual product cards inside the Similar Items carousel
    productCards: 'div._0wWlq li',

    // Heart / watchlist icon — exact aria-label, no wildcard
    heartIcon: '[aria-label="Add to watchlist"]',

    // "See all >" anchor — exact compound class from eBay DOM
    seeAllLink: '.ULaF.recs-see-all-link-align-with-subtitle',
  },
};