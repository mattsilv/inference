"use client";

import React from "react";
import SortableHeader from "./SortableHeader";

interface SortConfig {
  key: string;
  direction: string;
}

interface TableHeaderProps {
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  showSampleColumn?: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  sortConfig,
  onSort,
  showSampleColumn = false,
}) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <SortableHeader
          label="Model Name"
          sortKey="displayName"
          currentSortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSort={onSort}
        />
        <SortableHeader
          label="Provider"
          sortKey="vendorName"
          currentSortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSort={onSort}
        />
        {/* Params column hidden */}
        <SortableHeader
          label={<>Input<br />($/1K)</>}
          sortKey="inputPrice"
          currentSortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSort={onSort}
          align="center"
          tooltip="Price per 1,000 tokens"
        />
        <SortableHeader
          label={<>Output<br />($/1K)</>}
          sortKey="outputPrice"
          currentSortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSort={onSort}
          align="center"
          tooltip="Price per 1,000 tokens"
        />
        {showSampleColumn && (
          <SortableHeader
            label={<>Example<br />Cost</>}
            sortKey="samplePrice"
            currentSortKey={sortConfig.key}
            sortDirection={sortConfig.direction}
            onSort={onSort}
            align="center"
          />
        )}
      </tr>
    </thead>
  );
};

export default TableHeader;
