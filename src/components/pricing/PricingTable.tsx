'use client';

import React, { useState } from 'react';
import { AIModel, Category, Vendor } from '@/lib/types';
import TableView from './TableView';
import FilterBar from './FilterBar';
import { filterModels, sortModels } from './helpers';
import { prepareExportData, exportAsCSV, exportAsJSON } from '@/lib/exportUtils';

interface PricingTableProps {
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
}

const PricingTable: React.FC<PricingTableProps> = ({
  models,
  categories,
  vendors,
}) => {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string }>({
    key: 'inputPrice',
    direction: 'asc',
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter models by vendors only (category filtering happens via separate tables)
  const getFilteredModels = (categoryName: string | null) => {
    let result = models;
    
    // Filter by vendor
    if (selectedVendors.length > 0) {
      result = filterModels(result, [], selectedVendors);
    }
    
    // Filter by category if specified
    if (categoryName) {
      result = result.filter(model => 
        model.category && model.category.name === categoryName
      );
    }
    
    // Apply sorting (default to input price asc for each category)
    return sortModels(result, sortConfig.key, sortConfig.direction);
  };
  
  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => {
      const direction = prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  };

  // Handle vendor filter changes
  const handleVendorFilter = (vendors: string[]) => {
    setSelectedVendors(vendors);
  };

  // Handle category navigation
  const scrollToCategory = (categoryName: string) => {
    const element = document.getElementById(`category-${categoryName.replace(/\s+/g, '-').toLowerCase()}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveCategory(categoryName);
    }
  };

  // Handle downloads - wrapped in useCallback to avoid dependency issues
  const handleDownloadCSV = React.useCallback(() => {
    const data = prepareExportData(models, categories, vendors);
    exportAsCSV(data);
  }, [models, categories, vendors]);

  const handleDownloadJSON = React.useCallback(() => {
    const data = prepareExportData(models, categories, vendors);
    exportAsJSON(data);
  }, [models, categories, vendors]);
  
  // Expose download functions to window for use in page.tsx
  // We no longer need to expose functions to window

  return (
    <div className="container mx-auto px-4 py-8" id="top">
      <div className="flex justify-center mb-6">
        <div className="flex items-center py-2 px-4 border-2 border-gray-800 rounded-lg shadow-sm bg-white">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
            <path d="M12 3L4 9V21H20V9L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">Inference Pricing</h1>
        </div>
      </div>
      
      {/* Category Navigation */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="flex items-center flex-wrap">
          <h2 className="text-lg font-medium mr-4">Jump to Category:</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.name)}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeCategory === category.name
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      
      <FilterBar
        categories={[]}  // No category filters needed since we split by category
        vendors={vendors}
        selectedCategories={[]}
        selectedVendors={selectedVendors}
        onCategoryChange={() => {}}
        onVendorChange={handleVendorFilter}
      />
      
      {/* Render a table for each category */}
      {categories.map((category) => {
        const categoryModels = getFilteredModels(category.name);
        
        if (categoryModels.length === 0) return null;
        
        return (
          <div 
            key={category.id} 
            id={`category-${category.name.replace(/\s+/g, '-').toLowerCase()}`}
            className="mb-12"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <button 
                onClick={() => {
                  const topElement = document.getElementById('top');
                  if (topElement) {
                    topElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                aria-label="Back to top"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>Top</span>
              </button>
            </div>
            <TableView 
              models={categoryModels}
              categories={categories}
              vendors={vendors}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </div>
        );
      })}
      
      {/* Download buttons at the bottom of all tables */}
      <div className="flex flex-wrap items-center mt-8 mb-4 gap-3 border-t border-gray-200 pt-6">
        <div className="flex">
          <button 
            onClick={handleDownloadCSV}
            className="inline-flex items-center px-3 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Download CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV
          </button>
          <button 
            onClick={handleDownloadJSON}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Download JSON"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            JSON
          </button>
        </div>
        <p className="text-sm text-gray-600 m-0">Download all available models and pricing data instantly.</p>
      </div>
    </div>
  );
};

export default PricingTable;