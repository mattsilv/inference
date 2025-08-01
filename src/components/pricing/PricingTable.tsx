"use client";

import React, { useState } from "react";
import { AIModel, Category, Vendor } from "@/lib/types";
import TableView from "./TableView";
import MobileView from "./MobileView";
import FilterBar from "./FilterBar";
import TextInputArea from "./TextInputArea";
import { filterModels, filterModelsByContextWindow, sortModels } from "./helpers";
import {
  prepareExportData,
  exportAsCSV,
  exportAsJSON,
} from "@/lib/exportUtils";
import { DEFAULT_SAMPLE_TEXT, DEFAULT_OUTPUT_TEXT } from "@/lib/sampleText";

interface PricingTableProps {
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
}

const PricingTable: React.FC<PricingTableProps> = ({
  models,
  categories,
  vendors,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedContextRange, setSelectedContextRange] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  }>({
    key: "inputPrice",
    direction: "asc",
  });
  // const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>(DEFAULT_SAMPLE_TEXT);
  const [outputText, setOutputText] = useState<string>(DEFAULT_OUTPUT_TEXT);

  // Filter models by categories, vendors and context window
  const getFilteredModels = () => {
    let result = models;

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = filterModels(result, selectedCategories, []);
    }

    // Filter by vendors
    if (selectedVendors.length > 0) {
      result = filterModels(result, [], selectedVendors);
    }

    // Filter by context window range
    result = filterModelsByContextWindow(result, selectedContextRange);

    // Apply sorting
    return sortModels(
      result,
      sortConfig.key,
      sortConfig.direction,
      inputText,
      outputText
    );
  };

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => {
      const direction =
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key, direction };
    });
  };

  // Handle category filter changes
  const handleCategoryFilter = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  // Handle vendor filter changes
  const handleVendorFilter = (vendors: string[]) => {
    setSelectedVendors(vendors);
  };

  // Handle context range filter changes
  const handleContextRangeFilter = (range: string) => {
    setSelectedContextRange(range);
  };

  // Handle text inputs update
  const handleTextUpdate = (newInputText: string, newOutputText: string) => {
    setInputText(newInputText);
    setOutputText(newOutputText);
  };

  // Handle category navigation
  // const scrollToCategory = (categoryName: string) => {
  //   const element = document.getElementById(
  //     `category-${categoryName.replace(/\s+/g, "-").toLowerCase()}`
  //   );
  //   if (element) {
  //     element.scrollIntoView({ behavior: "smooth" });
  //     setActiveCategory(categoryName);
  //   }
  // };

  // Handle downloads - wrapped in useCallback to avoid dependency issues
  const handleDownloadCSV = React.useCallback(() => {
    const data = prepareExportData(models, categories, vendors);
    exportAsCSV(data);
  }, [models, categories, vendors]);

  const handleDownloadJSON = React.useCallback(() => {
    const data = prepareExportData(models, categories, vendors);
    exportAsJSON(data);
  }, [models, categories, vendors]);

  return (
    <div
      className="px-4 py-8"
      id="top"
      style={{ maxWidth: "var(--content-max-width)", margin: "0 auto" }}
    >
      <div className="flex justify-center mb-2">
        <div className="flex items-center py-2 px-4 border-2 border-gray-800 rounded-lg shadow-sm bg-white relative">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-3"
          >
            <path
              d="M12 3L4 9V21H20V9L12 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 21V12H15V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Inference Pricing
          </h1>
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            BETA
          </span>
        </div>
      </div>
      <div className="flex justify-center mb-6">
        <p className="text-sm text-gray-600 max-w-lg text-center">
          We&apos;re still working on our pricing scraper. Please double check
          prices before making any decisions on this information while
          we&apos;re still in beta.
        </p>
      </div>

      {/* Text Input Areas for Sample Input and Output Text */}
      <TextInputArea
        defaultInputText={DEFAULT_SAMPLE_TEXT}
        defaultOutputText={DEFAULT_OUTPUT_TEXT}
        onTextUpdate={handleTextUpdate}
      />

      {/* Category Navigation - Hidden per user request */}
      {/* 
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="flex items-center flex-wrap">
          <h2 className="text-lg font-medium mr-4">Jump to Category:</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.name)}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeCategory === category.name
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      */}

      <FilterBar
        categories={categories}
        vendors={vendors}
        selectedCategories={selectedCategories}
        selectedVendors={selectedVendors}
        selectedContextRange={selectedContextRange}
        onCategoryChange={handleCategoryFilter}
        onVendorChange={handleVendorFilter}
        onContextRangeChange={handleContextRangeFilter}
      />

      {/* Single table showing all models */}
      {(() => {
        const allModels = getFilteredModels();
        
        if (allModels.length === 0) return <div className="text-center text-gray-500 py-8">No models match the current filters.</div>;

        return (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">All Models</h2>
              <div className="text-sm text-gray-600">
                Showing {allModels.length} models
              </div>
            </div>

            {/* Desktop Table View */}
            <TableView
              models={allModels}
              categories={categories}
              vendors={vendors}
              sortConfig={sortConfig}
              onSort={handleSort}
              inputText={inputText}
              outputText={outputText}
            />

            {/* Mobile View */}
            <div className="block md:hidden">
              <MobileView
                models={allModels}
                categories={categories}
                vendors={vendors}
                inputText={inputText}
                outputText={outputText}
              />
            </div>
          </div>
        );
      })()}

      {/* Download buttons at the bottom of all tables */}
      <div className="flex flex-wrap items-center mt-8 mb-4 gap-3 border-t border-gray-200 pt-6">
        <div className="flex">
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center px-3 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Download CSV"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            CSV
          </button>
          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Download JSON"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            JSON
          </button>
        </div>
        <p className="text-sm text-gray-600 m-0">
          Download all available models and pricing data instantly.
        </p>
      </div>
    </div>
  );
};

export default PricingTable;
