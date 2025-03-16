import { AIModel, Category, Vendor } from './types';
import { prisma } from './prisma';
import fs from 'fs';
import path from 'path';

/**
 * Data service that handles loading data from either Prisma (dev) or JSON files (prod)
 */
export async function loadData(): Promise<{
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
}> {
  // In production, use JSON files (static)
  if (process.env.NODE_ENV === 'production') {
    return loadDataFromJson();
  }
  
  // In development, try to use Prisma first, fall back to JSON
  try {
    // Check if Prisma tables exist by trying a simple query
    try {
      const vendorCount = await prisma.vendor.count();
      
      // If no vendors found and we're in development, initialize the database
      if (vendorCount === 0) {
        console.log('Database tables exist but no data found. Run `npm run db:reset` to initialize the database.');
      }
    } catch (error) {
      // Type-assert the error to access the message property
      const dbError = error as { message?: string };
      // If the error is about missing tables, suggest running the setup
      if (dbError.message && dbError.message.includes('does not exist in the current database')) {
        console.error('Database tables do not exist. Please run `npm run db:reset` to set up the database.');
      }
      throw error; // Re-throw to fall back to JSON
    }
    
    return await loadDataFromPrisma();
  } catch (error) {
    console.warn('Failed to load from Prisma, falling back to JSON:', error);
    return loadDataFromJson();
  }
}

/**
 * Load data from JSON files
 */
export function loadDataFromJson(): {
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
} {
  try {
    // Find the data directory
    const dataDir = path.join(process.cwd(), 'src', 'data');
    
    // Load the models
    const modelsPath = path.join(dataDir, 'models.json');
    const modelsData = fs.readFileSync(modelsPath, 'utf-8');
    const models: AIModel[] = JSON.parse(modelsData);
    
    // Load the categories
    const categoriesPath = path.join(dataDir, 'categories.json');
    const categoriesData = fs.readFileSync(categoriesPath, 'utf-8');
    const categories: Category[] = JSON.parse(categoriesData);
    
    // Load the vendors
    const vendorsPath = path.join(dataDir, 'vendors.json');
    const vendorsData = fs.readFileSync(vendorsPath, 'utf-8');
    const vendors: Vendor[] = JSON.parse(vendorsData);
    
    // Establish relationships
    for (const model of models) {
      model.category = categories.find(c => c.id === model.categoryId);
      model.vendor = vendors.find(v => v.id === model.vendorId);
    }
    
    // Filter out hidden models for frontend display
    const visibleModels = models.filter(model => !model.isHidden);
    
    for (const category of categories) {
      category.models = visibleModels.filter(m => m.categoryId === category.id);
    }
    
    for (const vendor of vendors) {
      vendor.models = visibleModels.filter(m => m.vendorId === vendor.id);
    }
    
    return { models: visibleModels, categories, vendors };
  } catch (error) {
    console.error('Error loading data from JSON:', error);
    throw new Error(`Failed to load data from JSON: ${error}`);
  }
}

/**
 * Load data from Prisma database
 */
export async function loadDataFromPrisma(): Promise<{
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
}> {
  try {
    // Load vendors
    const vendors = await prisma.vendor.findMany();
    
    // Load categories
    const categories = await prisma.category.findMany();
    
    // Load models with their pricing
    const dbModels = await prisma.aIModel.findMany({
      include: {
        pricing: true,
      },
    });
    
    // Debug log for open source models
    const openSourceModels = dbModels.filter(m => 
      m.systemName.toLowerCase().includes('llama') || 
      m.systemName.toLowerCase().includes('deepseek')
    );
    console.log('Open source models from database:', openSourceModels.map(m => 
      `${m.displayName} (${m.systemName}): isOpenSource=${m.isOpenSource}`
    ));
    
    // Convert to our interface format
    const models: AIModel[] = dbModels.map(model => ({
      id: model.id,
      systemName: model.systemName,
      displayName: model.displayName,
      categoryId: model.categoryId,
      parametersB: model.parametersB,
      vendorId: model.vendorId,
      host: model.host,
      precision: model.precision || undefined,
      description: model.description || undefined,
      contextWindow: model.contextWindow || undefined,
      tokenLimit: model.tokenLimit || undefined,
      releaseDate: model.releaseDate ? model.releaseDate.toISOString().split('T')[0] : undefined,
      isOpenSource: model.isOpenSource || false,
      isHidden: model.isHidden || false,
      pricing: model.pricing ? {
        id: model.pricing.id,
        modelId: model.pricing.modelId,
        inputText: model.pricing.inputText,
        outputText: model.pricing.outputText,
        finetuningInput: model.pricing.finetuningInput || undefined,
        finetuningOutput: model.pricing.finetuningOutput || undefined,
        trainingCost: model.pricing.trainingCost || undefined,
      } : undefined,
    }));
    
    // Establish relationships
    for (const model of models) {
      model.category = categories.find(c => c.id === model.categoryId);
      model.vendor = vendors.find(v => v.id === model.vendorId);
    }
    
    // Note: We don't need to keep separate variables for this since we're using the filtered versions below
    
    // Filter out hidden models for frontend display
    const visibleModels = models.filter(model => !model.isHidden);
    
    // Create filtered categories and vendors with only visible models
    const categoriesWithVisibleModels = categories.map(category => ({
      ...category,
      models: visibleModels.filter(m => m.categoryId === category.id),
    }));
    
    const vendorsWithVisibleModels = vendors.map(vendor => ({
      ...vendor,
      models: visibleModels.filter(m => m.vendorId === vendor.id),
    }));
    
    return { 
      models: visibleModels, 
      categories: categoriesWithVisibleModels, 
      vendors: vendorsWithVisibleModels 
    };
  } catch (error) {
    console.error('Error loading data from Prisma:', error);
    throw new Error(`Failed to load data from Prisma: ${error}`);
  }
}