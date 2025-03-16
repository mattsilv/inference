// Utility functions for formatting values in the pricing table

// Format number as parameter size (e.g., 1800 -> "1.8T")
export const formatParameters = (paramB: number): string => {
  if (paramB >= 1000) {
    return `${(paramB / 1000).toFixed(1)}T`;
  } else {
    return `${paramB}B`;
  }
};

// Format cost to display with consistent decimal places
export const formatCost = (cost: number | undefined): string => {
  if (cost === undefined) return 'N/A';
  return `$${cost.toFixed(3)}`;
};

// Format token window (e.g., 128000 -> "128K")
export const formatTokens = (tokens: number | undefined): string => {
  if (tokens === undefined) return 'N/A';
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(0)}K`;
  } else {
    return tokens.toString();
  }
};