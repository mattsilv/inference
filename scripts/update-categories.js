/**
 * This script updates existing categories with description and useCase fields
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), 'src', 'data');
const categoriesPath = path.join(dataDir, 'categories.json');
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

async function updateCategories() {
  try {
    for (const category of categories) {
      await prisma.category.update({
        where: { id: category.id },
        data: {
          description: category.description || null,
          useCase: category.useCase || null
        }
      });
      console.log(`Updated category ${category.id}: ${category.name}`);
    }
    console.log('All categories updated successfully');
  } catch (error) {
    console.error('Error updating categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCategories();