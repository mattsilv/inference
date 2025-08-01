import { AIModel, Category, Vendor } from './types';

// Interface for external API model data
interface ApiModel {
  id?: string;
  name?: string;
  display_name?: string;
  description?: string;
  desc?: string;
  parameters?: string | number;
  parametersB?: string | number;
  params?: string | number;
  context_length?: string | number;
  contextWindow?: string | number;
  max_context?: string | number;
  context_size?: string | number;
  top_provider?: {
    max_completion_tokens?: string | number;
  };
  max_tokens?: string | number;
  tokenLimit?: string | number;
  output_limit?: string | number;
  created?: string | number;
  releaseDate?: string | Date;
  precision?: string;
  isOpenSource?: boolean;
  open_source?: boolean;
  isHidden?: boolean;
  hidden?: boolean;
  architecture?: {
    modality?: string;
  };
  modality?: string;
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
    input?: string | number;
    output?: string | number;
    inputText?: string | number;
    outputText?: string | number;
    finetuningInput?: string | number;
    finetuningOutput?: string | number;
    fine_tuning_input?: string | number;
    fine_tuning_output?: string | number;
    trainingCost?: string | number;
    training_cost?: string | number;
  };
  [key: string]: unknown; // For any additional fields
}

// Interface for structured API response
interface ApiResponse {
  models?: AIModel[];
  categories?: Category[];
  vendors?: Vendor[];
  data?: { models?: ApiModel[] };
  response?: { models?: ApiModel[] };
  results?: { models?: ApiModel[] };
  items?: ApiModel[];
  list?: ApiModel[];
  [key: string]: unknown;
}

/**
 * Data service that loads data from external API only
 */
export async function loadData(): Promise<{
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
}> {
  // Load from external API - this is now our only source of truth
  return await loadDataFromSilvApi();
}

/**
 * Load data from silv.app API with data mapping wrapper and build-time fallback
 */
