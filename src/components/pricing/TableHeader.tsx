'use client';

import React from 'react';
import SortableHeader from './SortableHeader';

interface SortConfig {
  key: string;
  direction: string;
}

interface TableHeaderProps {
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({ sortConfig, onSort }) => {
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
          label="Category"
          sortKey="categoryId"
          currentSortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSort={onSort}
        />
        <SortableHeader
          label="Parameters"
          sortKey="parametersB"
          currentSortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSort={onSort}
          align="right"
        />
        <SortableHeader
          label="Input (1M)"
          sortKey="pricing.inputText"
          currentSortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSort={onSort}
          align="right"
        />
        <SortableHeader
          label="Output (1M)"
          sortKey="pricing.outputText"
          currentSortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSort={onSort}
          align="right"
        />
        <SortableHeader
          label="Provider"
          sortKey="vendorId"
          currentSortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSort={onSort}
        />
      </tr>
    </thead>
  );
};

export default TableHeader;