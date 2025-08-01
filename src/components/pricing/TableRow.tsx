"use client";

import React, { useState } from "react";
import { AIModel, Category, Vendor } from "@/lib/types";
import { formatCost, calculateTotalCost, formatPrice } from "./formatters";
import {
  getVendorName,
  getVendorPricingUrl,
  getOpenRouterModelUrl,
} from "./helpers";
import ModalityBadge from "./ModalityBadge";
import CapabilityTierBadge from "./CapabilityTierBadge";

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
  isEven = false,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [freeModelTooltipVisible, setFreeModelTooltipVisible] = useState(false);

  // Detect if this is a free model
  const isFreeModel = model.systemName?.includes(':free') || 
    (model.pricing?.inputText === 0 && model.pricing?.outputText === 0);

  // Simplified with optional chaining
  const costDetails = (inputText && outputText && model.pricing) ?
    calculateTotalCost(
      inputText,
      outputText,
      model.pricing?.inputText,
      model.pricing?.outputText
    )
    : { total: undefined, inputCost: undefined, outputCost: undefined };

  const handleMouseEnter = () => {
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  const handleFreeModelMouseEnter = () => {
    setFreeModelTooltipVisible(true);
  };

  const handleFreeModelMouseLeave = () => {
    setFreeModelTooltipVisible(false);
  };

  const getCostTextColor = (cost: number | undefined) => {
    if (cost === undefined) return "text-gray-500";
    return cost < 0.01
      ? "text-green-600"
      : cost < 0.05
      ? "text-blue-600"
      : "text-gray-900";
  };

  return (
    <tr className={`hover:bg-gray-50 ${isEven ? "bg-gray-50/30" : "bg-white"}`}>
      <td className="px-4 py-3 max-w-xs w-1/3">
        <div className="font-medium text-xs text-gray-900 overflow-hidden text-ellipsis">
          <a
            href={getOpenRouterModelUrl(model.systemName)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline block truncate cursor-pointer"
            title={model.displayName}
          >
            {model.displayName}
            {isFreeModel && (
              <span
                className="ml-1 text-blue-600 cursor-help relative"
                onMouseEnter={handleFreeModelMouseEnter}
                onMouseLeave={handleFreeModelMouseLeave}
              >
                *
                {freeModelTooltipVisible && (
                  <div className="absolute z-10 left-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-xs w-64">
                    <div className="text-left font-medium mb-2 text-gray-900">Free Model Restrictions:</div>
                    <div className="text-gray-700 space-y-1">
                      <div>• 20 requests per minute</div>
                      <div>• 50 requests/day (without credits)</div>
                      <div>• 1,000 requests/day (with 10+ credits)</div>
                      <div className="pt-1 text-gray-500 text-xs">Via OpenRouter.ai</div>
                    </div>
                  </div>
                )}
              </span>
            )}
          </a>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {model.capabilityTier && (
              <CapabilityTierBadge tier={model.capabilityTier} size="sm" />
            )}
            {model.modality && (
              <ModalityBadge modality={model.modality} size="sm" />
            )}
            {model.isOpenSource && (
              <span className="text-xs inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                Open Source
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 w-1/6 text-xs text-gray-500">
        <a
          href={getVendorPricingUrl(model.vendorId, vendors)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline cursor-pointer"
        >
          {getVendorName(model.vendorId, vendors)}
        </a>
      </td>
      <td className="px-4 py-3 w-[12.5%] text-center text-xs text-gray-500">
        {model.contextWindow 
          ? model.contextWindow.toLocaleString() 
          : "N/A"}
      </td>
      {/* Params column hidden */}
      <td className="px-4 py-3 w-[12.5%] text-center text-xs text-gray-500">
        {model.pricing
          ? formatPrice(model.pricing.inputText, model.displayName)
          : "N/A"}
      </td>
      <td className="px-4 py-3 w-[12.5%] text-center text-xs text-gray-500">
        {model.pricing
          ? formatPrice(model.pricing.outputText, model.displayName)
          : "N/A"}
      </td>
      {inputText && outputText && (
        <td
          className="px-4 py-3 w-1/6 text-center text-xs relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span
            className={`font-medium cursor-help ${getCostTextColor(
              costDetails.total
            )}`}
          >
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
