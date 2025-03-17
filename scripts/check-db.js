#!/usr/bin/env node

/**
 * This script checks if the Prisma database is set up properly.
 * It's designed to be run before starting the development server.
 * 
 * IMPORTANT: This script includes safeguards to protect database data.
 * - Always creates a full backup before any database reset operations
 * - Preserves pricing data through resets
 * - Will not delete data unless absolutely necessary for schema issues
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('Checking Prisma database with safety mechanisms...');
  
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  
  // Check for .env file and DATABASE_URL
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found! Creating it...');
    fs.writeFileSync(envPath, 'DATABASE_URL="file:./prisma/dev.db"\n');
  } else {
    // Check if DATABASE_URL is correctly set
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (!envContent.includes('DATABASE_URL=')) {
      console.error('DATABASE_URL not found in .env! Adding it...');
      fs.appendFileSync(envPath, '\nDATABASE_URL="file:./prisma/dev.db"\n');
    }
  }
  
  // Ensure backup directory exists
  const backupDir = path.join(process.cwd(), 'backup');
  if (!fs.existsSync(backupDir)) {
    console.log('Creating backup directory...');
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Check if database file exists
  const dbExists = fs.existsSync(dbPath);
  
  if (!dbExists) {
    console.log('Database file not found. Setting up database...');
    // Check if we should restore from backup
    const backupFiles = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.db'))
      .sort()
      .reverse();
      
    if (backupFiles.length > 0) {
      console.log(`Found ${backupFiles.length} database backups.`);
      console.log(`Most recent backup: ${backupFiles[0]}`);
      
      const proceed = execSync('read -p "Restore from the most recent backup? (Y/n): " choice && echo $choice', { encoding: 'utf8' }).trim();
      
      if (proceed.toLowerCase() !== 'n') {
        const latestBackup = path.join(backupDir, backupFiles[0]);
        console.log(`Restoring from ${latestBackup}...`);
        fs.copyFileSync(latestBackup, dbPath);
        console.log('Database restored from backup. Checking data integrity...');
        // Continue with the rest of the checks
      } else {
        console.log('Proceeding with fresh database setup...');
        resetDatabase();
        return;
      }
    } else {
      console.log('No backups found. Setting up fresh database...');
      resetDatabase();
      return;
    }
  }
  
  // Check if database file is writable
  try {
    fs.accessSync(dbPath, fs.constants.W_OK);
  } catch (err) {
    console.error('Database file exists but is not writable! Fixing permissions...');
    try {
      // Make file writable (chmod +w)
      fs.chmodSync(dbPath, fs.constants.S_IRUSR | fs.constants.S_IWUSR);
    } catch (chmodErr) {
      console.error('Failed to fix permissions. Removing and recreating database...');
      fs.unlinkSync(dbPath);
      resetDatabase();
      return;
    }
  }
  
  // Check database size (empty databases are typically very small)
  const stats = fs.statSync(dbPath);
  if (stats.size < 1000) {
    console.log('Database file exists but appears to be empty or corrupted. Recreating...');
    fs.unlinkSync(dbPath);
    resetDatabase();
    return;
  }
  
  // Check if Prisma schema is in sync with the database
  try {
    // Generate Prisma client if it doesn't exist yet
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Try to query vendors table
    const vendorCount = await prisma.vendor.count();
    
    if (vendorCount === 0) {
      console.log('Database exists but has no data. Seeding database...');
      try {
        execSync('npm run prisma:seed', { stdio: 'inherit' });
        console.log('Database seeded successfully.');
      } catch (error) {
        console.error('Failed to seed database:', error);
        resetDatabase();
      }
    } else {
      console.log(`Database ready with ${vendorCount} vendors.`);
    }
  } catch (error) {
    console.error('Database error:', error.message);
    
    // If tables don't exist, run migrations and seed
    if (error.message && (
        error.message.includes('does not exist in the current database') ||
        error.message.includes('database schema is not compatible') ||
        error.message.includes('failed to prepare query')
    )) {
      console.log('Database schema issue detected. Resetting database...');
      resetDatabase();
    } else {
      console.error('Unexpected database error. Trying to reset...');
      resetDatabase();
    }
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Backs up pricing data before resetting the database
 */
async function backupPricingData() {
  console.log('Backing up pricing data before reset...');
  
  try {
    const pricingBackupPath = path.join(process.cwd(), 'prisma', 'pricing-backup.json');
    
    // Try to query pricing data
    const pricingData = await prisma.pricing.findMany({
      include: {
        model: true
      }
    });
    
    // Also get pricing history
    const pricingHistoryData = await prisma.pricingHistory.findMany({
      include: {
        model: true
      }
    });
    
    if (pricingData.length > 0 || pricingHistoryData.length > 0) {
      // Format the data for backup
      const backupData = {
        pricing: pricingData.map(p => ({
          modelSystemName: p.model.systemName,
          vendorId: p.model.vendorId,
          inputText: p.inputText,
          outputText: p.outputText,
          finetuningInput: p.finetuningInput,
          finetuningOutput: p.finetuningOutput,
          trainingCost: p.trainingCost,
          updatedAt: p.updatedAt
        })),
        pricingHistory: pricingHistoryData.map(ph => ({
          modelSystemName: ph.model.systemName,
          vendorId: ph.model.vendorId,
          inputText: ph.inputText,
          outputText: ph.outputText,
          finetuningInput: ph.finetuningInput,
          finetuningOutput: ph.finetuningOutput,
          trainingCost: ph.trainingCost,
          timestamp: ph.timestamp
        }))
      };
      
      // Save to a backup file
      fs.writeFileSync(pricingBackupPath, JSON.stringify(backupData, null, 2));
      console.log(`Backed up pricing data for ${backupData.pricing.length} models and ${backupData.pricingHistory.length} history records.`);
      return backupData;
    } else {
      console.log('No pricing data found to back up.');
      return null;
    }
  } catch (error) {
    console.error('Failed to back up pricing data:', error);
    return null;
  }
}

/**
 * Restores pricing data after database reset
 */
async function restorePricingData(backupData) {
  if (!backupData) {
    console.log('No pricing data to restore.');
    return;
  }
  
  console.log('Restoring pricing data...');
  
  try {
    // For each pricing entry, find the corresponding model and restore pricing
    for (const pricing of backupData.pricing) {
      try {
        // Find the model by system name and vendor ID
        const model = await prisma.aIModel.findFirst({
          where: {
            systemName: pricing.modelSystemName,
            vendorId: pricing.vendorId
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
        }
      } catch (error) {
        console.error(`Failed to restore pricing for ${pricing.modelSystemName}:`, error);
      }
    }
    
    // Restore pricing history
    for (const history of backupData.pricingHistory) {
      try {
        // Find the model by system name and vendor ID
        const model = await prisma.aIModel.findFirst({
          where: {
            systemName: history.modelSystemName,
            vendorId: history.vendorId
          }
        });
        
        if (model) {
          // Create pricing history entry
          await prisma.pricingHistory.create({
            data: {
              inputText: history.inputText,
              outputText: history.outputText,
              finetuningInput: history.finetuningInput,
              finetuningOutput: history.finetuningOutput,
              trainingCost: history.trainingCost,
              timestamp: history.timestamp,
              modelId: model.id
            }
          });
        }
      } catch (error) {
        console.error(`Failed to restore pricing history for ${history.modelSystemName}:`, error);
      }
    }
    
    console.log(`Restored pricing data for ${backupData.pricing.length} models and ${backupData.pricingHistory.length} history records.`);
  } catch (error) {
    console.error('Failed to restore pricing data:', error);
  }
}

function resetDatabase() {
  try {
    console.log('Resetting database... Creating safety backups first.');
    
    // Create a full database backup
    try {
      execSync('npm run db:backup', { stdio: 'inherit' });
      console.log('✅ Full database backup created successfully.');
    } catch (fullBackupError) {
      console.error('⚠️ Warning: Failed to create full database backup:', fullBackupError);
      
      // Ask for confirmation before proceeding
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const proceed = execSync('read -p "Full backup failed. Continue with database reset? (y/N): " choice && echo $choice', { encoding: 'utf8' }).trim();
      
      if (proceed.toLowerCase() !== 'y') {
        console.log('Database reset cancelled by user.');
        process.exit(0);
      }
    }
    
    // Then backup pricing data specifically
    let pricingBackup = null;
    
    try {
      // We need to use a promise wrapper since we're in a sync function
      pricingBackup = execSync('node -e "require(\'./scripts/check-db.js\').backupPricingData().then(data => console.log(JSON.stringify(data)))"', { encoding: 'utf8' });
      if (pricingBackup) {
        pricingBackup = JSON.parse(pricingBackup);
        console.log('✅ Pricing data backup created successfully.');
      }
    } catch (backupError) {
      console.error('⚠️ Warning: Failed to backup pricing data:', backupError);
    }
    
    // Also try to backup pricing using the dedicated script
    try {
      execSync('npm run pricing:backup', { stdio: 'inherit' });
      console.log('✅ Additional pricing backup created using dedicated script.');
    } catch (pricingBackupError) {
      console.error('⚠️ Warning: Failed to create additional pricing backup:', pricingBackupError);
    }
    
    // Ensure the database file is removed if it exists
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (fs.existsSync(dbPath)) {
      try {
        // Create a timestamped copy before removing
        const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
        const backupPath = path.join(process.cwd(), 'backup', `manual_reset_${timestamp}.db`);
        fs.copyFileSync(dbPath, backupPath);
        console.log(`✅ Emergency backup created at ${backupPath}`);
        
        fs.unlinkSync(dbPath);
        console.log('Removed existing database file.');
      } catch (err) {
        console.error('Failed to remove existing database:', err);
      }
    }
    
    // Force reset with prisma migrate reset
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    
    // Verify the database was created properly
    if (!fs.existsSync(dbPath)) {
      throw new Error('Database file was not created after reset!');
    }
    
    // Restore pricing data if we have a backup
    if (pricingBackup) {
      try {
        execSync(`node -e "require('./scripts/check-db.js').restorePricingData(${JSON.stringify(pricingBackup)})"`, { stdio: 'inherit' });
      } catch (restoreError) {
        console.error('Failed to restore pricing data:', restoreError);
      }
    }
    
    // Export JSON data after database reset and restoration
    try {
      execSync('npm run export-json', { stdio: 'inherit' });
      console.log('✅ Database exported to JSON files successfully');
    } catch (exportError) {
      console.error('⚠️ Failed to export database to JSON:', exportError);
    }
    
    console.log('Database setup completed successfully.');
  } catch (error) {
    console.error('Failed to reset database:', error);
    process.exit(1);
  }
}

// Export functions for module usage
module.exports = { 
  checkDatabase,
  backupPricingData,
  restorePricingData
};

// Run the check if script is executed directly
if (require.main === module) {
  // Skip DB check if environment variable is set
  if (process.env.SKIP_DB_CHECK === 'true') {
    console.log('Skipping database check (SKIP_DB_CHECK=true)');
  } else {
    checkDatabase()
      .catch((error) => {
        console.error('Error checking database:', error);
        process.exit(1);
      });
  }
}