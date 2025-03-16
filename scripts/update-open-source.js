// Script to update isOpenSource field for Deepseek and Llama models
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateOpenSourceModels() {
  try {
    console.log('Updating Deepseek and Llama models to isOpenSource = true');
    
    // Find models with names containing "deepseek" or "llama"
    // Use toLowerCase() for case-insensitive search since SQLite doesn't support it directly
    const allModels = await prisma.aIModel.findMany();
    
    const deepseekModels = allModels.filter(model => 
      model.systemName.toLowerCase().includes('deepseek')
    );
    
    const llamaModels = allModels.filter(model => 
      model.systemName.toLowerCase().includes('llama')
    );
    
    console.log(`Found ${deepseekModels.length} Deepseek models and ${llamaModels.length} Llama models`);
    
    // Update Deepseek models
    for (const model of deepseekModels) {
      await prisma.aIModel.update({
        where: { id: model.id },
        data: { isOpenSource: true },
      });
      console.log(`Set isOpenSource = true for Deepseek model: ${model.displayName} (ID: ${model.id})`);
    }
    
    // Update Llama models
    for (const model of llamaModels) {
      await prisma.aIModel.update({
        where: { id: model.id },
        data: { isOpenSource: true },
      });
      console.log(`Set isOpenSource = true for Llama model: ${model.displayName} (ID: ${model.id})`);
    }
    
    console.log('All Deepseek and Llama models have been updated');
    
    // Export the updated data to JSON
    console.log('To update JSON files, run: npm run export-json');
  } catch (error) {
    console.error('Error updating models:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOpenSourceModels();