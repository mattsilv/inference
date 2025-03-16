import { AIModel, Category, Vendor } from "@/lib/types";

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

// Filter models by selected categories and vendors
export const filterModels = (
  models: AIModel[],
  selectedCategories: string[],
  selectedVendors: string[]
): AIModel[] => {
  return models.filter((model) => {
    // If no categories are selected, include all
    const categoryMatch = selectedCategories.length === 0 || 
      (model.category && selectedCategories.includes(model.category.name));
    
    // If no vendors are selected, include all
    const vendorMatch = selectedVendors.length === 0 || 
      (model.vendor && selectedVendors.includes(model.vendor.name));
    
    return categoryMatch && vendorMatch;
  });
};

// Sort models by property and direction
export const sortModels = (
  models: AIModel[],
  key: string,
  direction: string
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