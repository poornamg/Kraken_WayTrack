const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8445';
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(__dirname, '../docs/refactor-baseline/store');

const scenarios = [
  { name: 'home', query: '?view=home' },
  { name: 'new-order-fresh-dry', query: '?view=new-order&business=fresh' },
  { name: 'new-order-fresh-chilled', query: '?view=new-order&business=fresh&state=chilled' },
  { name: 'new-order-style', query: '?view=new-order&business=style' },
  { name: 'new-order-tech', query: '?view=new-order&business=tech' },
  { name: 'new-order-empty', query: '?view=new-order&state=empty' },
  { name: 'new-order-populated', query: '?view=new-order' },
  { name: 'new-order-before-cutoff', query: '?view=new-order' },
  { name: 'new-order-after-cutoff', query: '?view=new-order&state=after-cutoff' },
  { name: 'review-default', query: '?view=review' },
  { name: 'review-submission-error', query: '?view=review&state=submit-error' },
  { name: 'confirmation', query: '?view=confirmation' },
  { name: 'orders', query: '?view=orders' },
  { name: 'deliveries', query: '?view=deliveries' },
  { name: 'order-detail-confirmed', query: '?view=order-detail' },
  { name: 'order-detail-deferred', query: '?view=order-detail&state=deferred' },
  { name: 'order-detail-scheduled', query: '?view=order-detail&state=scheduled' },
  { name: 'order-detail-on-way', query: '?view=order-detail&state=on-way' },
  { name: 'order-detail-arrived', query: '?view=order-detail&state=arrived' },
  { name: 'order-detail-awaiting-confirmation', query: '?view=order-detail&state=awaiting-confirmation' },
  { name: 'order-detail-receipt-confirmed', query: '?view=order-detail&state=receipt-confirmed' },
  { name: 'order-detail-receipt-issue', query: '?view=order-detail&state=receipt-issue' },
  { name: 'verify-delivery-good', query: '?view=verify-delivery' },
  { name: 'verify-delivery-issue-edit', query: '?view=verify-delivery&state=issue-edit' },
  { name: 'verify-delivery-issue-review', query: '?view=verify-delivery&state=issue-review' },
  { name: 'verify-delivery-confirmed', query: '?view=verify-delivery&state=receipt-confirmed' },
  { name: 'verify-delivery-confirmed-with-issue', query: '?view=verify-delivery&state=receipt-confirmed-issue' }
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();

  console.log(`Starting screenshot capture from ${BASE_URL} to ${OUTPUT_DIR}...`);

  for (const vp of viewports) {
    const page = await context.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const scenario of scenarios) {
      const url = `${BASE_URL}/${scenario.query}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      } catch (e) {
        // Fallback if networkidle times out due to polling
        await page.waitForTimeout(1000);
      }
      // Wait for framer-motion animations to settle
      await page.waitForTimeout(600);

      const filename = `${scenario.name}_${vp.name}_${vp.width}.png`;
      const filePath = path.join(OUTPUT_DIR, filename);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Captured: ${filename}`);
    }
    await page.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