export async function loadDataFromSilvApi(): Promise<{
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
}> {
  try {
    const response = await fetch('https://data.silv.app/ai/models.json', {
      next: { revalidate: 3600 }, // Cache for 1 hour - good balance of freshness and static generation
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'inference-pricing-tool'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const rawData = await response.json();
    
    // Apply silv-data-mapping wrapper to transform the data
    return silvDataMapping(rawData);
  } catch (error) {
    console.error('Error loading data from silv.app API:', error);
    
    // During build time, if the API is unavailable, provide minimal fallback data
    // This ensures the build never fails due to external API issues
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
      console.warn('Using fallback data for production build due to API unavailability');
      return {
        models: [],
        categories: [
          {
            id: 1,
            name: 'General',
            description: 'General purpose AI models',
            models: []
          }
        ],
        vendors: [
          {
            id: 1,
            name: 'Anthropic',
            pricingUrl: 'https://anthropic.com/pricing',
            modelsListUrl: 'https://anthropic.com/models',
            models: []
          }
        ]
      };
    }
    
    throw new Error(`Failed to load data from silv.app API: ${error}`);
  }
}

/**
 * Silv data mapping wrapper - transforms external API data to our internal format
 * Highly flexible to handle various data structures from different providers
 */
function silvDataMapping(rawData: ApiResponse | ApiModel[]): {
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
} {
  try {
    // Handle direct array format (just an array of models)
    if (Array.isArray(rawData)) {
      return transformOpenRouterData({ models: rawData });
    }
    
    // If the data is already in our expected format, use it directly with safety checks
    if ('models' in rawData && 'categories' in rawData && 'vendors' in rawData && 
        Array.isArray(rawData.models) && Array.isArray(rawData.categories) && Array.isArray(rawData.vendors)) {
      return handleStructuredData(rawData);
    }
    
    // Handle OpenRouter-style API format (models array only)
    if ('models' in rawData && Array.isArray(rawData.models)) {
      return transformOpenRouterData({ models: rawData.models as unknown as ApiModel[] });
    }
    
    // Handle alternative structures (e.g., data.models, response.models, etc.)
    const possibleModelArrays = [
      'data' in rawData ? rawData.data?.models : undefined,
      'response' in rawData ? rawData.response?.models : undefined,
      'results' in rawData ? rawData.results?.models : undefined,
      'items' in rawData ? rawData.items : undefined,
      'list' in rawData ? rawData.list : undefined
    ];
    
    for (const modelArray of possibleModelArrays) {
      if (Array.isArray(modelArray)) {
        return transformOpenRouterData({ models: modelArray as unknown as ApiModel[] });
      }
    }
    
    console.error('Unrecognized data format:', Object.keys(rawData));
    throw new Error('Unable to process data format from silv.app API');
  } catch (error) {
    console.error('Error in silvDataMapping:', error);
    throw new Error(`Failed to transform data from silv.app API: ${error}`);
  }
}

/**
 * Handle structured data that already has models, categories, and vendors
 */
function handleStructuredData(rawData: ApiResponse): {
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
} {
  const { models, categories, vendors } = rawData;
  
  try {
    // Safely establish relationships with error handling
    for (const model of models) {
      try {
        model.category = categories.find((c: Category) => c.id === model.categoryId);
        model.vendor = vendors.find((v: Vendor) => v.id === model.vendorId);
      } catch (error) {
        console.warn('Failed to establish relationships for model:', model.id, error);
      }
    }
    
    // Filter out hidden models for frontend display with safety checks
    const visibleModels = models.filter((model: AIModel) => {
      try {
        return !model.isHidden;
      } catch (error) {
        console.warn('Error checking model visibility:', model.id, error);
        return true; // Default to visible if check fails
      }
    });
    
    // Filter out inactive categories with flexible ID checking
    const visibleCategories = categories.filter((category: Category) => {
      try {
        // Handle various ways "inactive" might be represented
        return category.id !== 6 && 
               category.name?.toLowerCase() !== 'inactive' &&
               category.name?.toLowerCase() !== 'hidden';
      } catch (error) {
        console.warn('Error checking category visibility:', category.id, error);
        return true; // Default to visible if check fails
      }
    });
    
    // Establish filtered relationships safely
    for (const category of visibleCategories) {
      try {
        category.models = visibleModels.filter((m: AIModel) => m.categoryId === category.id);
      } catch (error) {
        console.warn('Error setting models for category:', category.id, error);
        category.models = [];
      }
    }
    
    for (const vendor of vendors) {
      try {
        vendor.models = visibleModels.filter((m: AIModel) => m.vendorId === vendor.id);
      } catch (error) {
        console.warn('Error setting models for vendor:', vendor.id, error);
        vendor.models = [];
      }
    }
    
    return { models: visibleModels, categories: visibleCategories, vendors };
  } catch (error) {
    console.error('Error processing structured data:', error);
    throw error;
  }
}

/**
 * Safely extract vendor information from model ID - flexible for any provider format
 */
function extractVendorInfo(modelId: string, modelName?: string): { name: string; key: string } {
  let vendorName = 'Unknown';
  
  if (modelId) {
    // Handle various ID formats: "vendor/model", "vendor:model", "vendor-model", or just "model"
    const separators = ['/', ':', '-'];
    for (const sep of separators) {
      if (modelId.includes(sep)) {
        vendorName = modelId.split(sep)[0];
        break;
      }
    }
    
    // If no separator found, try to extract from model name
    if (vendorName === 'Unknown' && modelName) {
      // Look for common vendor patterns in model names
      const commonVendors = ['openai', 'anthropic', 'google', 'meta', 'microsoft', 'cohere', 'deepseek', 'mistral', 'qwen'];
      const lowerName = modelName.toLowerCase();
      const foundVendor = commonVendors.find(vendor => lowerName.includes(vendor));
      if (foundVendor) {
        vendorName = foundVendor;
      }
    }
  }
  
  return {
    name: vendorName.charAt(0).toUpperCase() + vendorName.slice(1),
    key: vendorName.toLowerCase()
  };
}

/**
 * Intelligent category classification - expandable for new model types
 */
function classifyModel(apiModel: ApiModel): string {
  const name = (apiModel.name || '').toLowerCase();
  const description = (apiModel.description || '').toLowerCase();
  const id = (apiModel.id || '').toLowerCase();
  const combined = `${name} ${description} ${id}`;
  
  // Comprehensive classification patterns - easily expandable
  const classifications = [
    {
      name: 'Code Generation',
      patterns: ['code', 'coding', 'programmer', 'developer', 'github', 'repository', 'programming']
    },
    {
      name: 'Multimodal',
      patterns: ['vision', 'image', 'visual', 'multimodal', 'picture', 'photo', 'camera', 'ocr']
    },
    {
      name: 'Reasoning',
      patterns: ['reasoning', 'thinking', 'logic', 'math', 'problem', 'analysis', 'analytical']
    },
    {
      name: 'Conversational',
      patterns: ['chat', 'conversation', 'assistant', 'dialogue', 'instruct', 'helpful']
    },
    {
      name: 'Specialized',
      patterns: ['medical', 'legal', 'financial', 'scientific', 'research', 'domain', 'expert']
    }
  ];
  
  // Find the best matching category
  for (const category of classifications) {
    if (category.patterns.some(pattern => combined.includes(pattern))) {
      return category.name;
    }
  }
  
  return 'General'; // Default fallback
}

/**
 * Classify models by capability tier based on parameters, performance indicators, and vendor positioning
 */
function classifyCapabilityTier(apiModel: ApiModel): string {
  const name = (apiModel.name || '').toLowerCase();
  const description = (apiModel.description || '').toLowerCase();
  const id = (apiModel.id || '').toLowerCase();
  const combined = `${name} ${description} ${id}`;
  
  // Extract parameter count if available
  let parameterCount = 0;
  if (apiModel.parameters) {
    parameterCount = parseFloat(apiModel.parameters.toString()) || 0;
  } else if (apiModel.parametersB) {
    parameterCount = parseFloat(apiModel.parametersB.toString()) || 0;
  } else if (apiModel.params) {
    parameterCount = parseFloat(apiModel.params.toString()) || 0;
  }
  
  // Extract context window
  let contextWindow = 0;
  const contextRaw = apiModel.context_length || apiModel.contextWindow || apiModel.max_context || apiModel.context_size;
  if (contextRaw) {
    contextWindow = parseInt(contextRaw.toString()) || 0;
  }
  
  // Frontier models - cutting-edge, latest generation models
  const frontierPatterns = [
    'gpt-4o', 'gpt-4-turbo', 'claude-3.5-sonnet', 'claude-3-opus', 'gemini-1.5-pro', 'gemini-2.0',
    'o1-preview', 'o1-mini', 'llama-3.1-405b', 'llama-3.2-90b', 'qwen2.5-72b', 'deepseek-v3'
  ];
  
  // Production models - reliable, widely-used models for production workloads
  const productionPatterns = [
    'gpt-3.5-turbo', 'claude-3-haiku', 'claude-3-sonnet', 'gemini-1.5-flash', 'gemini-pro',
    'llama-3.1-70b', 'llama-3.1-8b', 'mistral-large', 'mixtral-8x7b', 'qwen2.5-32b'
  ];
  
  // Specialized models - domain-specific or task-optimized models
  const specializedPatterns = [
    'code', 'medical', 'legal', 'finance', 'embed', 'rerank', 'vision', 'audio', 'translation',
    'summarization', 'instruct', 'finetune', 'reasoning', 'math', 'science'
  ];
  
  // Experimental models - research, preview, or beta models
  const experimentalPatterns = [
    'preview', 'beta', 'alpha', 'experimental', 'research', 'test', 'dev', 'unstable',
    'snapshot', 'nightly'
  ];
  
  // Check for frontier models first (highest tier)
  if (frontierPatterns.some(pattern => combined.includes(pattern)) || 
      parameterCount >= 70 || contextWindow >= 1000000) {
    return 'Frontier';
  }
  
  // Check for experimental models
  if (experimentalPatterns.some(pattern => combined.includes(pattern))) {
    return 'Experimental';
  }
  
  // Check for specialized models
  if (specializedPatterns.some(pattern => combined.includes(pattern))) {
    return 'Specialized';
  }
  
  // Check for production models
  if (productionPatterns.some(pattern => combined.includes(pattern)) ||
      (parameterCount >= 7 && parameterCount < 70) ||
      (contextWindow >= 32000 && contextWindow < 1000000)) {
    return 'Production';
  }
  
  // Default based on parameter size and context window
  if (parameterCount >= 30 || contextWindow >= 128000) {
    return 'Production';
  } else if (parameterCount >= 7 || contextWindow >= 16000) {
    return 'Standard';
  } else if (parameterCount > 0 || contextWindow > 0) {
    return 'Lightweight';
  }
  
  return 'Standard'; // Default fallback
}

/**
 * Safely extract and convert pricing - handles missing fields gracefully
 */
function extractPricing(apiModel: ApiModel, index: number): {
  id: number;
  modelId: number;
  inputText: number;
  outputText: number;
  finetuningInput?: number;
  finetuningOutput?: number;
  trainingCost?: number;
} | undefined {
  if (!apiModel.pricing) return undefined;
  
  const pricing = apiModel.pricing;
  
  // Safely parse pricing with fallbacks
  const parsePrice = (value: string | number | undefined | null, multiplier = 1000000): number => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? 0 : parsed * multiplier;
  };
  
  return {
    id: index + 1,
    modelId: index + 1,
    inputText: parsePrice(pricing.prompt || pricing.input || pricing.inputText),
    outputText: parsePrice(pricing.completion || pricing.output || pricing.outputText),
    finetuningInput: parsePrice(pricing.finetuningInput || pricing.fine_tuning_input, 1000000),
    finetuningOutput: parsePrice(pricing.finetuningOutput || pricing.fine_tuning_output, 1000000),
    trainingCost: parsePrice(pricing.trainingCost || pricing.training_cost, 1000000)
  };
}

