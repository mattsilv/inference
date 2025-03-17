/**
 * Unit tests for TextInputArea component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TextInputArea from '../TextInputArea';
import { DEFAULT_SAMPLE_TEXT, DEFAULT_OUTPUT_TEXT } from '@/lib/sampleText';

// Mock the token counting function to ensure deterministic results
jest.mock('../formatters', () => {
  const original = jest.requireActual('../formatters');
  return {
    ...original,
    estimateTokenCount: jest.fn((text) => {
      // Extract multiplier if present
      const multiplierMatch = text.match(/^\[TOKEN_MULTIPLIER:(\d+)\]/);
      let multiplier = 1;
      
      if (multiplierMatch) {
        multiplier = parseInt(multiplierMatch[1], 10);
        text = text.substring(multiplierMatch[0].length);
      }
      
      // Simple deterministic calculation for tests
      return text.length * 0.25 * multiplier;
    }),
  };
});

describe('TextInputArea', () => {
  const mockOnTextUpdate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders correctly with default props', () => {
    render(
      <TextInputArea 
        defaultInputText={DEFAULT_SAMPLE_TEXT}
        defaultOutputText={DEFAULT_OUTPUT_TEXT}
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    // Check that the component renders key elements
    expect(screen.getByText(/Example: AI Chat Assistant/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of users/i)).toBeInTheDocument();
    expect(screen.getByText(/Total tokens:/i)).toBeInTheDocument();
    expect(screen.getByText(/Sample Conversation/i)).toBeInTheDocument();
  });
  
  test('updates user multiplier when input changes', async () => {
    render(
      <TextInputArea 
        defaultInputText={DEFAULT_SAMPLE_TEXT}
        defaultOutputText={DEFAULT_OUTPUT_TEXT}
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    const input = screen.getByLabelText(/Number of users/i);
    
    // Change multiplier to 100
    fireEvent.change(input, { target: { value: '100' } });
    
    await waitFor(() => {
      // Check that onTextUpdate was called with the tokenMultiplier tag
      const lastCall = mockOnTextUpdate.mock.calls[mockOnTextUpdate.mock.calls.length - 1];
      expect(lastCall[0]).toMatch(/^\[TOKEN_MULTIPLIER:100\]/);
      expect(lastCall[1]).toMatch(/^\[TOKEN_MULTIPLIER:100\]/);
    });
    
    // Try an extremely large value that should be capped
    fireEvent.change(input, { target: { value: '5000' } });
    
    await waitFor(() => {
      // Check that the warning about capping is shown when value > 1000
      expect(screen.getByText(/capped at 1000 users/i)).toBeInTheDocument();
      
      // Check that onTextUpdate was called with a capped multiplier
      const lastCall = mockOnTextUpdate.mock.calls[mockOnTextUpdate.mock.calls.length - 1];
      expect(lastCall[0]).toMatch(/^\[TOKEN_MULTIPLIER:1000\]/);
    });
  });
  
  test('handles extreme values gracefully', async () => {
    render(
      <TextInputArea 
        defaultInputText={DEFAULT_SAMPLE_TEXT}
        defaultOutputText={DEFAULT_OUTPUT_TEXT}
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    const input = screen.getByLabelText(/Number of users/i);
    
    // Try invalid input
    fireEvent.change(input, { target: { value: 'abc' } });
    
    // Should default to 1
    await waitFor(() => {
      const lastCall = mockOnTextUpdate.mock.calls[mockOnTextUpdate.mock.calls.length - 1];
      expect(lastCall[0]).toMatch(/^\[TOKEN_MULTIPLIER:1\]/);
    });
    
    // Try negative number
    fireEvent.change(input, { target: { value: '-50' } });
    
    // Should be clamped to 1
    expect(input.value).toBe('1');
    
    // Try extremely large number (over 10000 max)
    fireEvent.change(input, { target: { value: '20000' } });
    
    // Should be clamped to 10000 in the UI
    expect(input.value).toBe('10000');
    
    // But calculation should be capped at 1000
    await waitFor(() => {
      const lastCall = mockOnTextUpdate.mock.calls[mockOnTextUpdate.mock.calls.length - 1];
      expect(lastCall[0]).toMatch(/^\[TOKEN_MULTIPLIER:1000\]/);
    });
  });
  
  test('modal can be opened and closed', () => {
    render(
      <TextInputArea 
        defaultInputText={DEFAULT_SAMPLE_TEXT}
        defaultOutputText={DEFAULT_OUTPUT_TEXT}
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    // Modal should not be visible initially
    expect(screen.queryByText(/Complete Sample Conversation/i)).not.toBeInTheDocument();
    
    // Open the modal
    fireEvent.click(screen.getByText(/Read full conversation/i));
    
    // Modal should now be visible
    expect(screen.getByText(/Complete Sample Conversation/i)).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByLabelText(/close/i));
    
    // Modal should be hidden again
    expect(screen.queryByText(/Complete Sample Conversation/i)).not.toBeInTheDocument();
  });
});