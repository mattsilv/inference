/**
 * This script exports data from the Prisma database to JSON files.
 * It's designed to be run during the build process to generate the
 * static data files used by the site.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ExportedModel {
  id: number;
  systemName: string;
  displayName: string;
  categoryId: number;
  parametersB: number;
  vendorId: number;
  host: string;
  precision?: string;
  description?: string;
  contextWindow?: number;
  tokenLimit?: number;
  releaseDate?: string;
  pricing?: {
    id: number;
    modelId: number;
    inputText: number;
    outputText: number;
    finetuningInput?: number;
    finetuningOutput?: number;
    trainingCost?: number;
  };
}

async function main() {
  console.log('Starting export process...');
  
  const dataDir = path.join(process.cwd(), 'src', 'data');
  const vendorsDir = path.join(dataDir, 'vendors');
  
  // Ensure directories exist
  if (!fs.existsSync(vendorsDir)) {
    fs.mkdirSync(vendorsDir, { recursive: true });
  }
  
  // Export categories
  console.log('Exporting categories...');
  const categories = await prisma.category.findMany();
  fs.writeFileSync(
    path.join(dataDir, 'categories.json'),
    JSON.stringify(categories, null, 2)
  );
  
  // Export vendors
  console.log('Exporting vendors...');
  const vendors = await prisma.vendor.findMany();
  fs.writeFileSync(
    path.join(dataDir, 'vendors.json'),
    JSON.stringify(vendors, null, 2)
  );
  
  // Export models by vendor
  console.log('Exporting models by vendor...');
  
  // Get all models with pricing
  const allModels = await prisma.aIModel.findMany({
    include: {
      pricing: true,
    },
  });
  
  // Format date fields
  const formattedModels: ExportedModel[] = allModels.map(model => ({
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
  
  // Group models by vendor
  const modelsByVendor = new Map<number, ExportedModel[]>();
  
  for (const model of formattedModels) {
    if (!modelsByVendor.has(model.vendorId)) {
      modelsByVendor.set(model.vendorId, []);
    }
    modelsByVendor.get(model.vendorId)?.push(model);
  }
  
  // Save each vendor's models to a separate file
  for (const [vendorId, models] of modelsByVendor.entries()) {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) continue;
    
    const filename = vendor.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    fs.writeFileSync(
      path.join(vendorsDir, `${filename}.json`),
      JSON.stringify(models, null, 2)
    );
  }
  
  // Export all models to a single file
  console.log('Exporting combined models.json...');
  fs.writeFileSync(
    path.join(dataDir, 'models.json'),
    JSON.stringify(formattedModels, null, 2)
  );
  
  console.log('Export completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during export:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });