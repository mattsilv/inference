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

// Estimate token count from text with improved accuracy
export const estimateTokenCount = (text: string): number => {
  if (!text) return 0;
  
  // Check for multiplier metadata tag
  const multiplierMatch = text.match(/^\[TOKEN_MULTIPLIER:(\d+)\]/);
  let multiplier = 1;
  let cleanText = text;
  
  if (multiplierMatch) {
    multiplier = parseInt(multiplierMatch[1], 10);
    // Remove the multiplier tag from the text for processing
    cleanText = text.substring(multiplierMatch[0].length);
  }
  
  // More accurate token estimation algorithm
  // Based on GPT tokenization patterns:
  // - Count spaces (roughly 1 token per word)
  // - Count special characters that often get their own token
  // - Account for common prefixes/suffixes
  
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const specialChars = (cleanText.match(/[.,!?;:'"()\[\]{}]/g) || []).length;
  const numericChars = (cleanText.match(/\d/g) || []).length;
  
  // Formula balances different patterns found in language models
  // Provide a more accurate yet still conservative estimate
  const estimatedTokens = Math.ceil(wordCount * 1.3 + specialChars * 0.5 + numericChars * 0.3);
  
  // Fallback to character-based estimation if result is unexpectedly low
  const characterEstimate = Math.ceil(cleanText.length / 4);
  
  // Apply the multiplier to the final token count
  return Math.max(estimatedTokens, characterEstimate) * multiplier;
};

// Calculate approximate cost of processing input text
export const calculateInputCost = (text: string, pricePerMillion: number | undefined): number | undefined => {
  if (pricePerMillion === undefined) return undefined;
  
  const tokenCount = estimateTokenCount(text);
  // Convert from per million to per token, then multiply
  return (pricePerMillion / 1000000) * tokenCount;
};

// Calculate approximate cost of processing output text
export const calculateOutputCost = (text: string, pricePerMillion: number | undefined): number | undefined => {
  if (pricePerMillion === undefined) return undefined;
  
  const tokenCount = estimateTokenCount(text);
  // Convert from per million to per token, then multiply
  return (pricePerMillion / 1000000) * tokenCount;
};

// Calculate total cost (input + output)
export const calculateTotalCost = (
  inputText: string, 
  outputText: string, 
  inputPricePerMillion: number | undefined, 
  outputPricePerMillion: number | undefined
): { total: number | undefined, inputCost: number | undefined, outputCost: number | undefined } => {
  const inputCost = calculateInputCost(inputText, inputPricePerMillion);
  const outputCost = calculateOutputCost(outputText, outputPricePerMillion);
  
  // If either cost is undefined, the total will be undefined
  const total = (inputCost !== undefined && outputCost !== undefined) 
    ? inputCost + outputCost 
    : undefined;
    
  return { total, inputCost, outputCost };
};