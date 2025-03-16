'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { AIModel, Category, Vendor } from '@/lib/types';
import ModelDetailCard from './ModelDetailCard';

interface ModelDetailsSectionProps {
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
  activeCategory: number | null;
  searchQuery: string;
}

const ModelDetailsSection: React.FC<ModelDetailsSectionProps> = ({
  models,
  categories,
  vendors,
  activeCategory,
  searchQuery
}) => {
  const [expandedModels, setExpandedModels] = useState<number[]>([]);
  
  // Toggle model expansion
  const toggleModelExpanded = (modelId: number) => {
    setExpandedModels(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };
  
  // Filter models based on active category and search query
  const filteredModels = useMemo(() => {
    let result = [...models];
    
    // Apply category filter
    if (activeCategory !== null) {
      result = result.filter(model => model.categoryId === activeCategory);
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(model => {
        const vendorName = vendors.find(v => v.id === model.vendorId)?.name || '';
        return model.displayName.toLowerCase().includes(query) || 
               vendorName.toLowerCase().includes(query);
      });
    }
    
    return result;
  }, [models, activeCategory, searchQuery, vendors]);
  
  // Get category name by ID
  const getCategoryName = useCallback((categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }, [categories]);

  // Group models by category for display
  const modelsByCategory = useMemo(() => {
    const grouped: { [key: string]: AIModel[] } = {};
    
    filteredModels.forEach(model => {
      const categoryName = getCategoryName(model.categoryId);
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(model);
    });
    
    return grouped;
  }, [filteredModels, getCategoryName]);
  
  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Model Details
      </h2>
      
      {Object.entries(modelsByCategory).map(([categoryName, categoryModels]) => (
        <div key={categoryName} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {categoryName}
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {categoryModels.map(model => (
              <div key={model.id}>
                <div 
                  onClick={() => toggleModelExpanded(model.id)}
                  className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">
                      {model.displayName}
                      {model.isOpenSource && (
                        <span className="ml-2 text-xs inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                          Open Source
                        </span>
                      )}
                    </span>
                    <span className="ml-3 text-sm text-gray-500">
                      {vendors.find(v => v.id === model.vendorId)?.name}
                    </span>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedModels.includes(model.id) ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {expandedModels.includes(model.id) && (
                  <ModelDetailCard 
                    model={model} 
                    categories={categories} 
                    vendors={vendors}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {filteredModels.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No models match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default ModelDetailsSection;