import fs from 'fs';
import path from 'path';
import { AIModel, Category, Vendor } from './types';

/**
 * Load all vendor-specific model files and combine them
 */
export async function loadData(): Promise<{
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
}> {
  try {
    // Find the data directory
    const dataDir = path.join(process.cwd(), 'src', 'data');
    
    // Load the models
    const modelsPath = path.join(dataDir, 'models.json');
    const modelsData = await fs.promises.readFile(modelsPath, 'utf-8');
    const models: AIModel[] = JSON.parse(modelsData);
    
    // Load the categories
    const categoriesPath = path.join(dataDir, 'categories.json');
    const categoriesData = await fs.promises.readFile(categoriesPath, 'utf-8');
    const categories: Category[] = JSON.parse(categoriesData);
    
    // Load the vendors
    const vendorsPath = path.join(dataDir, 'vendors.json');
    const vendorsData = await fs.promises.readFile(vendorsPath, 'utf-8');
    const vendors: Vendor[] = JSON.parse(vendorsData);
    
    // Establish relationships
    for (const model of models) {
      model.category = categories.find(c => c.id === model.categoryId);
      model.vendor = vendors.find(v => v.id === model.vendorId);
    }
    
    for (const category of categories) {
      category.models = models.filter(m => m.categoryId === category.id);
    }
    
    for (const vendor of vendors) {
      vendor.models = models.filter(m => m.vendorId === vendor.id);
    }
    
    return { models, categories, vendors };
  } catch (error) {
    console.error('Error loading data:', error);
    throw new Error(`Failed to load data: ${error}`);
  }
}