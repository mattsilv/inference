'use client';

import React from 'react';
import { AIModel, Category, Vendor } from '@/lib/types';
import { formatParameters, formatCost } from './formatters';
import { getVendorName, getVendorPricingUrl, getVendorModelsListUrl } from './helpers';

interface TableRowProps {
  model: AIModel;
  categories: Category[]; // Keeping for interface compatibility
  vendors: Vendor[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TableRow: React.FC<TableRowProps> = ({ model, categories, vendors }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">
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
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <a 
          href={getVendorPricingUrl(model.vendorId, vendors)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {getVendorName(model.vendorId, vendors)}
        </a>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
        {formatParameters(model.parametersB)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
        {model.pricing
          ? formatCost(model.pricing.inputText)
          : "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
        {model.pricing
          ? formatCost(model.pricing.outputText)
          : "N/A"}
      </td>
    </tr>
  );
};

export default TableRow;