import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Interface for pricing data received from the AI agent
 */
interface ModelPricing {
  // Required fields
  vendorName: string;      // e.g., "OpenAI", "Anthropic", "Google"
  modelName: string;       // The model's system name (used for lookups)
  inputPrice: number;      // Price per 1M tokens for input/prompt
  outputPrice: number;     // Price per 1M tokens for output/completion
  
  // Optional fields
  finetuningInputPrice?: number;    // Price for fine-tuning input
  finetuningOutputPrice?: number;   // Price for fine-tuning output
  trainingCost?: number;            // Cost for training
}

/**
 * Automated pricing tracking information
 */
interface VendorTrackingInfo {
  name: string;
  pricingUrl: string;
  modelsListUrl: string;
  apiEndpoint?: string;
}

/**
 * Main function to update pricing from AI agent output
 */
async function updatePricing(pricingDataPath: string): Promise<void> {
  try {
    // Read pricing data from JSON file (created by AI agent)
    const pricingData: ModelPricing[] = JSON.parse(
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
            // Case-insensitive search is not working with Prisma types currently
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
          finetuningInput: modelPricing.finetuningInputPrice || null,
          finetuningOutput: modelPricing.finetuningOutputPrice || null,
          trainingCost: modelPricing.trainingCost || null
        };
        
        // If pricing exists, check if it has changed
        if (model.pricing) {
          const currentPricing = model.pricing;
          const pricingChanged = 
            currentPricing.inputText !== pricingData.inputText ||
            currentPricing.outputText !== pricingData.outputText ||
            currentPricing.finetuningInput !== pricingData.finetuningInput ||
            currentPricing.finetuningOutput !== pricingData.finetuningOutput ||
            currentPricing.trainingCost !== pricingData.trainingCost;
          
          if (pricingChanged) {
            // Record pricing history
            await prisma.pricingHistory.create({
              data: {
                modelId: model.id,
                inputText: currentPricing.inputText,
                outputText: currentPricing.outputText,
                finetuningInput: currentPricing.finetuningInput,
                finetuningOutput: currentPricing.finetuningOutput,
                trainingCost: currentPricing.trainingCost
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
async function exportToJson(): Promise<void> {
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
        finetuningInput: model.pricing.finetuningInput,
        finetuningOutput: model.pricing.finetuningOutput,
        trainingCost: model.pricing.trainingCost,
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
function generateTrackingInfo(): void {
  const trackingInfo: VendorTrackingInfo[] = [
    {
      name: "OpenAI",
      pricingUrl: "https://openai.com/api/pricing/",
      modelsListUrl: "https://platform.openai.com/docs/api-reference/models/list",
      apiEndpoint: "https://api.openai.com/v1/models"
    },
    {
      name: "Anthropic",
      pricingUrl: "https://www.anthropic.com/pricing#anthropic-api",
      modelsListUrl: "https://docs.anthropic.com/en/api/models-list",
      apiEndpoint: "https://api.anthropic.com/v1/models"
    },
    {
      name: "Google",
      pricingUrl: "https://cloud.google.com/vertex-ai/generative-ai/pricing",
      modelsListUrl: "https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models"
    },
    {
      name: "Groq",
      pricingUrl: "https://groq.com/pricing/",
      modelsListUrl: "https://console.groq.com/docs/models"
    },
    {
      name: "Together AI",
      pricingUrl: "https://www.together.ai/pricing#inference",
      modelsListUrl: "https://docs.together.ai/docs/inference-models"
    },
    {
      name: "Perplexity",
      pricingUrl: "https://docs.perplexity.ai/guides/pricing",
      modelsListUrl: "https://docs.perplexity.ai/docs/models-overview"
    },
    {
      name: "Inference.net",
      pricingUrl: "https://inference.net/pricing",
      modelsListUrl: "https://inference.net/models"
    }
  ];
  
  // Write to the tracking info JSON file
  fs.writeFileSync(
    path.join(__dirname, '..', 'vendor-tracking-info.json'),
    JSON.stringify(trackingInfo, null, 2)
  );
  
  // Generate data schema sample
  const sampleData: ModelPricing[] = [
    {
      vendorName: "OpenAI",
      modelName: "gpt-4o-mini",
      inputPrice: 0.15,
      outputPrice: 0.6,
      finetuningInputPrice: 8.0,
      finetuningOutputPrice: 16.0
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
}

// Command line interface
async function main(): Promise<void> {
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
      generateTrackingInfo();
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

export { updatePricing, exportToJson, generateTrackingInfo };