/**
 * This script validates that all required JSON files exist and have the correct structure.
 * It's designed to be run during the build process to ensure data integrity.
 */

const fs = require('fs');
const path = require('path');

// Required files and their structure checks
const REQUIRED_FILES = [
  {
    path: 'src/data/models.json',
    validator: (data) => Array.isArray(data) && data.length > 0,
    message: 'models.json must contain an array of models'
  },
  {
    path: 'src/data/categories.json',
    validator: (data) => Array.isArray(data) && data.length > 0,
    message: 'categories.json must contain an array of categories'
  },
  {
    path: 'src/data/vendors.json',
    validator: (data) => Array.isArray(data) && data.length > 0,
    message: 'vendors.json must contain an array of vendors'
  },
];

// Additional vendor files check
const VENDOR_DIR = 'src/data/vendors';

function validateJsonFiles() {
  console.log('Validating JSON data files...');
  let hasErrors = false;

  // Check required files
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(process.cwd(), file.path);
    
    // Check file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ ERROR: Required file ${file.path} not found!`);
      hasErrors = true;
      continue;
    }
    
    // Validate file content
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!file.validator(data)) {
        console.error(`❌ ERROR: File ${file.path} has invalid format: ${file.message}`);
        hasErrors = true;
      } else {
        console.log(`✅ ${file.path} - Valid`);
      }
    } catch (error) {
      console.error(`❌ ERROR: Could not parse ${file.path}: ${error.message}`);
      hasErrors = true;
    }
  }
  
  // Check vendor files
  const vendorDir = path.join(process.cwd(), VENDOR_DIR);
  if (!fs.existsSync(vendorDir)) {
    console.error(`❌ ERROR: Vendor directory ${VENDOR_DIR} not found!`);
    hasErrors = true;
  } else {
    const vendorFiles = fs.readdirSync(vendorDir)
      .filter(f => f.endsWith('.json'));
      
    if (vendorFiles.length === 0) {
      console.error(`❌ ERROR: No vendor JSON files found in ${VENDOR_DIR}!`);
      hasErrors = true;
    } else {
      console.log(`Found ${vendorFiles.length} vendor files`);
      
      // Validate each vendor file
      for (const vendorFile of vendorFiles) {
        const filePath = path.join(vendorDir, vendorFile);
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (!Array.isArray(data)) {
            console.error(`❌ ERROR: Vendor file ${vendorFile} must contain an array of models`);
            hasErrors = true;
          } else {
            console.log(`✅ ${VENDOR_DIR}/${vendorFile} - Valid (${data.length} models)`);
          }
        } catch (error) {
          console.error(`❌ ERROR: Could not parse ${VENDOR_DIR}/${vendorFile}: ${error.message}`);
          hasErrors = true;
        }
      }
    }
  }
  
  // Cross-reference validation
  try {
    // Check that all models have corresponding vendor files
    const modelsPath = path.join(process.cwd(), 'src/data/models.json');
    const vendorsPath = path.join(process.cwd(), 'src/data/vendors.json');
    
    if (fs.existsSync(modelsPath) && fs.existsSync(vendorsPath)) {
      const models = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));
      const vendors = JSON.parse(fs.readFileSync(vendorsPath, 'utf8'));
      
      // Check all vendor IDs in models have corresponding vendor files
      const vendorIds = new Set(vendors.map(v => v.id));
      const modelVendorIds = new Set(models.map(m => m.vendorId));
      
      for (const vendorId of modelVendorIds) {
        if (!vendorIds.has(vendorId)) {
          console.error(`❌ ERROR: Models reference vendor ID ${vendorId} that doesn't exist in vendors.json`);
          hasErrors = true;
        }
      }
      
      // Check all categories exist
      const categoriesPath = path.join(process.cwd(), 'src/data/categories.json');
      if (fs.existsSync(categoriesPath)) {
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const categoryIds = new Set(categories.map(c => c.id));
        const modelCategoryIds = new Set(models.map(m => m.categoryId));
        
        for (const categoryId of modelCategoryIds) {
          if (!categoryIds.has(categoryId)) {
            console.error(`❌ ERROR: Models reference category ID ${categoryId} that doesn't exist in categories.json`);
            hasErrors = true;
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ ERROR during cross-reference validation: ${error.message}`);
    hasErrors = true;
  }
  
  if (hasErrors) {
    console.error('❌ JSON validation failed! Please run "pnpm db:export" to regenerate JSON files.');
    // In Netlify environment, continue with warnings rather than failing
    if (process.env.NETLIFY === 'true') {
      console.warn('⚠️ Running in Netlify environment - continuing despite validation errors');
    } else {
      process.exit(1);
    }
  } else {
    console.log('✅ All JSON files are valid!');
  }
}

// Run validation
validateJsonFiles();