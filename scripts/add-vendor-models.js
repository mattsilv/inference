const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Models for each vendor
const vendorModels = {
  // OpenAI (id: 1)
  openai: [
    {
      systemName: "gpt-4o",
      displayName: "GPT-4o",
      categoryId: 1,
      parametersB: 1500,
      host: "api.openai.com",
      precision: "BF16",
      description: "OpenAI's latest multimodal model that can understand and respond to images, audio, and text.",
      contextWindow: 128000,
      tokenLimit: 4096,
      releaseDate: "2024-05-13",
      pricing: {
        inputText: 0.005,
        outputText: 0.015
      }
    },
    {
      systemName: "gpt-4-turbo",
      displayName: "GPT-4 Turbo",
      categoryId: 2,
      parametersB: 1760,
      host: "api.openai.com",
      precision: "BF16",
      description: "Optimized model for faster response times while maintaining high quality.",
      contextWindow: 128000,
      tokenLimit: 4096,
      releaseDate: "2023-11-06",
      pricing: {
        inputText: 0.01,
        outputText: 0.03
      }
    }
  ],
  
  // Anthropic (id: 2)
  anthropic: [
    {
      systemName: "claude-3-5-sonnet",
      displayName: "Claude 3.5 Sonnet",
      categoryId: 1,
      parametersB: 720,
      host: "api.anthropic.com",
      precision: "BF16",
      description: "Claude 3.5 Sonnet is Anthropic's balanced model offering strong performance with impressive reasoning capabilities at an efficient price point.",
      contextWindow: 200000,
      tokenLimit: 4096,
      releaseDate: "2024-07-23",
      pricing: {
        inputText: 0.003,
        outputText: 0.015,
        finetuningInput: 0.0035,
        finetuningOutput: 0.016
      }
    },
    {
      systemName: "claude-3-opus",
      displayName: "Claude 3 Opus",
      categoryId: 3,
      parametersB: 340,
      host: "api.anthropic.com",
      precision: "BF16",
      description: "Claude 3 Opus is Anthropic's most capable model, with exceptional performance across tasks requiring deep expertise and nuanced understanding.",
      contextWindow: 200000,
      tokenLimit: 4096,
      releaseDate: "2024-03-04",
      pricing: {
        inputText: 0.015,
        outputText: 0.075
      }
    }
  ],
  
  // Google (id: 3)
  google: [
    {
      systemName: "gemini-1.5-pro",
      displayName: "Gemini 1.5 Pro",
      categoryId: 1,
      parametersB: 1500,
      host: "generativelanguage.googleapis.com",
      precision: "BF16",
      description: "Gemini 1.5 Pro is Google's most capable and cost-effective model for scaling across a wide range of tasks.",
      contextWindow: 1000000,
      tokenLimit: 8192,
      releaseDate: "2024-05-15",
      pricing: {
        inputText: 0.00035,
        outputText: 0.00105
      }
    },
    {
      systemName: "gemini-1.5-flash",
      displayName: "Gemini 1.5 Flash",
      categoryId: 4,
      parametersB: 1000,
      host: "generativelanguage.googleapis.com",
      precision: "BF16",
      description: "Gemini 1.5 Flash is Google's fastest and most affordable model, optimized for straightforward tasks.",
      contextWindow: 1000000,
      tokenLimit: 8192,
      releaseDate: "2024-05-15",
      pricing: {
        inputText: 0.000175,
        outputText: 0.000525
      }
    }
  ],
  
  // Groq (id: 4)
  groq: [
    {
      systemName: "llama-3-70b-8192",
      displayName: "Llama 3 70B",
      categoryId: 1,
      parametersB: 70,
      host: "api.groq.com",
      precision: "BF16",
      description: "Meta's Llama 3 70B model running on Groq's LPU Inference Engine for extremely fast inference.",
      contextWindow: 8192,
      tokenLimit: 4096,
      releaseDate: "2024-04-18",
      pricing: {
        inputText: 0.0007,
        outputText: 0.0007
      }
    },
    {
      systemName: "mixtral-8x7b-32768",
      displayName: "Mixtral 8x7B",
      categoryId: 2,
      parametersB: 56,
      host: "api.groq.com",
      precision: "BF16",
      description: "Mistral AI's Mixtral 8x7B model running on Groq's LPU Inference Engine.",
      contextWindow: 32768,
      tokenLimit: 4096,
      releaseDate: "2023-12-15",
      pricing: {
        inputText: 0.0007,
        outputText: 0.0007
      }
    }
  ],
  
  // Together AI (id: 6)
  togetherai: [
    {
      systemName: "togethercomputer/llama-3-70b-8192",
      displayName: "Llama-3-70B",
      categoryId: 1,
      parametersB: 70,
      host: "api.together.xyz",
      precision: "BF16",
      description: "Meta's Llama 3 70B, an advanced open foundation language model.",
      contextWindow: 8192,
      tokenLimit: 4096,
      releaseDate: "2024-04-18",
      pricing: {
        inputText: 0.0009,
        outputText: 0.0009
      }
    },
    {
      systemName: "togethercomputer/qwen2-72b-instruct",
      displayName: "Qwen2-72B",
      categoryId: 2,
      parametersB: 72,
      host: "api.together.xyz",
      precision: "BF16",
      description: "Alibaba's Qwen2-72B, a strong multilingual model.",
      contextWindow: 32768,
      tokenLimit: 2048,
      releaseDate: "2024-05-23",
      pricing: {
        inputText: 0.0015,
        outputText: 0.0015
      }
    }
  ],
  
  // Perplexity (id: 7)
  perplexity: [
    {
      systemName: "pplx-70b-online",
      displayName: "pplx-70B-online",
      categoryId: 1,
      parametersB: 70,
      host: "api.perplexity.ai",
      precision: "BF16",
      description: "Perplexity's flagship model with real-time web search capabilities.",
      contextWindow: 4096,
      tokenLimit: 1024,
      releaseDate: "2023-12-01",
      pricing: {
        inputText: 0.002,
        outputText: 0.01
      }
    },
    {
      systemName: "pplx-7b-online",
      displayName: "pplx-7B-online",
      categoryId: 4,
      parametersB: 7,
      host: "api.perplexity.ai",
      precision: "BF16",
      description: "Perplexity's lightweight model with real-time web search capabilities.",
      contextWindow: 4096,
      tokenLimit: 1024,
      releaseDate: "2023-12-01",
      pricing: {
        inputText: 0.0005,
        outputText: 0.0025
      }
    }
  ],
  
  // Inference.net (id: 8)
  inferencenet: [
    {
      systemName: "infernet-claude-3-opus",
      displayName: "Claude 3 Opus (Inference.net)",
      categoryId: 3,
      parametersB: 340,
      host: "api.inference.net",
      precision: "BF16",
      description: "Claude 3 Opus available through Inference.net's API service.",
      contextWindow: 200000,
      tokenLimit: 4096,
      releaseDate: "2024-03-04",
      pricing: {
        inputText: 0.015,
        outputText: 0.075
      }
    },
    {
      systemName: "infernet-gpt-4o",
      displayName: "GPT-4o (Inference.net)",
      categoryId: 1,
      parametersB: 1500,
      host: "api.inference.net",
      precision: "BF16",
      description: "GPT-4o available through Inference.net's API service.",
      contextWindow: 128000,
      tokenLimit: 4096,
      releaseDate: "2024-05-13",
      pricing: {
        inputText: 0.0045,
        outputText: 0.0135
      }
    }
  ]
};

