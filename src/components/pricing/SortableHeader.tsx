'use client';

import React from 'react';

interface SortableHeaderProps {
  label: React.ReactNode;
  sortKey: string;
  currentSortKey: string;
  sortDirection: string;
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
  tooltip?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  sortKey,
  currentSortKey,
  sortDirection,
  onSort,
  align = 'left',
  tooltip,
}) => {
  // For Model Name and Provider columns, position sort icon on the same line
  const isTextColumn = sortKey === 'displayName' || sortKey === 'vendorName';
  
  // Define column widths based on content type
  let widthClass = '';
  if (sortKey === 'displayName') {
    widthClass = 'w-1/3'; // Model name gets more space
  } else if (sortKey === 'vendorName') {
    widthClass = 'w-1/6'; // Provider name gets moderate space
  } else if (sortKey === 'inputPrice' || sortKey === 'outputPrice') {
    widthClass = 'w-[12.5%]'; // Price columns get minimal space
  } else if (sortKey === 'samplePrice') {
    widthClass = 'w-1/6'; // Sample cost gets more space for breakdown
  }
  
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-${align} text-xs font-medium text-gray-500 uppercase tracking-wider ${widthClass}`}
    >
      <div className={`flex ${isTextColumn ? 'flex-row items-center' : 'flex-col items-' + (align === 'left' ? 'start' : align === 'center' ? 'center' : 'end')}`}>
        <div className="relative group flex items-center">
          <span className="whitespace-pre-line">{label}</span>
          {tooltip && (
            <span className="text-gray-400 cursor-help ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          )}
          {tooltip && (
            <div className="hidden group-hover:block absolute z-10 top-full mt-1 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-xs normal-case font-normal text-gray-700 whitespace-nowrap">
              {tooltip}
            </div>
          )}
        </div>
        <button
          onClick={() => onSort(sortKey)}
          className={`${isTextColumn ? 'ml-1' : 'mt-1'} ${
            currentSortKey === sortKey
              ? sortDirection === 'ascending'
                ? 'text-blue-500'
                : 'text-blue-700 rotate-180'
              : 'text-gray-400'
          }`}
          aria-label={`Sort by ${sortKey}`}
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