import { AIModel, Category, Vendor } from './types';

export interface ExportData {
  systemName: string;
  displayName: string;
  categoryName: string;
  parametersB: number;
  inputText: number;
  outputText: number;
  vendorName: string;
  contextWindow: number;
  tokenLimit: number;
  precision: string;
  isOpenSource: boolean;
  isHidden: boolean;
}

export const prepareExportData = (
  models: AIModel[], 
  categories: Category[], 
  vendors: Vendor[]
): ExportData[] => {
  return models.map(model => {
    const category = categories.find(c => c.id === model.categoryId);
    const vendor = vendors.find(v => v.id === model.vendorId);
    
    return {
      systemName: model.systemName,
      displayName: model.displayName,
      categoryName: category?.name || '',
      parametersB: model.parametersB,
      inputText: model.pricing?.inputText || 0,
      outputText: model.pricing?.outputText || 0,
      vendorName: vendor?.name || '',
      contextWindow: model.contextWindow || 0,
      tokenLimit: model.tokenLimit || 0,
      precision: model.precision || '',
      isOpenSource: model.isOpenSource || false,
      isHidden: model.isHidden || false,
    };
  });
};

export const exportAsCSV = (data: ExportData[], filename = 'ai_models_pricing.csv'): void => {
  if (data.length === 0) return;
  
  // Create CSV content
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => 
    Object.values(item).map(value => 
      typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value
    ).join(',')
  ).join('\n');
  
  const csvContent = `${headers}\n${rows}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create download link and trigger download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAsJSON = (data: ExportData[], filename = 'ai_models_pricing.json'): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link and trigger download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};