/**
 * Safely extract model parameters - handles various field names and formats
 */
function extractModelParams(apiModel: ApiModel): Partial<AIModel> {
  // Handle various ways parameters might be specified
  let parametersB = null;
  if (apiModel.parameters) {
    parametersB = parseFloat(apiModel.parameters.toString()) || null;
  } else if (apiModel.parametersB) {
    parametersB = parseFloat(apiModel.parametersB.toString()) || null;
  } else if (apiModel.params) {
    parametersB = parseFloat(apiModel.params.toString()) || null;
  }
  
  // Handle various ways context window might be specified
  let contextWindow: number | undefined = undefined;
  const contextRaw = apiModel.context_length || apiModel.contextWindow || apiModel.max_context || apiModel.context_size;
  if (contextRaw) {
    contextWindow = parseInt(contextRaw.toString()) || undefined;
  }
  
  // Handle various ways token limit might be specified
  let tokenLimit: number | undefined = undefined;
  const tokenRaw = apiModel.top_provider?.max_completion_tokens || 
                   apiModel.max_tokens || 
                   apiModel.tokenLimit || 
                   apiModel.output_limit;
  if (tokenRaw) {
    tokenLimit = parseInt(tokenRaw.toString()) || undefined;
  }
  
  // Handle release date in various formats
  let releaseDate = undefined;
  if (apiModel.created) {
    if (typeof apiModel.created === 'number') {
      releaseDate = new Date(apiModel.created * 1000).toISOString().split('T')[0];
    } else if (typeof apiModel.created === 'string') {
      releaseDate = new Date(apiModel.created).toISOString().split('T')[0];
    }
  } else if (apiModel.releaseDate) {
    releaseDate = new Date(apiModel.releaseDate).toISOString().split('T')[0];
  }
  
  // Handle modality extraction from architecture field
  let modality = undefined;
  if (apiModel.architecture?.modality) {
    modality = apiModel.architecture.modality;
  } else if (apiModel.modality) {
    modality = apiModel.modality;
  }

  // Classify capability tier
  const capabilityTier = classifyCapabilityTier(apiModel);

  return {
    parametersB,
    contextWindow,
    tokenLimit,
    releaseDate,
    description: apiModel.description || apiModel.desc || undefined,
    precision: apiModel.precision || undefined,
    isOpenSource: Boolean(apiModel.isOpenSource || apiModel.open_source || false),
    isHidden: Boolean(apiModel.isHidden || apiModel.hidden || false),
    modality,
    capabilityTier
  };
}

