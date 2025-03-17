/**
 * This script imports data from JSON files into the Prisma database.
 * Use this script when the JSON files have been modified directly (rare case).
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting import process...');
  
  const dataDir = path.join(process.cwd(), 'src', 'data');
  
  // Backup the database first
  try {
    console.log('Creating database backup before import...');
    require('child_process').execSync('npm run db:backup', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to backup database. Aborting import for safety.');
    process.exit(1);
  }
  
  try {
    // Import categories
    console.log('Importing categories...');
    const categoriesPath = path.join(dataDir, 'categories.json');
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    
    // Clear existing categories
    await prisma.category.deleteMany();
    
    // Insert new categories with their IDs preserved
    for (const category of categories) {
      await prisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          displayOrder: category.displayOrder || 0,
          description: category.description || ''
        }
      });
    }
    
    console.log(`Imported ${categories.length} categories.`);
    
    // Import vendors
    console.log('Importing vendors...');
    const vendorsPath = path.join(dataDir, 'vendors.json');
    const vendors = JSON.parse(fs.readFileSync(vendorsPath, 'utf8'));
    
    // Clear existing vendors
    await prisma.vendor.deleteMany();
    
    // Insert new vendors with their IDs preserved
    for (const vendor of vendors) {
      await prisma.vendor.create({
        data: {
          id: vendor.id,
          name: vendor.name,
          website: vendor.website || '',
          logoUrl: vendor.logoUrl || '',
          description: vendor.description || ''
        }
      });
    }
    
    console.log(`Imported ${vendors.length} vendors.`);
    
    // Import models and pricing
    console.log('Importing models and pricing...');
    const modelsPath = path.join(dataDir, 'models.json');
    const models = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));
    
    // Clear existing models and pricing
    await prisma.pricing.deleteMany();
    await prisma.pricingHistory.deleteMany();
    await prisma.aIModel.deleteMany();
    
    // Insert new models with their IDs preserved
    for (const model of models) {
      // Create the model first
      await prisma.aIModel.create({
        data: {
          id: model.id,
          systemName: model.systemName,
          displayName: model.displayName,
          description: model.description || '',
          categoryId: model.categoryId,
          vendorId: model.vendorId,
          parametersB: model.parametersB,
          precision: model.precision || null,
          contextWindow: model.contextWindow || null,
          tokenLimit: model.tokenLimit || null,
          host: model.host || '',
          releaseDate: model.releaseDate ? new Date(model.releaseDate) : null,
          isOpenSource: model.isOpenSource || false,
          isHidden: model.isHidden || false
        }
      });
      
      // Create pricing if it exists
      if (model.pricing) {
        await prisma.pricing.create({
          data: {
            modelId: model.id,
            inputText: model.pricing.inputText,
            outputText: model.pricing.outputText,
            finetuningInput: model.pricing.finetuningInput || null,
            finetuningOutput: model.pricing.finetuningOutput || null,
            trainingCost: model.pricing.trainingCost || null,
            updatedAt: new Date()
          }
        });
      }
    }
    
    console.log(`Imported ${models.length} models.`);
    console.log('Import completed successfully!');
    
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();