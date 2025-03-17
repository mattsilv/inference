"use client";

import React, { useState } from "react";
import { AIModel, Category, Vendor } from "@/lib/types";
import {
  prepareExportData,
  exportAsCSV,
  exportAsJSON,
} from "@/lib/exportUtils";
import MobileCard from "./MobileCard";
import {
  formatParameters,
  formatCost,
  calculateInputCost,
  calculateOutputCost,
} from "./formatters";
import { getCategoryName, getVendorName } from "./helpers";

interface MobileViewProps {
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
  inputText?: string;
  outputText?: string;
}

const MobileView: React.FC<MobileViewProps> = ({
  models,
  categories,
  vendors,
  inputText = "",
  outputText = "",
}) => {
  // State for the adaptive table view
  const [viewMode, setViewMode] = useState<"cards" | "compare" | "detail">(
    "cards"
  );
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [focusedModel, setFocusedModel] = useState<number | null>(null);

  // Currently not using sort options, but keeping the structure for future enhancements

  const handleDownloadCSV = () => {
    const data = prepareExportData(models, categories, vendors);
    exportAsCSV(data);
  };

  const handleDownloadJSON = () => {
    const data = prepareExportData(models, categories, vendors);
    exportAsJSON(data);
  };

  const toggleModelSelection = (modelId: number) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter((id) => id !== modelId));
    } else {
      if (selectedModels.length < 4) {
        // Limit to 4 models for comparison
        setSelectedModels([...selectedModels, modelId]);
      }
    }
  };

  const handleViewDetail = (modelId: number) => {
    setFocusedModel(modelId);
    setViewMode("detail");
  };

  const getAttributeValue = (model: AIModel, attribute: string) => {
    switch (attribute) {
      case "inputPrice":
        return model.pricing ? formatCost(model.pricing.inputText) : "N/A";
      case "outputPrice":
        return model.pricing ? formatCost(model.pricing.outputText) : "N/A";
      case "parametersB":
        return formatParameters(model.parametersB);
      case "contextWindow":
        return model.contextWindow
          ? `${model.contextWindow.toLocaleString()} tokens`
          : "N/A";
      case "category":
        return getCategoryName(model.categoryId, categories);
      case "vendor":
        return getVendorName(model.vendorId, vendors);
      default:
        return "N/A";
    }
  };

  // Function to navigate to next/prev model in detail view
  const navigateModel = (direction: "next" | "prev") => {
    if (!focusedModel) return;

    const currentIndex = models.findIndex((m) => m.id === focusedModel);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % models.length;
    } else {
      newIndex = (currentIndex - 1 + models.length) % models.length;
    }

    setFocusedModel(models[newIndex].id);
  };

  // Calculate sample cost for a model
  const calculateSampleCost = (model: AIModel) => {
    if (!model.pricing || !inputText || !outputText) return "N/A";

    const inputCost = calculateInputCost(inputText, model.pricing.inputText);
    const outputCost = calculateOutputCost(
      outputText,
      model.pricing.outputText
    );

    if (inputCost === undefined || outputCost === undefined) return "N/A";

    const totalCost = inputCost + outputCost;
    const colorClass =
      totalCost < 0.01
        ? "text-green-600"
        : totalCost < 0.05
        ? "text-blue-600"
        : "text-gray-900";

    return (
      <div>
        <span className={`font-medium ${colorClass}`}>
          {formatCost(totalCost)}
        </span>
        <div className="text-xs text-gray-500">
          In: {formatCost(inputCost)} | Out: {formatCost(outputCost)}
        </div>
      </div>
    );
  };

  // View titles and navigation are handled directly in the render method

  return (
    <div className="block md:hidden mt-6">
      {/* Header with title and back button */}
      <div className="flex justify-between items-center mb-4">
        {viewMode === "cards" && (
          <h3 className="text-lg font-medium">Models</h3>
        )}
        {viewMode === "compare" && (
          <>
            <h3 className="text-lg font-medium">Model Comparison</h3>
            <button
              onClick={() => setViewMode("cards")}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
            >
              Back to Models
            </button>
          </>
        )}
        {viewMode === "detail" && (
          <>
            <h3 className="text-lg font-medium">Model Details</h3>
            <button
              onClick={() => setViewMode("cards")}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
            >
              Back to Models
            </button>
          </>
        )}
      </div>

      {/* Download buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          title="Download CSV"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          CSV
        </button>
        <button
          onClick={handleDownloadJSON}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          title="Download JSON"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          JSON
        </button>
      </div>

      {/* Cards View */}
      {viewMode === "cards" && (
        <div className="space-y-4 pb-16">
          {models.map((model) => (
            <div key={model.id} className="relative">
              <div
                className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer z-10 ${
                  selectedModels.includes(model.id)
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white border-gray-300"
                }`}
                onClick={() => toggleModelSelection(model.id)}
              >
                {selectedModels.includes(model.id) && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              <div
                onClick={() => handleViewDetail(model.id)}
                className="cursor-pointer"
              >
                <MobileCard
                  model={model}
                  categories={categories}
                  vendors={vendors}
                  inputText={inputText || ""}
                  outputText={outputText || ""}
                />
              </div>
            </div>
          ))}
          {models.length === 0 && (
            <div className="text-center py-8 rounded-lg border border-gray-200 shadow-sm p-4">
              <p className="text-gray-500">
                No models match your current filters.
              </p>
            </div>
          )}

          {selectedModels.length > 0 && (
            <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg z-20 flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">
                  {selectedModels.length}{" "}
                  {selectedModels.length === 1 ? "model" : "models"} selected
                </span>
              </div>
              <button
                onClick={() => setViewMode("compare")}
                className="px-4 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-md flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                View Comparison
              </button>
            </div>
          )}
        </div>
      )}

      {/* Compare View */}
      {viewMode === "compare" && (
        <div className="pb-16">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Model Comparison</h3>
            <button
              onClick={() => setViewMode("cards")}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
            >
              Back to Cards
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Comparing {selectedModels.length} selected models side by side:
          </p>

          <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
            <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700">
                Model Comparison
              </h3>
            </div>

            {models
              .filter((model) => selectedModels.includes(model.id))
              .map((model) => (
                <div
                  key={model.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <div className="p-4">
                    <h4 className="font-medium text-sm mb-2">
                      {model.displayName}
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">
                      {getVendorName(model.vendorId, vendors)}
                    </p>

                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <div className="text-gray-600">Input Price:</div>
                      <div className="text-right font-medium">
                        {getAttributeValue(model, "inputPrice")}
                      </div>

                      <div className="text-gray-600">Output Price:</div>
                      <div className="text-right font-medium">
                        {getAttributeValue(model, "outputPrice")}
                      </div>

                      {inputText && outputText && model.pricing && (
                        <>
                          <div className="text-gray-600">Example Cost:</div>
                          <div className="text-right font-medium">
                            {calculateSampleCost(model)}
                          </div>
                        </>
                      )}

                      {/* 
                        TODO: Add these fields once they're consistently available in the data model
                        and shown on both desktop and mobile views:
                        
                        <div className="text-gray-600">Parameters:</div>
                        <div className="text-right font-medium">
                          {formatParameters(model.parametersB)}
                        </div>

                        <div className="text-gray-600">Context Window:</div>
                        <div className="text-right font-medium">
                          {model.contextWindow
                            ? `${model.contextWindow.toLocaleString()} tokens`
                            : "N/A"}
                        </div>
                      */}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => setViewMode("cards")}
              className="flex-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Back to Cards
            </button>
            <button
              onClick={() => setSelectedModels([])}
              className="px-3 py-2 text-sm text-red-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Detail View */}
      {viewMode === "detail" && focusedModel && (
        <div className="pb-16">
          {(() => {
            const model = models.find((m) => m.id === focusedModel);
            if (!model) return null;

            return (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
                  <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-medium text-gray-900">
                        {model.displayName}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {getVendorName(model.vendorId, vendors)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigateModel("prev")}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => navigateModel("next")}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                        {getCategoryName(model.categoryId, categories)}
                      </span>
                      {model.isOpenSource && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                          Open Source
                        </span>
                      )}
                    </div>

                    {model.description && (
                      <div className="border-b pb-3">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                          Description
                        </h3>
                        <p className="text-sm text-gray-600">
                          {model.description}
                        </p>
                      </div>
                    )}

                    {/* TODO: Add Parameters and Context Window fields here once they're 
                      consistently available in the data model and shown on both desktop and mobile views */}

                    <div className="border-t border-b py-3">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Pricing
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs text-gray-500 mb-1">
                            Input ($/1M)
                          </h4>
                          <p className="text-sm font-medium">
                            {model.pricing
                              ? formatCost(model.pricing.inputText)
                              : "N/A"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs text-gray-500 mb-1">
                            Output ($/1M)
                          </h4>
                          <p className="text-sm font-medium">
                            {model.pricing
                              ? formatCost(model.pricing.outputText)
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {inputText && outputText && model.pricing && (
                        <div className="mt-3">
                          <h4 className="text-xs text-gray-500 mb-1">
                            Example Cost
                          </h4>
                          {calculateSampleCost(model)}
                        </div>
                      )}
                    </div>

                    {/* Category info */}
                    <div className="pt-2">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Category:{" "}
                        {getCategoryName(model.categoryId, categories)}
                      </h3>
                      {categories.find((c) => c.id === model.categoryId)
                        ?.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {
                            categories.find((c) => c.id === model.categoryId)
                              ?.description
                          }
                        </p>
                      )}
                      {categories.find((c) => c.id === model.categoryId)
                        ?.useCase && (
                        <div className="mt-2">
                          <p className="text-gray-700 font-medium text-xs mb-1">
                            Example Use Case:
                          </p>
                          <p className="text-gray-600 text-xs">
                            {
                              categories.find((c) => c.id === model.categoryId)
                                ?.useCase
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode("cards")}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  >
                    Back to Cards
                  </button>
                  <button
                    onClick={() => {
                      toggleModelSelection(model.id);
                      setViewMode("cards");
                    }}
                    className={`px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 ${
                      selectedModels.includes(model.id)
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {selectedModels.includes(model.id)
                      ? "Selected ✓"
                      : "Select for Compare"}
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      <div className="text-sm text-gray-600 mt-2 mb-8 px-1">
        <p>
          Pricing shown per 1M tokens. Example costs are estimates only and may
          vary based on actual tokenization.
        </p>
        <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default MobileView;
