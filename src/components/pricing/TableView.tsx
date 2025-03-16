'use client';

import React from 'react';
import { AIModel, Category, Vendor } from '@/lib/types';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import { formatParameters, formatCost } from './formatters';
import { getVendorName, getVendorPricingUrl, getVendorModelsListUrl } from './helpers';

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
  // Sort dropdown options
  const sortOptions = [
    { key: 'displayName', label: 'Model Name' },
    { key: 'vendorName', label: 'Provider' },
    { key: 'parametersB', label: 'Parameters' },
    { key: 'inputPrice', label: 'Input Price' },
    { key: 'outputPrice', label: 'Output Price' },
  ];

  // For mobile screens, show card-style list
  const renderMobileCards = () => (
    <div className="block md:hidden mt-4">
      {/* Mobile sort control */}
      <div className="mb-4 flex justify-end">
        <div className="inline-block relative w-full max-w-[180px]">
          <select
            className="block appearance-none w-full border border-gray-200 hover:border-gray-300 px-3 py-2 pr-8 rounded shadow-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(e) => {
              const [key] = e.target.value.split('-');
              onSort(key);
            }}
          >
            {sortOptions.map(option => (
              <React.Fragment key={option.key}>
                <option value={`${option.key}-asc`}>
                  {option.label} (Low → High)
                </option>
                <option value={`${option.key}-desc`}>
                  {option.label} (High → Low)
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

      <div className="space-y-4">
        {models.map((model) => (
          <div key={model.id} className="bg-white rounded-lg border border-gray-200 shadow p-4">
            <h3 className="text-lg font-medium">
              <a 
                href={getVendorModelsListUrl(model.vendorId, vendors)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {model.displayName}
              </a>
              {model.isOpenSource && (
                <span className="ml-2 text-xs inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                  Open Source
                </span>
              )}
            </h3>
            
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Parameters:</span>
                <span className="font-medium">{formatParameters(model.parametersB)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Input (1M):</span>
                <span className="font-medium">{model.pricing ? formatCost(model.pricing.inputText) : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Output (1M):</span>
                <span className="font-medium">{model.pricing ? formatCost(model.pricing.outputText) : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Provider:</span>
                <a 
                  href={getVendorPricingUrl(model.vendorId, vendors)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline font-medium"
                >
                  {getVendorName(model.vendorId, vendors)}
                </a>
              </div>
            </div>
          </div>
        ))}
        {models.length === 0 && (
          <div className="text-center py-8 rounded-lg border border-gray-200 shadow-sm p-4">
            <p className="text-gray-500">No models match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );

  // For desktop screens, show the table
  const renderDesktopTable = () => (
    <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg shadow">
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

  return (
    <>
      {renderDesktopTable()}
      {renderMobileCards()}
      <div className="text-sm text-gray-600 mt-2 mb-8 px-1">
        Pricing shown per 1M tokens. Last updated: {new Date().toLocaleDateString()}
      </div>
    </>
  );
};

export default TableView;