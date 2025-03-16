const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database setup...');

  // Clear database
  await prisma.pricing.deleteMany();
  await prisma.aIModel.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vendor.deleteMany();

  // Create categories
  const categories = [
    { id: 1, name: "Top-tier General-purpose" },
    { id: 2, name: "High-performance" },
    { id: 3, name: "Mid-range" },
    { id: 4, name: "Cost-effective" },
    { id: 5, name: "Reasoning-focused" }
  ];

  for (const category of categories) {
    await prisma.category.create({ data: category });
  }

  // Create vendors (in specific order with specific IDs)
  const vendors = [
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

  for (const vendor of vendors) {
    await prisma.vendor.create({ data: vendor });
  }

  // Create models and pricing
  const models = [
    // OpenAI models
    {
      id: 1,
      systemName: "gpt-4o",
      displayName: "GPT-4o",
      categoryId: 1,
      parametersB: 1500,
      vendorId: 1,
      host: "api.openai.com",
      precision: "BF16",
      description: "OpenAI's latest multimodal model that can understand and respond to images, audio, and text.",
      contextWindow: 128000,
      tokenLimit: 4096,
      releaseDate: new Date("2024-05-13"),
      pricing: {
        create: {
          id: 1,
          inputText: 0.005,
          outputText: 0.015
        }
      }
    },
    {
      id: 2,
      systemName: "gpt-4-turbo",
      displayName: "GPT-4 Turbo",
      categoryId: 2,
      parametersB: 1760,
      vendorId: 1,
      host: "api.openai.com",
      precision: "BF16",
      description: "Optimized model for faster response times while maintaining high quality.",
      contextWindow: 128000,
      tokenLimit: 4096,
      releaseDate: new Date("2023-11-06"),
      pricing: {
        create: {
          id: 2,
          inputText: 0.01,
          outputText: 0.03
        }
      }
    },
    
    // Anthropic models
    {
      id: 3,
      systemName: "claude-3-5-sonnet",
      displayName: "Claude 3.5 Sonnet",
      categoryId: 1,
      parametersB: 720,
      vendorId: 2,
      host: "api.anthropic.com",
      precision: "BF16",
      description: "Claude 3.5 Sonnet is Anthropic's balanced model offering strong performance with impressive reasoning capabilities at an efficient price point.",
      contextWindow: 200000,
      tokenLimit: 4096,
      releaseDate: new Date("2024-07-23"),
      pricing: {
        create: {
          id: 3,
          inputText: 0.003,
          outputText: 0.015,
          finetuningInput: 0.0035,
          finetuningOutput: 0.016
        }
      }
    },
    {
      id: 4,
      systemName: "claude-3-opus",
      displayName: "Claude 3 Opus",
      categoryId: 3,
      parametersB: 340,
      vendorId: 2,
      host: "api.anthropic.com",
      precision: "BF16",
      description: "Claude 3 Opus is Anthropic's most capable model, with exceptional performance across tasks requiring deep expertise and nuanced understanding.",
      contextWindow: 200000,
      tokenLimit: 4096,
      releaseDate: new Date("2024-03-04"),
      pricing: {
        create: {
          id: 4,
          inputText: 0.015,
          outputText: 0.075
        }
      }
    },
    
    // Google models
    {
      id: 5,
      systemName: "gemini-1.5-pro",
      displayName: "Gemini 1.5 Pro",
      categoryId: 1,
      parametersB: 1500,
      vendorId: 3,
      host: "generativelanguage.googleapis.com",
      precision: "BF16",
      description: "Gemini 1.5 Pro is Google's most capable and cost-effective model for scaling across a wide range of tasks.",
      contextWindow: 1000000,
      tokenLimit: 8192,
      releaseDate: new Date("2024-05-15"),
      pricing: {
        create: {
          id: 5,
          inputText: 0.00035,
          outputText: 0.00105
        }
      }
    },
    {
      id: 6,
      systemName: "gemini-1.5-flash",
      displayName: "Gemini 1.5 Flash",
      categoryId: 4,
      parametersB: 1000,
      vendorId: 3,
      host: "generativelanguage.googleapis.com",
      precision: "BF16",
      description: "Gemini 1.5 Flash is Google's fastest and most affordable model, optimized for straightforward tasks.",
      contextWindow: 1000000,
      tokenLimit: 8192,
      releaseDate: new Date("2024-05-15"),
      pricing: {
        create: {
          id: 6,
          inputText: 0.000175,
          outputText: 0.000525
        }
      }
    },
    
    // Groq models
    {
      id: 7,
      systemName: "llama-3-70b-8192",
      displayName: "Llama 3 70B",
      categoryId: 1,
      parametersB: 70,
      vendorId: 4,
      host: "api.groq.com",
      precision: "BF16",
      description: "Meta's Llama 3 70B model running on Groq's LPU Inference Engine for extremely fast inference.",
      contextWindow: 8192,
      tokenLimit: 4096,
      releaseDate: new Date("2024-04-18"),
      pricing: {
        create: {
          id: 7,
          inputText: 0.0007,
          outputText: 0.0007
        }
      }
    },
    {
      id: 8,
      systemName: "mixtral-8x7b-32768",
      displayName: "Mixtral 8x7B",
      categoryId: 2,
      parametersB: 56,
      vendorId: 4,
      host: "api.groq.com",
      precision: "BF16",
      description: "Mistral AI's Mixtral 8x7B model running on Groq's LPU Inference Engine.",
      contextWindow: 32768,
      tokenLimit: 4096,
      releaseDate: new Date("2023-12-15"),
      pricing: {
        create: {
          id: 8,
          inputText: 0.0007,
          outputText: 0.0007
        }
      }
    },
    
    // Together AI models
    {
      id: 9,
      systemName: "togethercomputer/llama-3-70b-8192",
      displayName: "Llama-3-70B",
      categoryId: 1,
      parametersB: 70,
      vendorId: 5,
      host: "api.together.xyz",
      precision: "BF16",
      description: "Meta's Llama 3 70B, an advanced open foundation language model.",
      contextWindow: 8192,
      tokenLimit: 4096,
      releaseDate: new Date("2024-04-18"),
      pricing: {
        create: {
          id: 9,
          inputText: 0.0009,
          outputText: 0.0009
        }
      }
    },
    {
      id: 10,
      systemName: "togethercomputer/qwen2-72b-instruct",
      displayName: "Qwen2-72B",
      categoryId: 2,
      parametersB: 72,
      vendorId: 5,
      host: "api.together.xyz",
      precision: "BF16",
      description: "Alibaba's Qwen2-72B, a strong multilingual model.",
      contextWindow: 32768,
      tokenLimit: 2048,
      releaseDate: new Date("2024-05-23"),
      pricing: {
        create: {
          id: 10,
          inputText: 0.0015,
          outputText: 0.0015
        }
      }
    },
    
    // Perplexity models
    {
      id: 11,
      systemName: "pplx-70b-online",
      displayName: "pplx-70B-online",
      categoryId: 1,
      parametersB: 70,
      vendorId: 6,
      host: "api.perplexity.ai",
      precision: "BF16",
      description: "Perplexity's flagship model with real-time web search capabilities.",
      contextWindow: 4096,
      tokenLimit: 1024,
      releaseDate: new Date("2023-12-01"),
      pricing: {
        create: {
          id: 11,
          inputText: 0.002,
          outputText: 0.01
        }
      }
    },
    {
      id: 12,
      systemName: "pplx-7b-online",
      displayName: "pplx-7B-online",
      categoryId: 4,
      parametersB: 7,
      vendorId: 6,
      host: "api.perplexity.ai",
      precision: "BF16",
      description: "Perplexity's lightweight model with real-time web search capabilities.",
      contextWindow: 4096,
      tokenLimit: 1024,
      releaseDate: new Date("2023-12-01"),
      pricing: {
        create: {
          id: 12,
          inputText: 0.0005,
          outputText: 0.0025
        }
      }
    },
    
    // Inference.net models
    {
      id: 13,
      systemName: "infernet-claude-3-opus",
      displayName: "Claude 3 Opus (Inference.net)",
      categoryId: 3,
      parametersB: 340,
      vendorId: 7,
      host: "api.inference.net",
      precision: "BF16",
      description: "Claude 3 Opus available through Inference.net's API service.",
      contextWindow: 200000,
      tokenLimit: 4096,
      releaseDate: new Date("2024-03-04"),
      pricing: {
        create: {
          id: 13,
          inputText: 0.015,
          outputText: 0.075
        }
      }
    },
    {
      id: 14,
      systemName: "infernet-gpt-4o",
      displayName: "GPT-4o (Inference.net)",
      categoryId: 1,
      parametersB: 1500,
      vendorId: 7,
      host: "api.inference.net",
      precision: "BF16",
      description: "GPT-4o available through Inference.net's API service.",
      contextWindow: 128000,
      tokenLimit: 4096,
      releaseDate: new Date("2024-05-13"),
      pricing: {
        create: {
          id: 14,
          inputText: 0.0045,
          outputText: 0.0135
        }
      }
    }
  ];

  for (const model of models) {
    await prisma.aIModel.create({ data: model });
  }

  console.log('All data added successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });