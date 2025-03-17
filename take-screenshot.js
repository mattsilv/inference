const puppeteer = require('puppeteer');

async function takeScreenshot() {
  console.log('Taking a screenshot to debug...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    console.log('Navigating to website...');
    await page.goto('http://127.0.0.1:3000', { timeout: 30000 });
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'debug-screenshot.png' });
    console.log('Screenshot saved to debug-screenshot.png');

    // Let's also check what HTML is actually being rendered
    const html = await page.content();
    console.log('First 500 characters of HTML:');
    console.log(html.substring(0, 500));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

takeScreenshot();