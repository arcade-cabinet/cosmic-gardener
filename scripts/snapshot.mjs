import { chromium } from 'playwright';

const url = process.env.URL || 'http://127.0.0.1:5179/';
const browser = await chromium.launch();
const errors = [];

async function shot(label, viewport) {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', e => errors.push(`[${label}] pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${label}] console: ${m.text()}`); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `/tmp/cg-${label}-landing.png`, fullPage: false });

  const begin = page.getByRole('button', { name: /begin/i }).first();
  if (await begin.count()) {
    await begin.click();
    await page.waitForTimeout(900);
    const playBall = page.getByRole('button', { name: /play ball/i }).first();
    if (await playBall.count()) {
      await playBall.click();
      await page.waitForTimeout(700);
    }
    await page.screenshot({ path: `/tmp/cg-${label}-play.png`, fullPage: false });
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `/tmp/cg-${label}-play2.png`, fullPage: false });
  }
  await page.close();
}

await shot('desktop', { width: 1280, height: 800 });
await shot('mobile', { width: 390, height: 844 });
console.log('ERRORS:', errors.length ? '\n  ' + errors.join('\n  ') : 'none');
await browser.close();