/**
 * Model versioning classifier - filters models to show only latest versions per provider
 * Shows at most 2 versions: preview version (if available) + latest stable version
 */
function filterToLatestVersions(models: AIModel[]): AIModel[] {
  const modelsByVendor = new Map<number, AIModel[]>();
  
  // Group models by vendor
  models.forEach(model => {
    if (!modelsByVendor.has(model.vendorId)) {
      modelsByVendor.set(model.vendorId, []);
    }
    modelsByVendor.get(model.vendorId)!.push(model);
  });
  
  const filteredModels: AIModel[] = [];
  
  // For each vendor, select only the latest versions
  modelsByVendor.forEach((vendorModels) => {
    // Group models by base name (removing version indicators)
    const modelFamilies = new Map<string, AIModel[]>();
    
    vendorModels.forEach(model => {
      const baseName = extractBaseModelName(model.displayName);
      if (!modelFamilies.has(baseName)) {
        modelFamilies.set(baseName, []);
      }
      modelFamilies.get(baseName)!.push(model);
    });
    
    // For each model family, select preview + latest versions
    modelFamilies.forEach(familyModels => {
      // Sort by release date (newest first) and version indicators
      const sortedModels = familyModels.sort((a, b) => {
        // Prioritize preview/beta models
        const aIsPreview = isPreviewModel(a.displayName, a.systemName);
        const bIsPreview = isPreviewModel(b.displayName, b.systemName);
        
        if (aIsPreview && !bIsPreview) return -1;
        if (!aIsPreview && bIsPreview) return 1;
        
        // Then sort by release date if available
        if (a.releaseDate && b.releaseDate) {
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        }
        
        // Finally sort by version number patterns
        return compareVersions(a.displayName, b.displayName);
      });
      
      // Take preview model (if exists) + latest stable model
      const previewModel = sortedModels.find(m => isPreviewModel(m.displayName, m.systemName));
      const latestStable = sortedModels.find(m => !isPreviewModel(m.displayName, m.systemName));
      
      if (previewModel) filteredModels.push(previewModel);
      if (latestStable && latestStable !== previewModel) filteredModels.push(latestStable);
    });
  });
  
  return filteredModels;
}

