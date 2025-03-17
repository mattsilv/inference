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

  // Check if we should backup first
  try {
    console.log('Creating database backup before seeding...');
    require('child_process').execSync('npm run db:backup', { stdio: 'inherit' });
    console.log('✅ Database backup created successfully.');
    
    // Also backup pricing specifically
    console.log('Creating pricing data backup...');
    require('child_process').execSync('npm run pricing:backup', { stdio: 'inherit' });
    console.log('✅ Pricing backup created successfully.');
  } catch (err) {
    console.error('⚠️ Warning: Failed to create backup before seeding:', err);
    const proceed = require('child_process').execSync('read -p "Backup failed. Continue with seeding? (y/N): " choice && echo $choice', { encoding: 'utf8' }).trim();
    
    if (proceed.toLowerCase() !== 'y') {
      console.log('Database seeding cancelled by user.');
      process.exit(0);
    }
  }

  // Get data directory
  const dataDir = path.join(process.cwd(), 'src', 'data');
  
  // Backup pricing data for restoration after seeding
  console.log('Backing up pricing data in memory before clearing...');
  const pricingData = await prisma.pricing.findMany({
    include: { model: true }
  });
  
  // Clear existing data (in reverse order to respect foreign keys)
  console.log('Clearing existing data...');
  await prisma.pricing.deleteMany();
  await prisma.aIModel.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vendor.deleteMany();
  
  // Import vendors
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
  
  // Import models from vendor files
  console.log('Importing models from vendor files...');
  const vendorsDir = path.join(dataDir, 'vendors');
  const vendorFiles = fs.readdirSync(vendorsDir).filter(file => file.endsWith('.json'));
  
  for (const vendorFile of vendorFiles) {
    const vendorModels = JSON.parse(
      fs.readFileSync(path.join(vendorsDir, vendorFile), 'utf-8')
    );
    
    for (const model of vendorModels) {
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
            // The updatedAt field will be automatically set by Prisma
          },
        });
      }
    }
  }
  
  console.log('Database seeding completed successfully!');
  
  // Restore pricing data from memory backup if we had any
  if (pricingData && pricingData.length > 0) {
    console.log(`Restoring ${pricingData.length} pricing records from memory backup...`);
    
    for (const pricing of pricingData) {
      try {
        // Find the corresponding model by system name and vendor ID
        const model = await prisma.aIModel.findFirst({
          where: {
            systemName: pricing.model.systemName,
            vendorId: pricing.model.vendorId
          }
        });
        
        if (model) {
          // Create pricing entry
          await prisma.pricing.create({
            data: {
              inputText: pricing.inputText,
              outputText: pricing.outputText,
              finetuningInput: pricing.finetuningInput,
              finetuningOutput: pricing.finetuningOutput,
              trainingCost: pricing.trainingCost,
              updatedAt: pricing.updatedAt,
              modelId: model.id
            }
          });
        } else {
          console.warn(`⚠️ Couldn't find model for pricing: ${pricing.model.systemName}`);
        }
      } catch (error) {
        console.error(`Error restoring pricing for ${pricing.model?.systemName || 'unknown model'}:`, error);
      }
    }
    
    console.log('✅ Pricing data restoration completed.');
  } else {
    console.log('No pricing data to restore from memory.');
    
    // Try to restore from disk backup if we have no in-memory data
    try {
      console.log('Attempting to restore pricing from disk backup...');
      require('child_process').execSync('npm run pricing:restore', { stdio: 'inherit' });
      console.log('✅ Pricing restored from disk backup.');
    } catch (err) {
      console.error('Failed to restore pricing from disk backup:', err);
    }
  }
  
  console.log('Full database seeding and restoration process completed.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });