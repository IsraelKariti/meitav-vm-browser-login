import { chromium } from 'playwright';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Types text one character at a time with random delays to keep Angular reactive
// form change detection happy — Angular 19 needs individual input events.
async function typeHuman(page, locator, text) {
  await locator.click();
  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(rand(80, 150));
  }
}

// Opens Chrome, navigates to the taxes authority login page, fills id_number
// and user_code, clicks המשך, and waits for the OTP screen. Returns the page.
export async function doTaxesLogin(idNumber, userCode) {
  console.log('[taxes/login] Launching Chrome...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
  });

  const context = await browser.newContext({
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem',
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined, configurable: true });
  });

  const page = await context.newPage();

  console.log('[taxes/login] Navigating to login page...');
  await page.goto('https://secapp.taxes.gov.il/taxes-login/login/general', {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });

  await page.waitForSelector('#ID', { state: 'visible' });
  console.log('[taxes/login] Login page ready.');

  console.log(`[taxes/login] Entering ID: ${idNumber}`);
  await typeHuman(page, page.locator('#ID'), idNumber);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(rand(250, 450));

  console.log('[taxes/login] Entering user code...');
  await typeHuman(page, page.locator('#code'), userCode);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(rand(350, 600));

  console.log('[taxes/login] Clicking המשך (continue)...');
  await page.locator('button.btn-primary', { hasText: 'המשך' }).click();

  await page.waitForURL(url => url.href.includes('otp'), { timeout: 30_000 });
  console.log('[taxes/login] OTP screen reached.');

  return page;
}
