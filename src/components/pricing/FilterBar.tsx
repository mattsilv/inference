'use client';

import React from 'react';
import { Category, Vendor } from '@/lib/types';

interface FilterBarProps {
  categories: Category[]; // Keeping for interface compatibility
  vendors: Vendor[];
  selectedCategories: string[]; // Keeping for interface compatibility
  selectedVendors: string[];
  selectedContextRange: string;
  onCategoryChange: (categories: string[]) => void;
  onVendorChange: (vendors: string[]) => void;
  onContextRangeChange: (range: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  vendors,
  selectedCategories,
  selectedVendors,
  selectedContextRange,
  onCategoryChange,
  onVendorChange,
  onContextRangeChange,
}) => {
  
  // Toggle a category selection
  const toggleCategory = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      // Remove the category
      onCategoryChange(selectedCategories.filter(c => c !== categoryName));
    } else {
      // Add the category
      onCategoryChange([...selectedCategories, categoryName]);
    }
  };
  
  // Toggle a vendor selection
  const toggleVendor = (vendorName: string) => {
    if (selectedVendors.includes(vendorName)) {
      // Remove the vendor
      onVendorChange(selectedVendors.filter(v => v !== vendorName));
    } else {
      // Add the vendor
      onVendorChange([...selectedVendors, vendorName]);
    }
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    onCategoryChange([]);
    onVendorChange([]);
    onContextRangeChange('all');
  };

  // Context window range options
  const contextRanges = [
    { label: 'All', value: 'all' },
    { label: '< 32K', value: 'small' },
    { label: '32K - 128K', value: 'medium' },
    { label: '128K - 1M', value: 'large' },
    { label: '1M+', value: 'xlarge' },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="space-y-4">
        {/* Category Filters */}
        <div className="flex items-center">
          <h3 className="text-lg font-medium mr-4">Category Filters</h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onCategoryChange([])}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedCategories.length === 0
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.name)}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedCategories.includes(category.name)
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Vendor Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-lg font-medium mr-4">Vendor Filters</h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onVendorChange([])}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedVendors.length === 0
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {vendors.map(vendor => (
                <button
                  key={vendor.id}
                  onClick={() => toggleVendor(vendor.name)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedVendors.includes(vendor.name)
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {vendor.name}
                </button>
              ))}
            </div>
          </div>
          {(selectedCategories.length > 0 || selectedVendors.length > 0 || selectedContextRange !== 'all') && (
            <button 
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Context Window Range Filter */}
        <div className="flex items-center">
          <h3 className="text-lg font-medium mr-4">Context Window</h3>
          <div className="flex flex-wrap items-center gap-2">
            {contextRanges.map(range => (
              <button
                key={range.value}
                onClick={() => onContextRangeChange(range.value)}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedContextRange === range.value
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;