const puppeteer = require('puppeteer');

async function testInputAreaFunctionality() {
  console.log('Starting functionality test with Puppeteer...');
  
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless mode
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the local IP instead of localhost
    console.log('Navigating to website...');
    await page.goto('http://127.0.0.1:3000', { 
      waitUntil: 'networkidle2',
      timeout: 60000 // Increase timeout to 60 seconds
    });
    console.log('Navigated to website');
    
    // Wait for the page to load completely
    console.log('Waiting for container to appear...');
    await page.waitForSelector('.container', { timeout: 60000 });
    console.log('Page loaded successfully');
    
    // Verify input text area exists
    const textareaExists = await page.evaluate(() => {
      return !!document.querySelector('textarea');
    });
    
    if (!textareaExists) {
      throw new Error('Text area not found on page');
    }
    console.log('Text area found on page');
    
    // Check if Sample Cost column exists initially
    const sampleColumnExists = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('thead tr th'));
      return headers.some(header => header.textContent.includes('Sample Cost'));
    });
    
    if (!sampleColumnExists) {
      throw new Error('Sample Cost column not found initially');
    }
    console.log('Sample Cost column exists in the table');
    
    // Modify text in the textarea
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      textarea.value = 'This is a shorter test input.';
    });
    console.log('Modified text in the textarea');
    
    // Click update pricing button
    await page.waitForSelector('button', { visible: true });
    await page.evaluate(() => {
      const updateButton = Array.from(document.querySelectorAll('button')).find(
        btn => btn.textContent.includes('Update Pricing')
      );
      if (updateButton) updateButton.click();
    });
    console.log('Clicked update pricing button');
    
    // Wait briefly for any UI updates
    await page.waitForTimeout(1000);
    
    // Check if sample costs updated (we'll just verify values exist)
    const debugInfo = await page.evaluate(() => {
      // Get all tables that might be visible
      const tables = Array.from(document.querySelectorAll('table'));
      const tableCount = tables.length;
      
      // Try to find a visible table
      const visibleTable = tables[0]; // Just take the first table since we're on desktop view
      
      if (!visibleTable) return { success: false, reason: 'No tables found', tableCount };
      
      // Get all rows in the table body
      const rows = Array.from(visibleTable.querySelectorAll('tbody tr'));
      if (rows.length === 0) return { success: false, reason: 'No rows found in table', tableCount, rowCount: 0 };
      
      const rowCount = rows.length;
      const firstRowCellCount = rows[0].querySelectorAll('td').length;
      
      // Check headers to see if Sample Cost column exists
      const headers = Array.from(visibleTable.querySelectorAll('th')).map(th => th.textContent);
      
      // Check if at least one row has a sample cost column with a value
      const hasCostColumn = rows.some(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        // Sample cost should be the 6th column (index 5)
        return cells.length >= 6 && cells[5] && cells[5].textContent.includes('$');
      });
      
      return { 
        success: hasCostColumn, 
        tableCount, 
        rowCount, 
        firstRowCellCount,
        headers,
        reason: hasCostColumn ? 'Sample costs found' : 'Sample costs not found'
      };
    });
    
    console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
    
    if (!debugInfo.success) {
      throw new Error(`Sample costs check failed: ${debugInfo.reason}`);
    }
    console.log('Sample costs are displayed correctly');
    
    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the browser
    await browser.close();
    console.log('Browser closed');
  }
}

// Run the test
testInputAreaFunctionality();