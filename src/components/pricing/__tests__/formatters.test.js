/**
 * Unit tests for formatter functions
 */

import { 
  formatCost, 
  formatTokens, 
  estimateTokenCount, 
  calculateInputCost, 
  calculateOutputCost,
  calculateTotalCost,
  formatPrice
} from '../formatters';

describe('formatters', () => {
  describe('estimateTokenCount', () => {
    test('should return 0 for empty text', () => {
      expect(estimateTokenCount('')).toBe(0);
    });

    test('should calculate token count for simple text', () => {
      const text = 'This is a simple message.';
      // Should be around 5-6 tokens based on our algorithm
      expect(estimateTokenCount(text)).toBeGreaterThan(4);
      expect(estimateTokenCount(text)).toBeLessThan(10);
    });

    test('should calculate token count for complex text with special characters', () => {
      const text = 'Hello, world! This is a test with numbers (123) and some "special" characters.';
      // Should be higher due to special chars
      expect(estimateTokenCount(text)).toBeGreaterThan(15);
    });

    test('should handle multiplier metadata correctly', () => {
      const text = '[TOKEN_MULTIPLIER:10]Simple test.';
      const expectedBase = estimateTokenCount('Simple test.');
      expect(estimateTokenCount(text)).toBe(expectedBase * 10);
    });

    test('should handle very large multipliers', () => {
      const text = '[TOKEN_MULTIPLIER:1000]Test';
      const baseCount = estimateTokenCount('Test');
      expect(estimateTokenCount(text)).toBe(baseCount * 1000);
    });

    test('should produce proportional results with increasing text', () => {
      const text1 = 'Short text.';
      const text2 = 'This is a longer text with more words and should have more tokens.';
      
      expect(estimateTokenCount(text2)).toBeGreaterThan(estimateTokenCount(text1));
    });
  });

  describe('calculateInputCost and calculateOutputCost', () => {
    test('should return undefined if price is undefined', () => {
      expect(calculateInputCost('test', undefined)).toBeUndefined();
      expect(calculateOutputCost('test', undefined)).toBeUndefined();
    });

    test('should calculate cost based on token count', () => {
      const text = 'This is a test message';
      const pricePerMillion = 1000; // $1 per million tokens
      const tokenCount = estimateTokenCount(text);
      const expectedCost = (pricePerMillion / 1000000) * tokenCount;
      
      expect(calculateInputCost(text, pricePerMillion)).toBeCloseTo(expectedCost);
      expect(calculateOutputCost(text, pricePerMillion)).toBeCloseTo(expectedCost);
    });

    test('should handle multipliers in cost calculation', () => {
      const text = '[TOKEN_MULTIPLIER:100]Test message';
      const pricePerMillion = 2000; // $2 per million tokens
      const tokenCount = estimateTokenCount('Test message') * 100;
      const expectedCost = (pricePerMillion / 1000000) * tokenCount;
      
      expect(calculateInputCost(text, pricePerMillion)).toBeCloseTo(expectedCost);
    });
    
    test('should correctly calculate costs for empty strings', () => {
      expect(calculateInputCost('', 1000)).toBe(0);
      expect(calculateOutputCost('', 2000)).toBe(0);
    });
  });

  describe('calculateTotalCost', () => {
    test('should return undefined values if any price is undefined', () => {
      const result1 = calculateTotalCost('input', 'output', undefined, 1000);
      expect(result1.total).toBeUndefined();
      expect(result1.inputCost).toBeUndefined();
      
      const result2 = calculateTotalCost('input', 'output', 1000, undefined);
      expect(result2.total).toBeUndefined();
      expect(result2.outputCost).toBeUndefined();
    });

    test('should calculate accurate total from input and output costs', () => {
      const inputText = 'This is input text';
      const outputText = 'This is output text';
      const inputPrice = 1000; // $1 per million input tokens
      const outputPrice = 2000; // $2 per million output tokens
      
      const inputTokens = estimateTokenCount(inputText);
      const outputTokens = estimateTokenCount(outputText);
      
      const expectedInputCost = (inputPrice / 1000000) * inputTokens;
      const expectedOutputCost = (outputPrice / 1000000) * outputTokens;
      const expectedTotal = expectedInputCost + expectedOutputCost;
      
      const result = calculateTotalCost(inputText, outputText, inputPrice, outputPrice);
      
      expect(result.inputCost).toBeCloseTo(expectedInputCost);
      expect(result.outputCost).toBeCloseTo(expectedOutputCost);
      expect(result.total).toBeCloseTo(expectedTotal);
    });

    test('should handle multipliers in total cost calculation', () => {
      const inputText = '[TOKEN_MULTIPLIER:50]User prompt';
      const outputText = '[TOKEN_MULTIPLIER:50]AI response';
      const inputPrice = 1000;
      const outputPrice = 3000;
      
      const result = calculateTotalCost(inputText, outputText, inputPrice, outputPrice);
      
      // Verify the multiplier was applied
      const baseInputTokens = estimateTokenCount('User prompt');
      const baseOutputTokens = estimateTokenCount('AI response');
      
      expect(estimateTokenCount(inputText)).toBe(baseInputTokens * 50);
      expect(estimateTokenCount(outputText)).toBe(baseOutputTokens * 50);
      
      // Check that costs reflect the multiplier
      expect(result.total).toBeGreaterThan(0);
      expect(result.total).toBe(result.inputCost + result.outputCost);
    });
  });
  
  // Test formatting helper functions
  describe('formatCost', () => {
    test('should format costs with consistent decimals', () => {
      expect(formatCost(1.2)).toBe('$1.200');
      expect(formatCost(0.00456)).toBe('$0.005');
      expect(formatCost(10)).toBe('$10.000');
    });
    
    test('should return N/A for undefined costs', () => {
      expect(formatCost(undefined)).toBe('N/A');
    });
  });
  
  describe('formatTokens', () => {
    test('should format token counts with appropriate units', () => {
      expect(formatTokens(500)).toBe('500');
      expect(formatTokens(3000)).toBe('3K');
      expect(formatTokens(1500000)).toBe('1.5M');
    });
    
    test('should return N/A for undefined token counts', () => {
      expect(formatTokens(undefined)).toBe('N/A');
    });
  });

  // CRITICAL TESTS FOR PRICE FORMATTING
  // These tests ensure we maintain the correct price display format
  // All pricing should be shown per MILLION tokens
  describe('formatPrice', () => {
    test('should format prices per million tokens without scaling', () => {
      // Test regular model pricing (typically $1-$50 per million tokens)
      expect(formatPrice(10)).toBe('$10.000');
      expect(formatPrice(0.5)).toBe('$0.500');
      expect(formatPrice(30)).toBe('$30.000');
    });

    test('should format Gemini 2.0 Flash prices correctly as per million tokens', () => {
      // The error that triggered this test - Gemini pricing at 37.5 per million tokens
      expect(formatPrice(37.5)).toBe('$37.500');
      expect(formatPrice(150)).toBe('$150.000');
    });

    test('should handle very low and very high prices as per million tokens', () => {
      // Small open-source models with very low pricing
      expect(formatPrice(0.02)).toBe('$0.020');
      // Expensive models like GPT-4 series
      expect(formatPrice(75)).toBe('$75.000');
    });
    
    test('should never divide the input price by 1000', () => {
      // Repeat of the error test case - make sure we don't divide by 1000
      // Gemini 2.0 Flash input: 37.5 -> should display as 37.500, not 0.038
      const inputPrice = 37.5;
      const formattedPrice = formatPrice(inputPrice);
      // Should not be $0.038 (which would be if we divided by 1000)
      expect(formattedPrice).not.toBe('$0.038');
      // Should be $37.500
      expect(formattedPrice).toBe('$37.500');
    });

    test('should return N/A for undefined prices', () => {
      expect(formatPrice(undefined)).toBe('N/A');
    });
  });
});