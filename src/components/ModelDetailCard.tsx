'use client';

import React from 'react';
import { AIModel, Category, Vendor } from '@/lib/types';

interface ModelDetailCardProps {
  model: AIModel;
  categories: Category[];
  vendors: Vendor[];
}

const ModelDetailCard: React.FC<ModelDetailCardProps> = ({ 
  model, 
  categories, 
  vendors 
}) => {
  // Get category name by ID
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Get vendor name by ID
  const getVendorName = (vendorId: number): string => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : 'Unknown';
  };

  // Get vendor pricing URL
  const getVendorPricingUrl = (vendorId: number): string => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.pricingUrl : '#';
  };

  // Format number as parameter size (e.g., 1800 -> "1.8T")
  const formatParameters = (paramB: number): string => {
    if (paramB >= 1000) {
      return `${(paramB / 1000).toFixed(1)}T`;
    } else {
      return `${paramB}B`;
    }
  };

  // Format cost to display with consistent decimal places
  const formatCost = (cost: number | undefined): string => {
    if (cost === undefined) return 'N/A';
    return `$${cost.toFixed(5)}`;
  };

  // Format token window (e.g., 128000 -> "128K")
  const formatTokens = (tokens: number | undefined): string => {
    if (tokens === undefined) return 'N/A';
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    } else {
      return tokens.toString();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{model.displayName}</h3>
          <p className="text-sm text-gray-600">{getVendorName(model.vendorId)}</p>
        </div>
        <div className="flex space-x-2">
          {model.isOpenSource && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Open Source
            </span>
          )}
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {getCategoryName(model.categoryId)}
          </span>
        </div>
      </div>
      
      {model.description && (
        <div className="mb-4 text-sm text-gray-700">
          <p>{model.description}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500 mb-1">Parameters</div>
          <div className="font-medium">{formatParameters(model.parametersB)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500 mb-1">Precision</div>
          <div className="font-medium">{model.precision || 'N/A'}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500 mb-1">Context Window</div>
          <div className="font-medium">{formatTokens(model.contextWindow)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500 mb-1">Release Date</div>
          <div className="font-medium">{model.releaseDate || 'N/A'}</div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Pricing</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Input Cost</div>
            <div className="font-medium">{model.pricing ? formatCost(model.pricing.inputText) : 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Output Cost</div>
            <div className="font-medium">{model.pricing ? formatCost(model.pricing.outputText) : 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Fine-tuning Input</div>
            <div className="font-medium">{model.pricing ? formatCost(model.pricing.finetuningInput) : 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Fine-tuning Output</div>
            <div className="font-medium">{model.pricing ? formatCost(model.pricing.finetuningOutput) : 'N/A'}</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          System name: <code className="bg-gray-100 px-1 py-0.5 rounded">{model.systemName}</code>
        </div>
        <a 
          href={getVendorPricingUrl(model.vendorId)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Official Pricing →
        </a>
      </div>
    </div>
  );
};

export default ModelDetailCard;