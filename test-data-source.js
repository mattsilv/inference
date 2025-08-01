const puppeteer = require('puppeteer');

async function testDataSourceIntegration() {
  console.log('Starting data source integration test...');
  
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless mode
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable request interception to monitor API calls
    await page.setRequestInterception(true);
    const apiCalls = [];
    
    page.on('request', (request) => {
      if (request.url().includes('data.silv.app/ai/models.json')) {
        apiCalls.push(request.url());
        console.log('API call detected:', request.url());
      }
      request.continue();
    });
    
    // Navigate to the application
    console.log('Navigating to application...');
    await page.goto('http://127.0.0.1:3000', { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    console.log('Application loaded');
    
    // Wait for the page to load completely
    console.log('Waiting for pricing table to load...');
    await page.waitForSelector('table', { timeout: 60000 });
    console.log('Pricing table loaded');
    
    // Check if the external API was called
    if (apiCalls.length === 0) {
      console.log('Warning: No API calls to data.silv.app detected - might be using fallback data');
    } else {
      console.log(`✓ API called ${apiCalls.length} time(s)`);
    }
    
    // Test for specific pricing data that we know exists in the API
    // Claude 3.5 Haiku should have prompt pricing of 0.0000008 (converted to 0.8 per million tokens)
    const pricingData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const testModels = [];
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length >= 3) {
          const modelName = cells[0]?.textContent?.trim();
          const inputPrice = cells[2]?.textContent?.trim(); // Input price column
          const outputPrice = cells[3]?.textContent?.trim(); // Output price column
          
          // Look for Claude 3.5 Haiku
          if (modelName && modelName.toLowerCase().includes('claude') && 
              modelName.toLowerCase().includes('haiku') && 
              modelName.toLowerCase().includes('3.5')) {
            testModels.push({
              modelName,
              inputPrice,
              outputPrice,
              expectedInput: '0.8', // 0.0000008 * 1M = 0.8
              expectedOutput: '4' // 0.000004 * 1M = 4
            });
          }
          
          // Look for Claude 3 Opus for comparison
          if (modelName && modelName.toLowerCase().includes('claude') && 
              modelName.toLowerCase().includes('opus') && 
              modelName.toLowerCase().includes('3') &&
              !modelName.toLowerCase().includes('3.5')) {
            testModels.push({
              modelName,
              inputPrice,
              outputPrice,
              expectedInput: '15', // 0.000015 * 1M = 15
              expectedOutput: '75' // 0.000075 * 1M = 75
            });
          }
        }
      });
      
      return testModels;
    });
    
    console.log('Found test model data:', pricingData);
    
    // Verify the data matches what we expect from the API with high precision
    if (pricingData.length === 0) {
      throw new Error('No Claude models found in pricing table');
    }
    
    let testsPassed = 0;
    for (const model of pricingData) {
      console.log(`Testing model: ${model.modelName}`);
      
      // Check input price precision
      if (model.inputPrice && model.inputPrice.includes(model.expectedInput)) {
        console.log(`✓ ${model.modelName} input pricing correct: ${model.inputPrice}`);
        testsPassed++;
      } else {
        console.log(`⚠ ${model.modelName} input pricing: ${model.inputPrice} (expected to contain ${model.expectedInput})`);
      }
      
      // Check output price precision
      if (model.outputPrice && model.outputPrice.includes(model.expectedOutput)) {
        console.log(`✓ ${model.modelName} output pricing correct: ${model.outputPrice}`);
        testsPassed++;
      } else {
        console.log(`⚠ ${model.modelName} output pricing: ${model.outputPrice} (expected to contain ${model.expectedOutput})`);
      }
    }
    
    if (testsPassed === 0) {
      throw new Error('No pricing tests passed - decimal precision may be lost');
    }
    
    console.log(`✓ ${testsPassed} pricing precision tests passed`);
    
    // Additional check: Verify we have models loaded
    const modelCount = await page.evaluate(() => {
      return document.querySelectorAll('tbody tr').length;
    });
    
    console.log(`✓ Total models loaded: ${modelCount}`);
    
    if (modelCount < 10) {
      throw new Error(`Expected more models, only found ${modelCount}`);
    }
    
    console.log('✅ Data source integration test passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

// Run the test
testDataSourceIntegration();