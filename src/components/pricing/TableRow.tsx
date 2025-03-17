'use client';

import React, { useState } from 'react';
import { AIModel, Category, Vendor } from '@/lib/types';
import { formatCost, calculateTotalCost } from './formatters';
import { getVendorName, getVendorPricingUrl, getVendorModelsListUrl } from './helpers';

interface TableRowProps {
  model: AIModel;
  categories: Category[]; // Keeping for interface compatibility
  vendors: Vendor[];
  inputText?: string;
  outputText?: string;
  isEven?: boolean;
}

const TableRow: React.FC<TableRowProps> = ({ 
  model, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  categories, 
  vendors, 
  inputText = "", 
  outputText = "",
  isEven = false
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  // Calculate costs if we have text samples and pricing information
  const costDetails = (inputText && outputText && model.pricing) 
    ? calculateTotalCost(
        inputText, 
        outputText, 
        model.pricing.inputText, 
        model.pricing.outputText
      ) 
    : { total: undefined, inputCost: undefined, outputCost: undefined };

  const handleMouseEnter = () => {
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  const getCostTextColor = (cost: number | undefined) => {
    if (cost === undefined) return 'text-gray-500';
    return cost < 0.01 
      ? 'text-green-600' 
      : cost < 0.05 
        ? 'text-blue-600' 
        : 'text-gray-900';
  };

  return (
    <tr className={`hover:bg-gray-50 ${isEven ? 'bg-gray-50/30' : 'bg-white'}`}>
      <td className="px-6 py-4 max-w-xs w-1/3">
        <div className="font-medium text-gray-900 overflow-hidden text-ellipsis">
          <a 
            href={getVendorModelsListUrl(model.vendorId, vendors)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline block truncate"
            title={model.displayName}
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
      <td className="px-6 py-4 w-1/6 text-sm text-gray-500">
        <a 
          href={getVendorPricingUrl(model.vendorId, vendors)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {getVendorName(model.vendorId, vendors)}
        </a>
      </td>
      {/* Params column hidden */}
      <td className="px-6 py-4 w-[12.5%] text-center text-sm text-gray-500">
        {model.pricing
          ? formatCost(model.pricing.inputText)
          : "N/A"}
      </td>
      <td className="px-6 py-4 w-[12.5%] text-center text-sm text-gray-500">
        {model.pricing
          ? formatCost(model.pricing.outputText)
          : "N/A"}
      </td>
      {inputText && outputText && (
        <td 
          className="px-6 py-4 w-1/6 text-center text-sm relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span className={`font-medium cursor-help ${getCostTextColor(costDetails.total)}`}>
            {formatCost(costDetails.total)}
          </span>
          
          {/* Cost breakdown tooltip */}
          {tooltipVisible && costDetails.total !== undefined && (
            <div className="absolute z-10 right-16 -top-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-xs w-48">
              <div className="text-left font-medium mb-1">Cost Breakdown:</div>
              <div className="flex justify-between mb-1">
                <span>Input:</span>
                <span className={getCostTextColor(costDetails.inputCost)}>
                  {formatCost(costDetails.inputCost)}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Output:</span>
                <span className={getCostTextColor(costDetails.outputCost)}>
                  {formatCost(costDetails.outputCost)}
                </span>
              </div>
              <div className="border-t pt-1 mt-1 flex justify-between font-medium">
                <span>Total:</span>
                <span className={getCostTextColor(costDetails.total)}>
                  {formatCost(costDetails.total)}
                </span>
              </div>
            </div>
          )}
        </td>
      )}
    </tr>
  );
};

export default TableRow;