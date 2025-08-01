import { AIModel, Category, Vendor } from "@/lib/types";
import { calculateInputCost, calculateOutputCost } from "./formatters";

// Get category name by ID
export const getCategoryName = (
  categoryId: number,
  categories: Category[]
): string => {
  const category = categories.find((cat) => cat.id === categoryId);
  return category ? category.name : "Unknown";
};

// Get vendor name by ID
export const getVendorName = (
  vendorId: number,
  vendors: Vendor[]
): string => {
  const vendor = vendors.find((v) => v.id === vendorId);
  return vendor ? vendor.name : "Unknown";
};

// Get vendor pricing URL
export const getVendorPricingUrl = (
  vendorId: number,
  vendors: Vendor[]
): string => {
  const vendor = vendors.find((v) => v.id === vendorId);
  return vendor ? vendor.pricingUrl : "#";
};

// Get vendor models list URL
export const getVendorModelsListUrl = (
  vendorId: number,
  vendors: Vendor[]
): string => {
  const vendor = vendors.find((v) => v.id === vendorId);
  return vendor ? vendor.modelsListUrl : "#";
};

// Get OpenRouter URL for a specific model
export const getOpenRouterModelUrl = (systemName: string): string => {
  if (!systemName) return "#";
  
  // OpenRouter URLs format: https://openrouter.ai/models/{systemName}
  // Some models already have the full path (e.g., "togethercomputer/llama-3-70b-8192")
  // Others just have the model name (e.g., "gpt-4o", "claude-3-5-sonnet")
  
  return `https://openrouter.ai/models/${encodeURIComponent(systemName)}`;
};

// Group models by category
export const groupModelsByCategory = (
  models: AIModel[],
  categories: Category[]
): Record<string, AIModel[]> => {
  const grouped: Record<string, AIModel[]> = {};
  
  // Initialize groups for all categories
  categories.forEach(category => {
    grouped[category.name] = [];
  });
  
  // Group models by category
  models.forEach(model => {
    if (model.category) {
      const categoryName = model.category.name;
      if (grouped[categoryName]) {
        grouped[categoryName].push(model);
      }
    }
  });
  
  return grouped;
};

// Check if a model is self-moderated
export const isSelfModeratedModel = (model: AIModel): boolean => {
  return model.systemName?.includes(':self-moderated') || 
         model.systemName?.includes('self-moderated') ||
         model.displayName?.toLowerCase().includes('self-moderated');
};

// Filter models by selected categories and vendors
export const filterModels = (
  models: AIModel[],
  selectedCategories: string[],
  selectedVendors: string[]
): AIModel[] => {
  return models.filter((model) => {
    // Exclude self-moderated models
    if (isSelfModeratedModel(model)) {
      return false;
    }
    
    // If no categories are selected, include all
    const categoryMatch = selectedCategories.length === 0 || 
      (model.category && selectedCategories.includes(model.category.name));
    
    // If no vendors are selected, include all
    const vendorMatch = selectedVendors.length === 0 || 
      (model.vendor && selectedVendors.includes(model.vendor.name));
    
    return categoryMatch && vendorMatch;
  });
};

// Filter models by context window range
export const filterModelsByContextWindow = (
  models: AIModel[],
  contextRange: string
): AIModel[] => {
  const filteredModels = models.filter((model) => {
    // Exclude self-moderated models
    if (isSelfModeratedModel(model)) {
      return false;
    }
    return true;
  });
  
  if (contextRange === 'all') {
    return filteredModels;
  }
  
  return filteredModels.filter((model) => {
    const contextWindow = model.contextWindow || 0;
    
    switch (contextRange) {
      case 'small': // < 32K
        return contextWindow < 32000;
      case 'medium': // 32K - 128K
        return contextWindow >= 32000 && contextWindow < 128000;
      case 'large': // 128K - 1M
        return contextWindow >= 128000 && contextWindow < 1000000;
      case 'xlarge': // 1M+
        return contextWindow >= 1000000;
      default:
        return true;
    }
  });
};

// Sort models by property and direction
export const sortModels = (
  models: AIModel[],
  key: string,
  direction: string,
  inputText?: string,
  outputText?: string
): AIModel[] => {
  const sortedModels = [...models];
  
  sortedModels.sort((a, b) => {
    // Handle nested properties
    let aValue: string | number;
    let bValue: string | number;
    
    if (key === 'inputPrice') {
      aValue = a.pricing?.inputText ?? Number.MAX_VALUE;
      bValue = b.pricing?.inputText ?? Number.MAX_VALUE;
    } else if (key === 'outputPrice') {
      aValue = a.pricing?.outputText ?? Number.MAX_VALUE;
      bValue = b.pricing?.outputText ?? Number.MAX_VALUE;
    } else if (key === 'samplePrice' && inputText && outputText) {
      // Calculate total costs (input + output) for sorting
      const aInputCost = a.pricing ? calculateInputCost(inputText, a.pricing.inputText) : undefined;
      // Use calculateOutputCost instead of calculateInputCost for output text to ensure correct pricing
      const aOutputCost = a.pricing ? calculateOutputCost(outputText, a.pricing.outputText) : undefined;
      const aTotalCost = (aInputCost !== undefined && aOutputCost !== undefined) 
        ? aInputCost + aOutputCost 
        : undefined;
      
      const bInputCost = b.pricing ? calculateInputCost(inputText, b.pricing.inputText) : undefined;
      // Fix the bug: Use calculateOutputCost instead of calculateInputCost for output text
      const bOutputCost = b.pricing ? calculateOutputCost(outputText, b.pricing.outputText) : undefined;
      const bTotalCost = (bInputCost !== undefined && bOutputCost !== undefined) 
        ? bInputCost + bOutputCost 
        : undefined;
      
      aValue = aTotalCost ?? Number.MAX_VALUE;
      bValue = bTotalCost ?? Number.MAX_VALUE;
    } else if (key === 'categoryName') {
      aValue = a.category?.name ?? '';
      bValue = b.category?.name ?? '';
    } else if (key === 'vendorName') {
      aValue = a.vendor?.name ?? '';
      bValue = b.vendor?.name ?? '';
    } else if (key === 'parametersB') {
      aValue = a.parametersB ?? 0;
      bValue = b.parametersB ?? 0;
    } else if (key === 'contextWindow') {
      aValue = a.contextWindow ?? 0;
      bValue = b.contextWindow ?? 0;
    } else if (key === 'tokenLimit') {
      aValue = a.tokenLimit ?? 0;
      bValue = b.tokenLimit ?? 0;
    } else {
      // Handle direct properties safely with proper type assertions
      aValue = key in a ? (a as unknown as Record<string, string | number>)[key] ?? '' : '';
      bValue = key in b ? (b as unknown as Record<string, string | number>)[key] ?? '' : '';
    }
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      // For numbers and other types
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }
  });
  
  return sortedModels;
};