# Data Structure for Inference App

This directory contains the data used by the Inference App to display AI model pricing and specifications.

## Directory Structure

- `/src/data/vendors/` - Individual JSON files for each vendor's models
  - `openai.json` - OpenAI models
  - `anthropic.json` - Anthropic models
  - `google.json` - Google AI (Gemini) models
  - `meta-aws.json` - Meta/AWS (Llama) models
  - `mistral.json` - Mistral AI models
  - `deepseek.json` - DeepSeek models
- `/src/data/vendors.json` - List of all AI vendors
- `/src/data/categories.json` - Model categories (e.g., Vision, Fast, Premium)
- `/src/data/models.json` - Combined model data (generated from vendor files)

## Data Flow

1. Edit individual vendor files in `/src/data/vendors/`
2. Run validation with `npm run validate-models` to check for errors
3. Run `npm run generate-models` to merge vendor files into `models.json`
4. The app uses the combined `models.json` file at runtime

## Data Validation

The data validator (`/src/lib/dataValidator.ts`) checks for:

- Required fields presence
- Numeric field validity
- ID uniqueness across models and pricing
- Foreign key validity (categoryId, vendorId)
- Schema consistency

## Adding a New Model

1. Identify the vendor for the model
2. Add the model to the appropriate vendor file in `/src/data/vendors/`
3. Give the model a unique `id` (incremental from the last highest ID)
4. Include all required fields (see `types.ts` for the schema)
5. Validate your changes with `npm run validate-models`
6. Generate the combined models.json with `npm run generate-models`

## Adding a New Vendor

1. Add the vendor to `vendors.json` with a unique `id`
2. Create a new vendor file in `/src/data/vendors/{vendor-name}.json`
3. Add models for this vendor in the new file
4. Validate and generate as described above

## Required Fields

For each model:
- `id`: Unique model identifier (number)
- `systemName`: Technical/API name (string)
- `displayName`: Human-readable name (string)
- `categoryId`: Reference to category (number)
- `parametersB`: Model parameters in billions (number)
- `vendorId`: Reference to vendor (number)
- `host`: API hostname (string)
- `pricing`: Object containing pricing information

For pricing:
- `id`: Unique pricing identifier (number)
- `modelId`: Reference to parent model (number)
- `inputText`: Input token cost in USD per 1M tokens (number)
- `outputText`: Output token cost in USD per 1M tokens (number)

## Optional Fields

- `description`: Detailed model description
- `contextWindow`: Maximum context window size (in tokens)
- `tokenLimit`: Maximum output token limit
- `releaseDate`: Model release date (YYYY-MM-DD)
- `precision`: Model precision (e.g., "FP16", "BF16")
- `finetuningInput`: Cost to finetune with input tokens
- `finetuningOutput`: Cost to finetune with output tokens
- `trainingCost`: Training cost (if applicable)