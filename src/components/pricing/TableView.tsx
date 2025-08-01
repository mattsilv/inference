"use client";

import React from "react";
import { AIModel, Category, Vendor } from "@/lib/types";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

interface TableViewProps {
  models: AIModel[];
  categories: Category[];
  vendors: Vendor[];
  sortConfig: {
    key: string;
    direction: string;
  };
  onSort: (key: string) => void;
  inputText?: string;
  outputText?: string;
}

const TableView: React.FC<TableViewProps> = ({
  models,
  categories,
  vendors,
  sortConfig,
  onSort,
  inputText = "",
  outputText = "",
}) => {
  // Sort options are now handled directly in MobileView component

  // Mobile view is now handled by dedicated MobileView component

  // For desktop screens, show the table
  const renderDesktopTable = () => (
    <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed w-full">
          <TableHeader
            sortConfig={sortConfig}
            onSort={onSort}
            showSampleColumn={!!(inputText && outputText)}
          />
          <tbody className="divide-y divide-gray-200">
            {models.map((model, index) => (
              <TableRow
                key={model.id}
                model={model}
                categories={categories}
                vendors={vendors}
                inputText={inputText}
                outputText={outputText}
                isEven={index % 2 === 0}
              />
            ))}
            {models.length === 0 && (
              <tr>
                <td
                  colSpan={inputText && outputText ? 7 : 6}
                  className="text-center py-8"
                >
                  <p className="text-gray-500">
                    No models match your current filters.
                  </p>
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
      {/* Mobile cards removed - now handled by dedicated MobileView component */}
      <div className="hidden md:block text-sm text-gray-600 mt-2 mb-8 px-1">
        <p>
          Pricing shown per 1M tokens. Example costs are estimates only and may
          vary based on actual tokenization.
        </p>
        <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </>
  );
};

export default TableView;
