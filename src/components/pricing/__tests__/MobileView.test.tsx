/**
 * Unit tests for MobileView component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom for DOM assertions
import MobileView from '../MobileView';
import { AIModel, Category, Vendor } from '@/lib/types';

// Mock the formatters and helper functions
jest.mock('../formatters', () => ({
  formatParameters: jest.fn((params) => `${params} billion`),
  formatCost: jest.fn((cost) => `$${cost}`),
  calculateInputCost: jest.fn((text, price) => price ? 0.01 : undefined),
  calculateOutputCost: jest.fn((text, price) => price ? 0.02 : undefined),
}));

jest.mock('../helpers', () => ({
  getCategoryName: jest.fn((id) => id === 1 ? 'Top-tier' : 'Mid-range'),
  getVendorName: jest.fn((id) => id === 1 ? 'OpenAI' : 'Anthropic'),
  getVendorPricingUrl: jest.fn(() => 'https://example.com/pricing'),
  getVendorModelsListUrl: jest.fn(() => 'https://example.com/models'),
}));

// Mock exportUtils functions
jest.mock('@/lib/exportUtils', () => ({
  prepareExportData: jest.fn(() => []),
  exportAsCSV: jest.fn(),
  exportAsJSON: jest.fn(),
}));

describe('MobileView', () => {
  // Sample data for tests
  const mockModels: AIModel[] = [
    {
      id: 1,
      systemName: 'gpt-4',
      displayName: 'GPT-4',
      categoryId: 1,
      parametersB: 1000,
      vendorId: 1,
      host: 'openai.com',
      description: 'Advanced model with enhanced reasoning',
      contextWindow: 8000,
      pricing: { id: 1, modelId: 1, inputText: 10, outputText: 30 },
    },
    {
      id: 2,
      systemName: 'claude-3-opus',
      displayName: 'Claude 3 Opus',
      categoryId: 1,
      parametersB: 700,
      vendorId: 2,
      host: 'anthropic.com',
      description: 'High-performance reasoning model',
      contextWindow: 100000,
      pricing: { id: 2, modelId: 2, inputText: 15, outputText: 45 },
    },
  ];

  const mockCategories: Category[] = [
    { 
      id: 1, 
      name: 'Top-tier', 
      description: 'Best performance models available',
      useCase: 'Complex reasoning and generation tasks'
    },
    { 
      id: 2, 
      name: 'Mid-range', 
      description: 'Good balance of performance and cost',
      useCase: 'Everyday tasks and applications'
    }
  ];

  const mockVendors: Vendor[] = [
    { id: 1, name: 'OpenAI', pricingUrl: 'https://openai.com/pricing', modelsListUrl: 'https://openai.com/models' },
    { id: 2, name: 'Anthropic', pricingUrl: 'https://anthropic.com/pricing', modelsListUrl: 'https://anthropic.com/models' }
  ];

  const defaultProps = {
    models: mockModels,
    categories: mockCategories,
    vendors: mockVendors,
    sortConfig: { key: 'displayName', direction: 'asc' },
    onSort: jest.fn(),
    inputText: 'Sample input text',
    outputText: 'Sample output text',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders cards view by default', () => {
    render(<MobileView {...defaultProps} />);
    
    // Check that models are rendered
    expect(screen.getByText('GPT-4')).toBeInTheDocument();
    expect(screen.getByText('Claude 3 Opus')).toBeInTheDocument();
    
    // Check that cards view is active
    const cardsButton = screen.getByText('Cards View');
    expect(cardsButton.closest('button')).toHaveClass('bg-white');
  });

  test('allows model selection and switching to compare view', () => {
    render(<MobileView {...defaultProps} />);
    
    // Select first model
    const selectButtons = document.querySelectorAll('.absolute.top-3.right-3');
    fireEvent.click(selectButtons[0]);
    
    // Check if selection UI appears
    expect(screen.getByText('1 models selected')).toBeInTheDocument();
    
    // Click compare button
    fireEvent.click(screen.getByText('Compare'));
    
    // Verify we're in compare view
    expect(screen.getByText('Compare by:')).toBeInTheDocument();
  });

  test('allows switching to detail view', () => {
    render(<MobileView {...defaultProps} />);
    
    // Click on a model card to see details
    const modelCards = document.querySelectorAll('.cursor-pointer');
    fireEvent.click(modelCards[1]); // Click the second model (Claude 3 Opus)
    
    // Verify we're in detail view
    expect(screen.getByText('High-performance reasoning model')).toBeInTheDocument();
    
    // Check that category info is shown
    expect(screen.getByText('Complex reasoning and generation tasks')).toBeInTheDocument();
  });

  test('allows navigating between models in detail view', () => {
    render(<MobileView {...defaultProps} />);
    
    // First go to detail view
    const modelCards = document.querySelectorAll('.cursor-pointer');
    fireEvent.click(modelCards[0]); // Click the first model (GPT-4)
    
    // Initial model should be visible
    expect(screen.getByText('Advanced model with enhanced reasoning')).toBeInTheDocument();
    
    // Click next button
    const nextButton = document.querySelectorAll('button[class*="p-1 rounded-full"]')[1];
    fireEvent.click(nextButton);
    
    // Should now see the second model
    expect(screen.getByText('High-performance reasoning model')).toBeInTheDocument();
  });

  test('allows changing comparison attribute', () => {
    render(<MobileView {...defaultProps} />);
    
    // Select first model
    const selectButtons = document.querySelectorAll('.absolute.top-3.right-3');
    fireEvent.click(selectButtons[0]);
    
    // Go to compare view
    fireEvent.click(screen.getByText('Compare'));
    
    // Default attribute is inputPrice
    expect(screen.getByText('Input Price ($/1M)')).toBeInTheDocument();
    
    // Change attribute to parameters
    fireEvent.change(
      screen.getByRole('combobox'), 
      { target: { value: 'parametersB' } }
    );
    
    // Should now show parameters as the comparison attribute
    expect(screen.getAllByText('Parameters')[0]).toBeInTheDocument();
  });
});