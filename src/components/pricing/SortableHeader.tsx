'use client';

import React from 'react';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSortKey: string;
  sortDirection: string;
  onSort: (key: string) => void;
  align?: 'left' | 'right';
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  sortKey,
  currentSortKey,
  sortDirection,
  onSort,
  align = 'left',
}) => {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-${align} text-xs font-medium text-gray-500 uppercase tracking-wider`}
    >
      <div className={`flex items-center ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        <button
          onClick={() => onSort(sortKey)}
          className={`ml-1 ${
            currentSortKey === sortKey
              ? sortDirection === 'ascending'
                ? 'text-blue-500'
                : 'text-blue-700 rotate-180'
              : 'text-gray-400'
          }`}
          aria-label={`Sort by ${label}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </button>
      </div>
    </th>
  );
};

export default SortableHeader;