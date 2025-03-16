'use client';

import React from 'react';
import { AIModel, Category, Vendor } from '@/lib/types';
import { formatParameters, formatCost } from './formatters';
import { getCategoryName, getVendorName } from './helpers';

interface TableRowProps {
  model: AIModel;
  categories: Category[];
  vendors: Vendor[];
}

const TableRow: React.FC<TableRowProps> = ({ model, categories, vendors }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">
          {model.displayName}
          {model.isOpenSource && (
            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Open Source
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {getCategoryName(model.categoryId, categories)}
        </span>
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {getVendorName(model.vendorId, vendors)}
      </td>
    </tr>
  );
};

export default TableRow;