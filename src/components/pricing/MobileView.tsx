'use client';

import React from 'react';
import { AIModel, Category, Vendor } from '@/lib/types';
import { prepareExportData, exportAsCSV, exportAsJSON } from '@/lib/exportUtils';
import MobileCard from './MobileCard';

interface MobileViewProps {
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
  sortConfig: {
    key: string;
    direction: string;
  };
  onSort: (key: string) => void;
}

const MobileView: React.FC<MobileViewProps> = ({
  models,
  categories,
  vendors,
  sortConfig,
  onSort,
}) => {
  // Sort dropdown options
  const sortOptions = [
    { key: 'displayName', label: 'Model Name' },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'inputPrice', label: 'Input Price' },
    { key: 'outputPrice', label: 'Output Price' },
    { key: 'parametersB', label: 'Parameters' },
  ];
  
  const handleDownloadCSV = () => {
    const data = prepareExportData(models, categories, vendors);
    exportAsCSV(data);
  };

  const handleDownloadJSON = () => {
    const data = prepareExportData(models, categories, vendors);
    exportAsJSON(data);
  };
  
  return (
    <div className="block md:hidden mt-6">
      {/* Sort and download controls for mobile */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <button 
            onClick={handleDownloadCSV}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Download CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV
          </button>
          <button 
            onClick={handleDownloadJSON}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Download JSON"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            JSON
          </button>
        </div>
        
        <div className="inline-block relative w-48">
          <select
            className="block appearance-none w-full border border-gray-200 hover:border-gray-300 px-4 py-2 pr-8 rounded shadow-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(e) => {
              const [key] = e.target.value.split('-');
              onSort(key);
            }}
          >
            {sortOptions.map(option => (
              <React.Fragment key={option.key}>
                <option value={`${option.key}-asc`}>
                  {option.label} (A-Z)
                </option>
                <option value={`${option.key}-desc`}>
                  {option.label} (Z-A)
                </option>
              </React.Fragment>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Cards list */}
      <div className="space-y-4 pb-16">
        {models.map((model) => (
          <MobileCard
            key={model.id}
            model={model}
            categories={categories}
            vendors={vendors}
          />
        ))}
        {models.length === 0 && (
          <div className="text-center py-8 rounded-lg border border-gray-200 shadow-sm p-4">
            <p className="text-gray-500">No models match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileView;