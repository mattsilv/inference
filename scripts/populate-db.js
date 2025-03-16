const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database population...');

  // Get data directory
  const dataDir = path.join(process.cwd(), 'src', 'data');
  
  // Import vendors - make sure to use consecutive IDs
  console.log('Importing vendors...');
  const vendorsData = [
    {
      id: 1,
      name: "OpenAI",
      pricingUrl: "https://openai.com/api/pricing/",
      modelsListUrl: "https://platform.openai.com/docs/api-reference/models/list"
    },
    {
      id: 2,
      name: "Anthropic",
      pricingUrl: "https://www.anthropic.com/pricing#anthropic-api",
      modelsListUrl: "https://docs.anthropic.com/en/api/models-list"
    },
    {
      id: 3,
      name: "Google",
      pricingUrl: "https://cloud.google.com/vertex-ai/generative-ai/pricing",
      modelsListUrl: "https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models"
    },
    {
      id: 4,
      name: "Groq",
      pricingUrl: "https://groq.com/pricing/",
      modelsListUrl: "https://console.groq.com/docs/models"
    },
    {
      id: 5,
      name: "Together AI",
      pricingUrl: "https://www.together.ai/pricing#inference",
      modelsListUrl: "https://docs.together.ai/docs/inference-models"
    },
    {
      id: 6,
      name: "Perplexity",
      pricingUrl: "https://docs.perplexity.ai/guides/pricing",
      modelsListUrl: "https://docs.perplexity.ai/docs/models-overview"
    },
    {
      id: 7,
      name: "Inference.net",
      pricingUrl: "https://inference.net/pricing",
      modelsListUrl: "https://inference.net/models"
    }
  ];
  
  for (const vendor of vendorsData) {
    await prisma.vendor.create({
      data: {
        id: vendor.id,
        name: vendor.name,
        pricingUrl: vendor.pricingUrl,
        modelsListUrl: vendor.modelsListUrl,
      },
    });
  }
  
  // Import categories
  console.log('Importing categories...');
  const categoriesData = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'categories.json'), 'utf-8')
  );
  
  for (const category of categoriesData) {
    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
      },
    });
  }
  
  console.log('Database population completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during population:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });