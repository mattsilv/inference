#!/usr/bin/env node

/**
 * This script creates a backup of all pricing data in the database.
 * It can be run manually or as part of a scheduled task to maintain price history.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupPricingData() {
  console.log('Creating pricing data backup...');
  
  try {
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    // Create a timestamped filename
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const pricingBackupPath = path.join(backupsDir, `pricing-backup-${timestamp}.json`);
    
    // Try to query pricing data
    const pricingData = await prisma.pricing.findMany({
      include: {
        model: {
          include: {
            vendor: true
          }
        }
      }
    });
    
    // Also get pricing history
    const pricingHistoryData = await prisma.pricingHistory.findMany({
      include: {
        model: {
          include: {
            vendor: true
          }
        }
      }
    });
    
    if (pricingData.length > 0 || pricingHistoryData.length > 0) {
      // Format the data for backup
      const backupData = {
        createdAt: new Date().toISOString(),
        pricing: pricingData.map(p => ({
          modelSystemName: p.model.systemName,
          modelDisplayName: p.model.displayName,
          vendorName: p.model.vendor.name,
          vendorId: p.model.vendorId,
          inputText: p.inputText,
          outputText: p.outputText,
          finetuningInput: p.finetuningInput,
          finetuningOutput: p.finetuningOutput,
          trainingCost: p.trainingCost,
          updatedAt: p.updatedAt.toISOString()
        })),
        pricingHistory: pricingHistoryData.map(ph => ({
          modelSystemName: ph.model.systemName,
          modelDisplayName: ph.model.displayName,
          vendorName: ph.model.vendor.name,
          vendorId: ph.model.vendorId,
          inputText: ph.inputText,
          outputText: ph.outputText,
          finetuningInput: ph.finetuningInput,
          finetuningOutput: ph.finetuningOutput,
          trainingCost: ph.trainingCost,
          timestamp: ph.timestamp.toISOString()
        }))
      };
      
      // Save to a backup file
      fs.writeFileSync(pricingBackupPath, JSON.stringify(backupData, null, 2));
      
      // Create a symlink to the latest backup
      const latestLinkPath = path.join(backupsDir, 'pricing-backup-latest.json');
      if (fs.existsSync(latestLinkPath)) {
        fs.unlinkSync(latestLinkPath);
      }
      fs.copyFileSync(pricingBackupPath, latestLinkPath);
      
      // Manage backup rotation (keep only the 20 most recent backups)
      const backupFiles = fs.readdirSync(backupsDir)
        .filter(f => f.startsWith('pricing-backup-') && f.endsWith('.json') && f !== 'pricing-backup-latest.json')
        .sort((a, b) => {
          const aTime = a.replace('pricing-backup-', '').replace('.json', '');
          const bTime = b.replace('pricing-backup-', '').replace('.json', '');
          return bTime.localeCompare(aTime); // Sort from newest to oldest
        });
      
      // Delete older backups (keep newest 20)
      if (backupFiles.length > 20) {
        for (let i = 20; i < backupFiles.length; i++) {
          fs.unlinkSync(path.join(backupsDir, backupFiles[i]));
        }
        console.log(`Removed ${backupFiles.length - 20} older backups.`);
      }
      
      console.log(`Backed up pricing data for ${backupData.pricing.length} models and ${backupData.pricingHistory.length} history records.`);
      console.log(`Backup saved to: ${pricingBackupPath}`);
      return backupData;
    } else {
      console.log('No pricing data found to back up.');
      return null;
    }
  } catch (error) {
    console.error('Failed to back up pricing data:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Restore pricing data from a backup file
 */
async function restorePricingData(backupPath) {
  console.log(`Restoring pricing data from: ${backupPath}`);
  
  try {
    // Read the backup file
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    // For each pricing entry, find the corresponding model and restore pricing
    for (const pricing of backupData.pricing) {
      try {
        // Find the model by system name and vendor info
        const model = await prisma.aIModel.findFirst({
          where: {
            systemName: pricing.modelSystemName,
            vendor: {
              id: pricing.vendorId
            }
          },
          include: {
            pricing: true
          }
        });
        
        if (model) {
          // If pricing already exists, update it
          if (model.pricing) {
            await prisma.pricing.update({
              where: { modelId: model.id },
              data: {
                inputText: pricing.inputText,
                outputText: pricing.outputText,
                finetuningInput: pricing.finetuningInput,
                finetuningOutput: pricing.finetuningOutput,
                trainingCost: pricing.trainingCost,
                updatedAt: new Date(pricing.updatedAt)
              }
            });
          } else {
            // Create pricing entry
            await prisma.pricing.create({
              data: {
                inputText: pricing.inputText,
                outputText: pricing.outputText,
                finetuningInput: pricing.finetuningInput,
                finetuningOutput: pricing.finetuningOutput,
                trainingCost: pricing.trainingCost,
                updatedAt: new Date(pricing.updatedAt),
                modelId: model.id
              }
            });
          }
          console.log(`Restored pricing for ${model.displayName} (${model.systemName})`);
        } else {
          console.warn(`Model not found for pricing: ${pricing.modelSystemName} from ${pricing.vendorName}`);
        }
      } catch (error) {
        console.error(`Failed to restore pricing for ${pricing.modelSystemName}:`, error);
      }
    }
    
    // Restore pricing history
    for (const history of backupData.pricingHistory) {
      try {
        // Find the model by system name and vendor info
        const model = await prisma.aIModel.findFirst({
          where: {
            systemName: history.modelSystemName,
            vendor: {
              id: history.vendorId
            }
          }
        });
        
        if (model) {
          // Check if this history entry already exists (by timestamp and model)
          const existingHistory = await prisma.pricingHistory.findFirst({
            where: {
              modelId: model.id,
              timestamp: new Date(history.timestamp)
            }
          });
          
          if (!existingHistory) {
            // Create pricing history entry
            await prisma.pricingHistory.create({
              data: {
                inputText: history.inputText,
                outputText: history.outputText,
                finetuningInput: history.finetuningInput,
                finetuningOutput: history.finetuningOutput,
                trainingCost: history.trainingCost,
                timestamp: new Date(history.timestamp),
                modelId: model.id
              }
            });
          }
        } else {
          console.warn(`Model not found for pricing history: ${history.modelSystemName} from ${history.vendorName}`);
        }
      } catch (error) {
        console.error(`Failed to restore pricing history for ${history.modelSystemName}:`, error);
      }
    }
    
    console.log(`Restored pricing data for ${backupData.pricing.length} models and ${backupData.pricingHistory.length} history records.`);
  } catch (error) {
    console.error('Failed to restore pricing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'backup':
      await backupPricingData();
      break;
    
    case 'restore':
      if (!args[1]) {
        console.error('Please provide the path to the backup file');
        console.log('Usage: node backup-pricing.js restore <path-to-backup-file>');
        process.exit(1);
      }
      await restorePricingData(args[1]);
      break;
    
    case 'restore-latest':
      const latestPath = path.join(process.cwd(), 'backups', 'pricing-backup-latest.json');
      if (fs.existsSync(latestPath)) {
        await restorePricingData(latestPath);
      } else {
        console.error('No latest backup found.');
        process.exit(1);
      }
      break;
    
    default:
      console.log('Available commands:');
      console.log('  backup            - Create a new backup of pricing data');
      console.log('  restore <path>    - Restore pricing from a specific backup file');
      console.log('  restore-latest    - Restore pricing from the latest backup');
      break;
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Error running backup-pricing:', error);
    process.exit(1);
  });
}

module.exports = { backupPricingData, restorePricingData };