async function main() {
  console.log('Adding models for vendors...');
  
  // Counter for IDs
  let modelId = 1;
  let pricingId = 1;
  
  // OpenAI (id: 1)
  console.log('Adding OpenAI models...');
  for (const model of vendorModels.openai) {
    await prisma.aIModel.create({
      data: {
        id: modelId,
        systemName: model.systemName,
        displayName: model.displayName,
        categoryId: model.categoryId,
        parametersB: model.parametersB,
        vendorId: 1,
        host: model.host,
        precision: model.precision,
        description: model.description,
        contextWindow: model.contextWindow,
        tokenLimit: model.tokenLimit,
        releaseDate: model.releaseDate ? new Date(model.releaseDate) : undefined,
        pricing: {
          create: {
            id: pricingId,
            inputText: model.pricing.inputText,
            outputText: model.pricing.outputText,
            finetuningInput: model.pricing?.finetuningInput,
            finetuningOutput: model.pricing?.finetuningOutput,
            trainingCost: model.pricing?.trainingCost
          }
        }
      }
    });
    modelId++;
    pricingId++;
  }
  
  // Anthropic (id: 2)
  console.log('Adding Anthropic models...');
  for (const model of vendorModels.anthropic) {
    await prisma.aIModel.create({
      data: {
        id: modelId,
        systemName: model.systemName,
        displayName: model.displayName,
        categoryId: model.categoryId,
        parametersB: model.parametersB,
        vendorId: 2,
        host: model.host,
        precision: model.precision,
        description: model.description,
        contextWindow: model.contextWindow,
        tokenLimit: model.tokenLimit,
        releaseDate: model.releaseDate ? new Date(model.releaseDate) : undefined,
        pricing: {
          create: {
            id: pricingId,
            inputText: model.pricing.inputText,
            outputText: model.pricing.outputText,
            finetuningInput: model.pricing?.finetuningInput,
            finetuningOutput: model.pricing?.finetuningOutput,
            trainingCost: model.pricing?.trainingCost
          }
        }
      }
    });
    modelId++;
    pricingId++;
  }
  
  // Google (id: 3)
  console.log('Adding Google models...');
  for (const model of vendorModels.google) {
    await prisma.aIModel.create({
      data: {
        id: modelId,
        systemName: model.systemName,
        displayName: model.displayName,
        categoryId: model.categoryId,
        parametersB: model.parametersB,
        vendorId: 3,
        host: model.host,
        precision: model.precision,
        description: model.description,
        contextWindow: model.contextWindow,
        tokenLimit: model.tokenLimit,
        releaseDate: model.releaseDate ? new Date(model.releaseDate) : undefined,
        pricing: {
          create: {
            id: pricingId,
            inputText: model.pricing.inputText,
            outputText: model.pricing.outputText,
            finetuningInput: model.pricing?.finetuningInput,
            finetuningOutput: model.pricing?.finetuningOutput,
            trainingCost: model.pricing?.trainingCost
          }
        }
      }
    });
    modelId++;
    pricingId++;
  }
  
  // Groq (id: 4)
  console.log('Adding Groq models...');
  for (const model of vendorModels.groq) {
    await prisma.aIModel.create({
      data: {
        id: modelId,
        systemName: model.systemName,
        displayName: model.displayName,
        categoryId: model.categoryId,
        parametersB: model.parametersB,
        vendorId: 4,
        host: model.host,
        precision: model.precision,
        description: model.description,
        contextWindow: model.contextWindow,
        tokenLimit: model.tokenLimit,
        releaseDate: model.releaseDate ? new Date(model.releaseDate) : undefined,
        pricing: {
          create: {
            id: pricingId,
            inputText: model.pricing.inputText,
            outputText: model.pricing.outputText,
            finetuningInput: model.pricing?.finetuningInput,
            finetuningOutput: model.pricing?.finetuningOutput,
            trainingCost: model.pricing?.trainingCost
          }
        }
      }
    });
    modelId++;
    pricingId++;
  }
  
  // Together AI (id: 5) - updated ID
  console.log('Adding Together AI models...');
  for (const model of vendorModels.togetherai) {
    await prisma.aIModel.create({
      data: {
        id: modelId,
        systemName: model.systemName,
        displayName: model.displayName,
        categoryId: model.categoryId,
        parametersB: model.parametersB,
        vendorId: 5, // Updated ID
        host: model.host,
        precision: model.precision,
        description: model.description,
        contextWindow: model.contextWindow,
        tokenLimit: model.tokenLimit,
        releaseDate: model.releaseDate ? new Date(model.releaseDate) : undefined,
        pricing: {
          create: {
            id: pricingId,
            inputText: model.pricing.inputText,
            outputText: model.pricing.outputText,
            finetuningInput: model.pricing?.finetuningInput,
            finetuningOutput: model.pricing?.finetuningOutput,
            trainingCost: model.pricing?.trainingCost
          }
        }
      }
    });
    modelId++;
    pricingId++;
  }
  
  // Perplexity (id: 6) - updated ID
  console.log('Adding Perplexity models...');
  for (const model of vendorModels.perplexity) {
    await prisma.aIModel.create({
      data: {
        id: modelId,
        systemName: model.systemName,
        displayName: model.displayName,
        categoryId: model.categoryId,
        parametersB: model.parametersB,
        vendorId: 6, // Updated ID
        host: model.host,
        precision: model.precision,
        description: model.description,
        contextWindow: model.contextWindow,
        tokenLimit: model.tokenLimit,
        releaseDate: model.releaseDate ? new Date(model.releaseDate) : undefined,
        pricing: {
          create: {
            id: pricingId,
            inputText: model.pricing.inputText,
            outputText: model.pricing.outputText,
            finetuningInput: model.pricing?.finetuningInput,
            finetuningOutput: model.pricing?.finetuningOutput,
            trainingCost: model.pricing?.trainingCost
          }
        }
      }
    });
    modelId++;
    pricingId++;
  }
  
  // Inference.net (id: 7) - updated ID
  console.log('Adding Inference.net models...');
  for (const model of vendorModels.inferencenet) {
    await prisma.aIModel.create({
      data: {
        id: modelId,
        systemName: model.systemName,
        displayName: model.displayName,
        categoryId: model.categoryId,
        parametersB: model.parametersB,
        vendorId: 7, // Updated ID
        host: model.host,
        precision: model.precision,
        description: model.description,
        contextWindow: model.contextWindow,
        tokenLimit: model.tokenLimit,
        releaseDate: model.releaseDate ? new Date(model.releaseDate) : undefined,
        pricing: {
          create: {
            id: pricingId,
            inputText: model.pricing.inputText,
            outputText: model.pricing.outputText,
            finetuningInput: model.pricing?.finetuningInput,
            finetuningOutput: model.pricing?.finetuningOutput,
            trainingCost: model.pricing?.trainingCost
          }
        }
      }
    });
    modelId++;
    pricingId++;
  }
  
  console.log('All models added successfully!');
}

main()
  .catch((e) => {
    console.error('Error adding models:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });