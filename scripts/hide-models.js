/**
 * Script to hide specific models temporarily
 * Usage: node scripts/hide-models.js [systemName1] [systemName2] ...
 * 
 * If no model names are provided, it will display a list of current hidden models.
 * If model names are provided, it will set isHidden=true for those models.
 * If a model name is prefixed with '-', it will set isHidden=false for that model.
 * 
 * Example: 
 * - Hide models: node scripts/hide-models.js gemini-2.0-pro gemini-2.0-pro-exp
 * - Unhide models: node scripts/hide-models.js -gemini-2.0-pro
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  // If no arguments, list currently hidden models
  if (args.length === 0) {
    const hiddenModels = await prisma.aIModel.findMany({
      where: {
        isHidden: true
      },
      select: {
        id: true,
        systemName: true,
        displayName: true
      }
    });
    
    if (hiddenModels.length === 0) {
      console.log('No models are currently hidden.');
    } else {
      console.log('Currently hidden models:');
      hiddenModels.forEach(model => {
        console.log(`- ${model.displayName} (${model.systemName}) [ID: ${model.id}]`);
      });
    }
    return;
  }
  
  // Process each model name argument
  for (const arg of args) {
    // Check if this is an unhide operation (prefixed with -)
    const isUnhide = arg.startsWith('-');
    const modelName = isUnhide ? arg.substring(1) : arg;
    
    // Find the model
    const model = await prisma.aIModel.findFirst({
      where: {
        systemName: modelName
      }
    });
    
    if (!model) {
      console.log(`Model not found: ${modelName}`);
      continue;
    }
    
    // Update the model's hidden status
    await prisma.aIModel.update({
      where: { id: model.id },
      data: { isHidden: !isUnhide }
    });
    
    console.log(`${isUnhide ? 'Unhidden' : 'Hidden'} model: ${model.displayName} (${model.systemName})`);
  }
  
  console.log('Operation completed successfully.');
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });