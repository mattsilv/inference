const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Convert date string (YYYY-MM-DD) to Date object
function parseDate(dateString) {
  if (!dateString) return undefined;
  return new Date(dateString);
}

async function main() {
  console.log('Starting database seeding...');

  // Get data directory
  const dataDir = path.join(process.cwd(), 'src', 'data');
  
  // Clear existing data (in reverse order to respect foreign keys)
  console.log('Clearing existing data...');
  await prisma.pricing.deleteMany();
  await prisma.aIModel.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vendor.deleteMany();
  
  // Import vendors - we only want the ones in vendors.json
  console.log('Importing vendors...');
  const vendorsData = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'vendors.json'), 'utf-8')
  );
  
  for (const vendor of vendorsData) {
    await prisma.vendor.create({
      data: {
        id: vendor.id,
        name: vendor.name,
        pricingUrl: vendor.pricingUrl,
        modelsListUrl: vendor.modelsListUrl,
      },
    });
  }
  
  // Import categories
  console.log('Importing categories...');
  const categoriesData = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'categories.json'), 'utf-8')
  );
  
  for (const category of categoriesData) {
    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
      },
    });
  }
  
  // Import models from vendor files - but only for vendors in our vendors.json
  console.log('Importing models from vendor files...');
  const vendorsDir = path.join(dataDir, 'vendors');
  const vendorFiles = fs.readdirSync(vendorsDir).filter(file => file.endsWith('.json'));
  
  const validVendorIds = vendorsData.map(v => v.id);
  
  for (const vendorFile of vendorFiles) {
    const vendorModels = JSON.parse(
      fs.readFileSync(path.join(vendorsDir, vendorFile), 'utf-8')
    );
    
    for (const model of vendorModels) {
      // Only import models for vendors that are in our vendors.json
      if (!validVendorIds.includes(model.vendorId)) {
        console.log(`Skipping model ${model.systemName} because vendor ID ${model.vendorId} is not in vendors.json`);
        continue;
      }
      
      // Create model
      await prisma.aIModel.create({
        data: {
          id: model.id,
          systemName: model.systemName,
          displayName: model.displayName,
          parametersB: model.parametersB,
          host: model.host,
          precision: model.precision,
          description: model.description,
          contextWindow: model.contextWindow,
          tokenLimit: model.tokenLimit,
          releaseDate: model.releaseDate ? parseDate(model.releaseDate) : undefined,
          categoryId: model.categoryId,
          vendorId: model.vendorId,
        },
      });
      
      // Create pricing if it exists
      if (model.pricing) {
        await prisma.pricing.create({
          data: {
            id: model.pricing.id,
            inputText: model.pricing.inputText,
            outputText: model.pricing.outputText,
            finetuningInput: model.pricing.finetuningInput,
            finetuningOutput: model.pricing.finetuningOutput,
            trainingCost: model.pricing.trainingCost,
            modelId: model.id,
          },
        });
      }
    }
  }
  
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });