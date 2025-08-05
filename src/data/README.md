# Data Structure for Inference App

**IMPORTANT**: This directory previously contained local JSON data files, but the application now uses **https://data.silv.app/ai/models.json** as the single source of truth.

## Data Source

All model data is fetched from: **https://data.silv.app/ai/models.json**

The application:
- Fetches data from the external API at build time and runtime
- Applies data transformation and filtering in `src/lib/dataService.ts`
- Caches API responses for 1 hour to balance freshness and performance
- Automatically handles model categorization, vendor extraction, and pricing normalization

## Data Management

Model data is now managed externally through the data.silv.app system. The local application:

1. **Fetches** data from the API endpoint
2. **Transforms** the data using `silvDataMapping()` in `dataService.ts`
3. **Filters** models to show only approved vendors and visible models
4. **Categorizes** models automatically based on their capabilities
5. **Normalizes** pricing data to the standard format ($/1M tokens)

## Adding Models

To add new models:
1. Update the source data at data.silv.app
2. The application will automatically fetch and display new models
3. No local file changes are needed

## Vendor and Category Management

- **Approved Vendors**: Anthropic, Google, Meta, DeepSeek, Inference.net
- **Model Filtering**: Only models from approved vendors are shown
- **Automatic Categorization**: Models are classified based on their capabilities
- **Version Management**: Only the latest versions of each model family are displayed

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