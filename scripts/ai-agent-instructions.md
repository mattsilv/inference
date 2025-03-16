# AI Pricing Agent Instructions

## Task

Your task is to extract detailed pricing information for AI models from vendor websites and documentation. This information will be used to keep our pricing database up-to-date.

## Input

You will be given a list of vendors and their respective pricing pages, model list pages, and API endpoints (when available).

## Output

You should produce a JSON file with the following structure:

```json
[
  {
    "vendorName": "OpenAI",
    "modelName": "gpt-4o-mini",
    "inputPrice": 0.15,
    "outputPrice": 0.6,
    "finetuningInputPrice": 8.0,
    "finetuningOutputPrice": 16.0
  },
  {
    "vendorName": "Anthropic",
    "modelName": "claude-3-opus-20240229",
    "inputPrice": 15.0,
    "outputPrice": 75.0
  },
  // More models...
]
```

## Required Fields

1. `vendorName`: The name of the vendor (must match our database exactly)
2. `modelName`: The system name of the model (must match our database exactly)
3. `inputPrice`: Price per 1M tokens for input/prompt in USD
4. `outputPrice`: Price per 1M tokens for output/completion in USD

## Optional Fields

1. `finetuningInputPrice`: Price for fine-tuning input in USD per 1M tokens
2. `finetuningOutputPrice`: Price for fine-tuning output in USD per 1M tokens
3. `trainingCost`: Cost for training in USD

## Guidelines

1. Visit each vendor's pricing page and model list page
2. Use API endpoints when available to get the latest model information
3. For each model, extract the pricing information
4. Ensure prices are normalized to USD per 1M tokens
5. Use the exact model system names as found in the vendor's documentation
6. If a model is not in our database, still include it with appropriate naming
7. If pricing information is unavailable, do not include that field
8. If a vendor has regional pricing, use US pricing as the default
9. Check for any fine-tuning or training costs when available

## Vendors to Track

You will be tracking these vendors:

1. OpenAI (GPT models)
2. Anthropic (Claude models)
3. Google (Gemini models)
4. Groq
5. Together AI
6. Perplexity
7. Inference.net

## Daily Schedule

1. Run this task once per day to detect any pricing changes
2. Always check all vendors and models each time
3. Output a complete dataset, not just changes

## Special Considerations

1. Look for any new models that have been released
2. Check for models that have been deprecated or renamed
3. Note any pricing changes in your summary
4. Some vendors may list prices in different formats (per token, per 1000 tokens, etc.) - normalize to per 1M tokens

## Technical Details

1. All prices should be in USD with decimal precision
2. System names must match exactly for proper database updating
3. Missing or null fields are allowed for optional fields
4. Save your output as a JSON file