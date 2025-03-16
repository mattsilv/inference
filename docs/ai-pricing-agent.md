# AI Model Pricing Agent Documentation

This document outlines how to use the AI pricing agent integration with our model pricing database.

## Overview

The system consists of:

1. A Prisma database that stores model information, vendors, and pricing
2. An AI agent (external) that fetches the latest pricing information
3. A script that processes the agent's output and updates our database

## Getting Started

To generate vendor tracking information for your AI agent:

```bash
npm run pricing:info
```

This will create two important files:
- `scripts/tracking-info.json` - Contains URLs to track for each vendor
- `scripts/pricing-data-format.json` - Shows the expected data format

## Process Flow

1. The AI agent fetches data from vendor pricing pages
2. It extracts model names and their pricing details
3. It outputs a JSON file in the format specified in `pricing-data-format.json`
4. You run our updater script to integrate the pricing data

```bash
npm run pricing:update /path/to/agent-output.json
```

5. The script automatically updates the database and exports to JSON files

## Data Format

The AI agent should output a JSON file with an array of model pricing objects:

```json
[
  {
    "vendorName": "OpenAI",      // Must match our vendor names
    "modelName": "gpt-4o-mini",  // Must match our model system names
    "inputPrice": 0.15,          // Per 1M tokens for input/prompt
    "outputPrice": 0.6,          // Per 1M tokens for output/completion
    "finetuningInputPrice": 8.0, // Optional
    "finetuningOutputPrice": 16.0, // Optional
    "trainingCost": null         // Optional
  },
  // More models...
]
```

### Required Fields

- `vendorName`: Exact match to our vendor database (case-insensitive)
- `modelName`: Exact match to the system name in our model database
- `inputPrice`: Price per 1M tokens for input text
- `outputPrice`: Price per 1M tokens for output text

### Optional Fields

- `finetuningInputPrice`: Price for fine-tuning input
- `finetuningOutputPrice`: Price for fine-tuning output
- `trainingCost`: Cost for training

## Tracking Vendor Information

The system currently tracks the following vendors:

| Vendor | Pricing URL | Models List URL | API Endpoint |
|--------|-------------|----------------|--------------|
| OpenAI | https://openai.com/api/pricing/ | https://platform.openai.com/docs/api-reference/models/list | https://api.openai.com/v1/models |
| Anthropic | https://www.anthropic.com/pricing#anthropic-api | https://docs.anthropic.com/en/api/models-list | https://api.anthropic.com/v1/models |
| Google | https://cloud.google.com/vertex-ai/generative-ai/pricing | https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models | |
| Groq | https://groq.com/pricing/ | https://console.groq.com/docs/models | |
| Together AI | https://www.together.ai/pricing#inference | https://docs.together.ai/docs/inference-models | |
| Perplexity | https://docs.perplexity.ai/guides/pricing | https://docs.perplexity.ai/docs/models-overview | |
| Inference.net | https://inference.net/pricing | https://inference.net/models | |

## Pricing History

The system automatically tracks pricing history. When a price change is detected, the previous price is stored in the `PricingHistory` table with a timestamp. This allows for historical pricing analysis.

## Commands

- `npm run pricing:update [path]` - Update pricing from an AI agent's JSON output
- `npm run pricing:export` - Export database to JSON files
- `npm run pricing:info` - Generate tracking info for the AI agent

## Error Handling

The script processes each model independently, so if one model fails, others will still be processed. Errors are logged to the console.

## Validation

The system checks:
1. Vendor existence
2. Model existence
3. Price changes (to determine if history should be recorded)

## Database Schema

The pricing data is stored in:
- `Pricing` table - Current pricing information
- `PricingHistory` table - Historical pricing records

Each pricing entry includes:
- inputText - Price for input tokens
- outputText - Price for output tokens
- finetuningInput - Price for fine-tuning input
- finetuningOutput - Price for fine-tuning output
- trainingCost - Cost for training
- lastChecked - Timestamp of last verification