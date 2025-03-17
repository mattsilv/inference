/**
 * Simple test script to verify Prisma can connect to the database
 * Useful for CI/CD environments to diagnose database issues
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('Testing Prisma database connection...');
  console.log(`Database URL: ${process.env.DATABASE_URL || 'Not set (using default)'}`);
  
  const prisma = new PrismaClient();
  try {
    // Test a simple query
    const categoryCount = await prisma.category.count();
    console.log(`✅ Connection successful! Found ${categoryCount} categories`);
    
    // Test model query
    const modelCount = await prisma.aIModel.count();
    console.log(`✅ Model query successful! Found ${modelCount} models`);
    
    // Test a join query
    const models = await prisma.aIModel.findMany({
      take: 1,
      include: { pricing: true }
    });
    
    if (models.length > 0) {
      console.log(`✅ Join query successful! Sample model: ${models[0].displayName}`);
    } else {
      console.log('⚠️ Join query returned no results (database may be empty)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Prisma connection test failed:');
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during connection test:', error);
    process.exit(1);
  });