/**
 * Extract base model name by removing version indicators
 */
function extractBaseModelName(displayName: string): string {
  const name = displayName.toLowerCase();
  
  // Remove common version patterns
  return name
    .replace(/\s*(v?\d+\.?\d*\.?\d*)\s*$/i, '') // Remove trailing version numbers
    .replace(/\s*-\s*(preview|beta|alpha|turbo|instruct)\s*$/i, '') // Remove model type suffixes
    .replace(/\s*\(.*\)\s*$/i, '') // Remove parenthetical content
    .replace(/\s*:\s*free\s*$/i, '') // Remove :free suffix
    .trim();
}

/**
 * Check if a model is a preview/beta version
 */
function isPreviewModel(displayName: string, systemName?: string): boolean {
  const combined = `${displayName} ${systemName || ''}`.toLowerCase();
  return /\b(preview|beta|alpha|experimental|dev|snapshot|nightly|unstable|test)\b/.test(combined);
}

/**
 * Compare model versions for sorting (newer first)
 */
function compareVersions(nameA: string, nameB: string): number {
  // Extract version numbers
  const versionA = extractVersionNumber(nameA);
  const versionB = extractVersionNumber(nameB);
  
  if (versionA !== null && versionB !== null) {
    return versionB - versionA; // Newer versions first
  }
  
  // Fallback to alphabetical comparison (reverse for newer models)
  return nameB.localeCompare(nameA);
}

