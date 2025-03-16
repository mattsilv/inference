'use client';

import React from 'react';
import { AIModel, Category, Vendor } from '@/lib/types';
import { prepareExportData, exportAsCSV, exportAsJSON } from '@/lib/exportUtils';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

interface TableViewProps {
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
  sortConfig: {
    key: string;
    direction: string;
  };
  onSort: (key: string) => void;
}

const TableView: React.FC<TableViewProps> = ({
  models,
  categories,
  vendors,
  sortConfig,
  onSort,
}) => {
  const handleDownloadCSV = () => {
    const data = prepareExportData(models, categories, vendors);
    exportAsCSV(data);
  };

  const handleDownloadJSON = () => {
    const data = prepareExportData(models, categories, vendors);
    exportAsJSON(data);
  };

  return (
    <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg shadow">
      <div className="flex justify-end p-2 bg-gray-50 border-b border-gray-200">
        <button 
          onClick={handleDownloadCSV}
          className="inline-flex items-center px-3 py-1 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          title="Download CSV"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          CSV
        </button>
        <button 
          onClick={handleDownloadJSON}
          className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          title="Download JSON"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          JSON
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader 
            sortConfig={sortConfig} 
            onSort={onSort} 
          />
          <tbody className="divide-y divide-gray-200">
            {models.map((model) => (
              <TableRow
                key={model.id}
                model={model}
                categories={categories}
                vendors={vendors}
              />
            ))}
            {models.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <p className="text-gray-500">No models match your current filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableView;