import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    const response = await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    console.log('PAGE STATUS:', response.status());
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
