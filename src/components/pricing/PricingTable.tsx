'use client';

import React, { useState, useEffect } from 'react';
import { AIModel, Category, Vendor } from '@/lib/types';
import TableView from './TableView';
import MobileView from './MobileView';
import FilterBar from './FilterBar';
import { filterModels, sortModels } from './helpers';

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
  const [filteredModels, setFilteredModels] = useState<AIModel[]>(models);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string }>({
    key: 'displayName',
    direction: 'asc',
  });
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Update filtered models when filters or sort change
  useEffect(() => {
    let result = models;
    
    // Apply filters
    result = filterModels(result, selectedCategories, selectedVendors);
    
    // Apply sorting
    result = sortModels(result, sortConfig.key, sortConfig.direction);
    
    setFilteredModels(result);
  }, [models, selectedCategories, selectedVendors, sortConfig]);

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => {
      const direction = prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  };

  // Handle filter changes
  const handleCategoryFilter = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  const handleVendorFilter = (vendors: string[]) => {
    setSelectedVendors(vendors);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Model Pricing Comparison</h1>
      
      <FilterBar
        categories={categories}
        vendors={vendors}
        selectedCategories={selectedCategories}
        selectedVendors={selectedVendors}
        onCategoryChange={handleCategoryFilter}
        onVendorChange={handleVendorFilter}
      />
      
      {isMobile ? (
        <MobileView 
          models={filteredModels}
          categories={categories}
          vendors={vendors}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      ) : (
        <TableView 
          models={filteredModels}
          categories={categories}
          vendors={vendors}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>
          Pricing shown per 1M tokens. Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default PricingTable;