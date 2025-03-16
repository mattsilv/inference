const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Main function to update pricing from AI agent output
 */
async function updatePricing(pricingDataPath) {
  try {
    // Read pricing data from JSON file (created by AI agent)
    const pricingData = JSON.parse(
      fs.readFileSync(pricingDataPath, 'utf-8')
    );
    
    console.log(`Found ${pricingData.length} model pricing entries to process`);
    
    // Process each model's pricing
    for (const modelPricing of pricingData) {
      try {
        // Find the vendor
        const vendor = await prisma.vendor.findFirst({
          where: {
            name: modelPricing.vendorName
          }
        });
        
        if (!vendor) {
          console.error(`Vendor not found: ${modelPricing.vendorName}`);
          continue;
        }
        
        // Find the model
        const model = await prisma.aIModel.findFirst({
          where: {
            AND: [
              { systemName: modelPricing.modelName },
              { vendorId: vendor.id }
            ]
          },
          include: { pricing: true }
        });
        
        if (!model) {
          console.error(`Model not found: ${modelPricing.modelName} from ${modelPricing.vendorName}`);
          continue;
        }
        
        // Extract the pricing data
        const pricingData = {
          inputText: modelPricing.inputPrice,
          outputText: modelPricing.outputPrice,
          // Removed fine-tuning prices from scope
          finetuningInput: null,
          finetuningOutput: null,
          trainingCost: null
        };
        
        // If pricing exists, check if it has changed
        if (model.pricing) {
          const currentPricing = model.pricing;
          const pricingChanged = 
            currentPricing.inputText !== pricingData.inputText ||
            currentPricing.outputText !== pricingData.outputText;
            // Removed fine-tuning price checks from scope
          
          if (pricingChanged) {
            // Record pricing history
            await prisma.pricingHistory.create({
              data: {
                modelId: model.id,
                inputText: currentPricing.inputText,
                outputText: currentPricing.outputText,
                // Fine-tuning prices removed from scope
                finetuningInput: null,
                finetuningOutput: null,
                trainingCost: null
              }
            });
            
            // Update current pricing
            await prisma.pricing.update({
              where: { modelId: model.id },
              data: pricingData
            });
            
            console.log(`Updated pricing for ${model.displayName} (${model.systemName})`);
          } else {
            // Just update the timestamp
            await prisma.pricing.update({
              where: { modelId: model.id },
              data: {}
            });
            
            console.log(`No price changes for ${model.displayName} (${model.systemName})`);
          }
        } else {
          // Create new pricing entry
          await prisma.pricing.create({
            data: {
              ...pricingData,
              modelId: model.id
            }
          });
          
          console.log(`Created new pricing for ${model.displayName} (${model.systemName})`);
        }
      } catch (modelError) {
        console.error(`Error processing model ${modelPricing.modelName}:`, modelError);
      }
    }
    
    console.log('Pricing update complete');
    
    // Export updated data to JSON files
    await exportToJson();
    
  } catch (error) {
    console.error('Error updating pricing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Export DB data to JSON files
 */
async function exportToJson() {
  try {
    // Get the data directory path
    const dataDir = path.join(__dirname, '..', 'src', 'data');
    
    // Export vendors
    const vendors = await prisma.vendor.findMany();
    fs.writeFileSync(
      path.join(dataDir, 'vendors.json'),
      JSON.stringify(vendors, null, 2)
    );
    
    // Export models with pricing
    const models = await prisma.aIModel.findMany({
      include: {
        pricing: true,
        vendor: true,
        category: true
      }
    });
    
    const formattedModels = models.map(model => ({
      id: model.id,
      systemName: model.systemName,
      displayName: model.displayName,
      parametersB: model.parametersB,
      host: model.host,
      precision: model.precision,
      description: model.description,
      contextWindow: model.contextWindow,
      tokenLimit: model.tokenLimit,
      releaseDate: model.releaseDate,
      categoryId: model.categoryId,
      vendorId: model.vendorId,
      vendorName: model.vendor.name,
      categoryName: model.category.name,
      pricing: model.pricing ? {
        inputText: model.pricing.inputText,
        outputText: model.pricing.outputText,
        // Fine-tuning data removed from scope
        updatedAt: model.pricing.updatedAt ? model.pricing.updatedAt.toISOString() : new Date().toISOString()
      } : null
    }));
    
    fs.writeFileSync(
      path.join(dataDir, 'models.json'),
      JSON.stringify(formattedModels, null, 2)
    );
    
    // Export categories
    const categories = await prisma.category.findMany();
    fs.writeFileSync(
      path.join(dataDir, 'categories.json'), 
      JSON.stringify(categories, null, 2)
    );
    
    console.log('Data exported to JSON files successfully');
  } catch (error) {
    console.error('Error exporting to JSON:', error);
  }
}

/**
 * Generate tracking information for AI agent
 */
async function generateTrackingInfo() {
  try {
    // Get all models from the database
    const models = await prisma.aIModel.findMany({
      include: {
        vendor: true,
        pricing: true
      }
    });

    // Group models by vendor
    const vendorModelsMap = {};
    models.forEach(model => {
      if (!vendorModelsMap[model.vendor.name]) {
        vendorModelsMap[model.vendor.name] = {
          name: model.vendor.name,
          pricingUrl: model.vendor.pricingUrl,
          modelsListUrl: model.vendor.modelsListUrl,
          apiEndpoint: model.vendor.name === "OpenAI" || model.vendor.name === "Anthropic" 
            ? `https://api.${model.vendor.name.toLowerCase()}.com/v1/models`.replace('openai', 'openai')
            : undefined,
          models: []
        };
      }
      
      vendorModelsMap[model.vendor.name].models.push({
        name: model.systemName,
        current_input_price: model.pricing ? model.pricing.inputText : null,
        current_output_price: model.pricing ? model.pricing.outputText : null
      });
    });
    
    // Convert to array
    const vendorData = Object.values(vendorModelsMap);
    
    // Create the tracking info object
    const trackingInfo = {
      task: "Get the latest pricing per million tokens for each AI model",
      note: "IMPORTANT: All prices should be in USD per 1 million tokens. For example, if a model costs $0.000005 per token, record it as 5.0 per million tokens. If it costs $0.01 per 1000 tokens, that would be 10.0 per million tokens.",
      vendors: vendorData,
      expected_output_format: [
        {
          vendorName: "OpenAI",
          modelName: "gpt-4o",
          inputPrice: 0.005,
          outputPrice: 0.015
        },
        {
          vendorName: "Anthropic",
          modelName: "claude-3-5-sonnet",
          inputPrice: 0.005,
          outputPrice: 0.025
        }
      ],
      instructions: [
        "1. For each vendor, check their pricing page and get the latest pricing",
        "2. Record both input (prompt) and output (completion) prices separately in USD per million tokens",
        "3. Update the pricing for each model listed",
        "4. If you find additional models not listed here, add them to your response",
        "5. Return the data in the exact format shown in expected_output_format",
        "6. Do not include fine-tuning prices, only input and output inference prices",
        "7. Return all prices as floating point numbers (do not use strings or currency symbols)",
        "8. Ensure all prices are properly converted to per-million-tokens format"
      ]
    };
  
    // Write to the tracking info JSON file
    fs.writeFileSync(
      path.join(__dirname, '..', 'vendor-tracking-info.json'),
      JSON.stringify(trackingInfo, null, 2)
    );
  
    // Generate data schema sample
    const sampleData = [
      {
        vendorName: "OpenAI",
        modelName: "gpt-4o-mini",
        inputPrice: 0.15,
        outputPrice: 0.6
      },
      {
        vendorName: "Anthropic",
        modelName: "claude-3-opus-20240229",
        inputPrice: 15.0,
        outputPrice: 75.0
      }
    ];
  
    // Write to the sample data file
    fs.writeFileSync(
      path.join(__dirname, '..', 'pricing-data-format.json'),
      JSON.stringify(sampleData, null, 2)
    );
  
    console.log('Tracking information generated successfully');
    console.log('Data format:');
    console.log(JSON.stringify(sampleData[0], null, 2));
  } catch (error) {
    console.error('Error generating tracking information:', error);
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'update':
      if (!args[1]) {
        console.error('Please provide the path to the pricing data JSON file');
        console.log('Usage: npm run pricing-tracker update /path/to/pricing-data.json');
        process.exit(1);
      }
      await updatePricing(args[1]);
      break;
    
    case 'export':
      await exportToJson();
      break;
    
    case 'generate-info':
      await generateTrackingInfo();
      break;
    
    default:
      console.log('Available commands:');
      console.log('  update [path]        - Update pricing from JSON file');
      console.log('  export               - Export database to JSON files');
      console.log('  generate-info        - Generate tracking info for AI agent');
      break;
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Error running pricing tracker:', error);
    process.exit(1);
  });
}

module.exports = { updatePricing, exportToJson, generateTrackingInfo };