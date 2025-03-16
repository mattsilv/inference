'use client';

import React from 'react';
import { Category, Vendor } from '@/lib/types';

interface FilterBarProps {
  categories: Category[]; // Keeping for interface compatibility
  vendors: Vendor[];
  selectedCategories: string[]; // Keeping for interface compatibility
  selectedVendors: string[];
  onCategoryChange: (categories: string[]) => void;
  onVendorChange: (vendors: string[]) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  // categories and selectedCategories not used in this component
  // but kept in the interface for compatibility
  vendors,
  selectedVendors,
  onCategoryChange,
  onVendorChange,
}) => {
  
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
        {selectedVendors.length > 0 && (
          <button 
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;