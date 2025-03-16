'use client';

import React, { useState } from 'react';
import { Category, Vendor } from '@/lib/types';

interface FilterBarProps {
  categories: Category[];
  vendors: Vendor[];
  selectedCategories: string[];
  selectedVendors: string[];
  onCategoryChange: (categories: string[]) => void;
  onVendorChange: (vendors: string[]) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  vendors,
  selectedCategories,
  selectedVendors,
  onCategoryChange,
  onVendorChange,
}) => {
  const [showCategoryFilters, setShowCategoryFilters] = useState(true);
  const [showVendorFilters, setShowVendorFilters] = useState(true);
  
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
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Filters</h3>
        {(selectedCategories.length > 0 || selectedVendors.length > 0) && (
          <button 
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Category section */}
      <div className="mb-4">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => setShowCategoryFilters(!showCategoryFilters)}
        >
          <h4 className="font-medium">Categories</h4>
          <span>{showCategoryFilters ? '−' : '+'}</span>
        </div>
        
        {showCategoryFilters && (
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.name)}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedCategories.includes(category.name)
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Vendor section */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => setShowVendorFilters(!showVendorFilters)}
        >
          <h4 className="font-medium">Vendors</h4>
          <span>{showVendorFilters ? '−' : '+'}</span>
        </div>
        
        {showVendorFilters && (
          <div className="mt-2 flex flex-wrap gap-2">
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
        )}
      </div>
    </div>
  );
};

export default FilterBar;