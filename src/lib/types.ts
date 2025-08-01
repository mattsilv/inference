export interface AIModel {
  id: number;
  systemName: string;
  displayName: string;
  categoryId: number;
  parametersB: number;
  vendorId: number;
  host: string;
  precision?: string;
  description?: string;
  contextWindow?: number;
  tokenLimit?: number;
  releaseDate?: string;
  isOpenSource?: boolean;
  isHidden?: boolean;
  modality?: string;
  capabilityTier?: string;
  pricing?: Pricing;
  category?: Category;
  vendor?: Vendor;
}

export interface Pricing {
  id: number;
  modelId: number;
  inputText: number;
  outputText: number;
  finetuningInput?: number;
  finetuningOutput?: number;
  trainingCost?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  useCase?: string;
  models?: AIModel[];
}

export interface Vendor {
  id: number;
  name: string;
  pricingUrl: string;
  modelsListUrl: string;
  models?: AIModel[];
}

// Extend Window interface with download functions
declare global {
  interface Window {
    handleDownloadCSV?: () => void;
    handleDownloadJSON?: () => void;
  }
}