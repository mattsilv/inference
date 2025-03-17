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
    await page.goto('http://localhost:3001', { timeout: 30000, waitUntil: 'networkidle0' });
    
    // Wait for elements to load
    await page.waitForSelector('.container', { timeout: 5000 });
    
    // Scroll down to see categories
    await page.evaluate(() => {
      // Scroll down to show categories
      window.scrollBy(0, 400);
    });
    
    // Wait a moment for any animations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: false });
    console.log('Screenshot saved to debug-screenshot.png');
    
    // Grab the category buttons to verify Inactive isn't there
    const categoryButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.flex.flex-wrap.gap-2 button'));
      return buttons.map(b => b.textContent.trim());
    });
    console.log('Available categories:', categoryButtons);

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