"use client";

import React from "react";
import { AIModel, Category, Vendor } from "@/lib/types";
import {
  formatParameters,
  formatCost,
  calculateInputCost,
  calculateOutputCost,
} from "./formatters";
import {
  getCategoryName,
  getVendorName,
  getVendorPricingUrl,
  getVendorModelsListUrl,
} from "./helpers";

interface MobileCardProps {
  model: AIModel;
  categories: Category[];
  vendors: Vendor[];
  inputText: string;
  outputText: string;
}

const MobileCard: React.FC<MobileCardProps> = ({
  model,
  categories,
  vendors,
  inputText = "",
  outputText = "",
}) => {
  return (
    <div className="rounded-lg border border-gray-200 shadow p-4 mb-4">
      <h3 className="text-base font-medium">
        <a
          href={getVendorModelsListUrl(model.vendorId, vendors)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {model.displayName}
        </a>
      </h3>
      <div className="flex items-center gap-2 mt-1 mb-3">
        <span className="text-sm text-gray-600">
          <a
            href={getVendorPricingUrl(model.vendorId, vendors)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {getVendorName(model.vendorId, vendors)}
          </a>
        </span>
        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
          {getCategoryName(model.categoryId, categories)}
        </span>
        {model.isOpenSource && (
          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
            Open Source
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Parameters:</span>
          <span>{formatParameters(model.parametersB)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Input ($/1M):</span>
          <span>
            {model.pricing ? formatCost(model.pricing.inputText) : "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Output ($/1M):</span>
          <span>
            {model.pricing ? formatCost(model.pricing.outputText) : "N/A"}
          </span>
        </div>
        {inputText && outputText && model.pricing && (
          <div className="flex justify-between">
            <span className="text-gray-500">Example Cost:</span>
            {(() => {
              const inputCost = calculateInputCost(
                inputText,
                model.pricing.inputText
              );
              const outputCost = calculateOutputCost(
                outputText,
                model.pricing.outputText
              );
              // Simplified with nullish coalescing
              const totalCost = (inputCost !== undefined && outputCost !== undefined) ? 
                  (inputCost + outputCost) : undefined;

              const colorClass =
                totalCost !== undefined
                  ? totalCost < 0.01
                    ? "text-green-600"
                    : totalCost < 0.05
                    ? "text-blue-600"
                    : "text-gray-900"
                  : "text-gray-500";

              return (
                <div className="text-right">
                  <span className={`font-medium ${colorClass}`}>
                    {formatCost(totalCost)}
                  </span>
                  {totalCost !== undefined && (
                    <div className="text-xs text-gray-500">
                      In: {formatCost(inputCost)} | Out:{" "}
                      {formatCost(outputCost)}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCard;