/**
 * Extract numeric version from model name
 */
function extractVersionNumber(name: string): number | null {
  const match = name.match(/(\d+\.?\d*\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Transform OpenRouter-style API data to our internal format - highly flexible for new providers
 */
function transformOpenRouterData(rawData: { models: ApiModel[] }): {
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
} {
  // Define allowed vendors (major model creators + Inference.net)
  const allowedVendors = [
    'anthropic',    // Claude models
    'google',       // Gemini/Gemma models
    'meta',         // Llama models
    'deepseek',     // DeepSeek models
    'inference-net' // Inference.net - cheap provider
  ];
  
  // Filter models to only include those from allowed vendors
  const allowedApiModels = rawData.models.filter((apiModel: ApiModel) => {
    const vendorInfo = extractVendorInfo(apiModel.id, apiModel.name);
    return allowedVendors.includes(vendorInfo.key.toLowerCase());
  });
  
  const vendors = new Map<string, Vendor>();
  const categories = new Map<string, Category>();
  const models: AIModel[] = [];
  
  // Process each filtered model from the API
  allowedApiModels.forEach((apiModel: ApiModel, index: number) => {
    try {
      // Flexible vendor extraction
      const vendorInfo = extractVendorInfo(apiModel.id, apiModel.name);
      
      // Create or get vendor
      if (!vendors.has(vendorInfo.key)) {
        vendors.set(vendorInfo.key, {
          id: vendors.size + 1,
          name: vendorInfo.name,
          pricingUrl: `https://${vendorInfo.key}.com/pricing`,
          modelsListUrl: `https://${vendorInfo.key}.com/models`,
          models: []
        });
      }
      
      // Intelligent category classification
      const categoryName = classifyModel(apiModel);
      const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '-');
      
      // Create or get category
      if (!categories.has(categoryKey)) {
        categories.set(categoryKey, {
          id: categories.size + 1,
          name: categoryName,
          description: `${categoryName} models and applications`,
          models: []
        });
      }
      
      const vendor = vendors.get(vendorInfo.key)!;
      const category = categories.get(categoryKey)!;
      
      // Extract pricing safely
      const pricing = extractPricing(apiModel, index);
      
      // Extract model parameters safely
      const modelParams = extractModelParams(apiModel);
      
      // Create model with flexible data handling
      const model: AIModel = {
        id: index + 1,
        systemName: apiModel.id || `unknown-${index}`,
        displayName: apiModel.name || apiModel.display_name || apiModel.id || `Model ${index}`,
        categoryId: category.id,
        parametersB: modelParams.parametersB || 0, // Required field with fallback
        vendorId: vendor.id,
        host: vendorInfo.name,
        pricing,
        category,
        vendor,
        ...modelParams // Spread all the safely extracted parameters
      };
      
      models.push(model);
    } catch (error) {
      console.warn(`Failed to process model at index ${index}:`, error);
      // Continue processing other models even if one fails
    }
  });
  
  // Apply model versioning classifier to show only latest versions
  const filteredModels = filterToLatestVersions(models);
  
  // Convert maps to arrays and establish relationships
  const vendorArray = Array.from(vendors.values());
  const categoryArray = Array.from(categories.values());
  
  // Establish model relationships with filtered models
  for (const vendor of vendorArray) {
    vendor.models = filteredModels.filter(m => m.vendorId === vendor.id);
  }
  
  for (const category of categoryArray) {
    category.models = filteredModels.filter(m => m.categoryId === category.id);
  }
  
  return {
    models: filteredModels,
    categories: categoryArray,
    vendors: vendorArray
  };
}

