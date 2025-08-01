"use client";

import React, { useState, useEffect } from "react";
import { estimateTokenCount } from "./formatters";
import {
  DEFAULT_SAMPLE_TEXT,
  USER_MESSAGES,
  AI_RESPONSES,
} from "@/lib/sampleText";

interface TextInputAreaProps {
  defaultInputText: string;
  defaultOutputText: string;
  onTextUpdate: (inputText: string, outputText: string) => void;
}

// Modal component for displaying the full conversation
const ConversationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Calculate token counts for all messages
  const userTokenCounts = USER_MESSAGES.map((msg) => estimateTokenCount(msg));
  const aiTokenCounts = AI_RESPONSES.map((msg) => estimateTokenCount(msg));

  const totalUserTokens = userTokenCounts.reduce(
    (sum, count) => sum + count,
    0
  );
  const totalAiTokens = aiTokenCounts.reduce((sum, count) => sum + count, 0);
  const totalTokens = totalUserTokens + totalAiTokens;

  // Format the conversation to alternate between user and assistant messages
  const formattedMessages = [];

  for (let i = 0; i < USER_MESSAGES.length; i++) {
    // Add user message
    formattedMessages.push(
      <div key={`user-${i}`} className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium text-sm text-gray-700">User:</div>
          <div className="text-xs text-gray-500">
            {userTokenCounts[i]} tokens
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          {USER_MESSAGES[i]}
        </div>
      </div>
    );

    // Add AI response if available
    if (i < AI_RESPONSES.length) {
      formattedMessages.push(
        <div key={`ai-${i}`} className="mb-4 ml-4">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium text-sm text-gray-700">Assistant:</div>
            <div className="text-xs text-gray-500">
              {aiTokenCounts[i]} tokens
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-line">
            {AI_RESPONSES[i]}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Complete Sample Conversation</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">{formattedMessages}</div>

        <div className="p-4 border-t bg-gray-50 text-xs text-gray-500">
          <div className="flex justify-between mb-1">
            <div className="font-medium">Token Usage Summary:</div>
            <div>
              Total tokens: <span className="font-medium">{totalTokens}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-2 rounded">
              <div className="flex justify-between">
                <div>Input tokens (user messages):</div>
                <div className="font-medium">{totalUserTokens}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Typically charged at a lower rate
              </div>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <div className="flex justify-between">
                <div>Output tokens (AI responses):</div>
                <div className="font-medium">{totalAiTokens}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Typically charged at a higher rate
              </div>
            </div>
          </div>
          <div className="text-xs mt-2 italic">
            This is a sample conversation to illustrate typical AI model usage
            and cost calculation.
          </div>
        </div>
      </div>
    </div>
  );
};

const TextInputArea: React.FC<TextInputAreaProps> = ({ onTextUpdate }) => {
  // Calculate token counts for both user inputs and AI outputs
  const totalUserMessages = USER_MESSAGES.join("\n\n");
  const totalAIResponses = AI_RESPONSES.join("\n\n");

  const [inputTokenCount, setInputTokenCount] = useState(0);
  const [outputTokenCount, setOutputTokenCount] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userMultiplier, setUserMultiplier] = useState(10);
  const [demoMode, setDemoMode] = useState<'chat' | 'categorization'>('chat');

  // Categorization example data
  const rawDataExample = `Product reviews:
- "Amazing laptop, super fast and lightweight!"
- "Coffee maker broke after 2 weeks, terrible quality"
- "Love this book, couldn't put it down!"
- "Phone screen cracked easily, not durable"
- "Best headphones I've ever owned, great sound"
- "Hotel room was dirty and smelled bad"
- "Restaurant service was excellent, food was delicious"
- "Car rental company was unprofessional and rude"`;

  const categorizedOutput = `{
  "categories": [
    {
      "name": "Electronics",
      "sentiment": "mixed",
      "items": [
        {"text": "Amazing laptop, super fast and lightweight!", "sentiment": "positive", "confidence": 0.95},
        {"text": "Phone screen cracked easily, not durable", "sentiment": "negative", "confidence": 0.88},
        {"text": "Best headphones I've ever owned, great sound", "sentiment": "positive", "confidence": 0.92}
      ]
    },
    {
      "name": "Home & Kitchen",
      "sentiment": "negative",
      "items": [
        {"text": "Coffee maker broke after 2 weeks, terrible quality", "sentiment": "negative", "confidence": 0.91}
      ]
    },
    {
      "name": "Books & Media",
      "sentiment": "positive", 
      "items": [
        {"text": "Love this book, couldn't put it down!", "sentiment": "positive", "confidence": 0.94}
      ]
    },
    {
      "name": "Travel & Hospitality",
      "sentiment": "mixed",
      "items": [
        {"text": "Hotel room was dirty and smelled bad", "sentiment": "negative", "confidence": 0.89},
        {"text": "Restaurant service was excellent, food was delicious", "sentiment": "positive", "confidence": 0.93},
        {"text": "Car rental company was unprofessional and rude", "sentiment": "negative", "confidence": 0.87}
      ]
    }
  ],
  "summary": {
    "total_items": 8,
    "categories_found": 4,
    "overall_sentiment": "mixed",
    "positive_count": 4,
    "negative_count": 4
  }
}`;

  // This effect runs once on mount to set up initial token counts
  useEffect(() => {
    if (demoMode === 'chat') {
      // Calculate token counts for all messages (not just the displayed ones)
      const userTokens = USER_MESSAGES.reduce(
        (sum, msg) => sum + estimateTokenCount(msg),
        0
      );
      const aiTokens = AI_RESPONSES.reduce(
        (sum, msg) => sum + estimateTokenCount(msg),
        0
      );

      setInputTokenCount(userTokens);
      setOutputTokenCount(aiTokens);
      setTotalTokens(userTokens + aiTokens);
    } else {
      // Calculate token counts for categorization example
      const inputTokens = estimateTokenCount(rawDataExample);
      const outputTokens = estimateTokenCount(categorizedOutput);

      setInputTokenCount(inputTokens);
      setOutputTokenCount(outputTokens);
      setTotalTokens(inputTokens + outputTokens);
    }
  }, [demoMode, rawDataExample, categorizedOutput]);

  // This effect runs whenever the multiplier or mode changes to update the pricing table
  useEffect(() => {
    try {
      const maxSafeMultiplier = 1000; // Cap the multiplier to prevent browser crashes
      const safeMultiplier = Math.min(userMultiplier, maxSafeMultiplier);

      let inputText, outputText;
      
      if (demoMode === 'chat') {
        // Add a special metadata prefix that our formatters will detect
        inputText = `[TOKEN_MULTIPLIER:${safeMultiplier}]${totalUserMessages}`;
        outputText = `[TOKEN_MULTIPLIER:${safeMultiplier}]${totalAIResponses}`;
      } else {
        // For categorization, use the raw data and structured output
        inputText = `[TOKEN_MULTIPLIER:${safeMultiplier}]${rawDataExample}`;
        outputText = `[TOKEN_MULTIPLIER:${safeMultiplier}]${categorizedOutput}`;
      }

      onTextUpdate(inputText, outputText);
    } catch (err) {
      console.error("Error updating text with multiplier:", err);
      // Fallback to single instance if there's an error
      if (demoMode === 'chat') {
        onTextUpdate(totalUserMessages, totalAIResponses);
      } else {
        onTextUpdate(rawDataExample, categorizedOutput);
      }
    }
  }, [onTextUpdate, totalUserMessages, totalAIResponses, userMultiplier, demoMode, rawDataExample, categorizedOutput]);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow p-4 mb-6">
        <div className="flex flex-col gap-3">
          {/* Radio buttons for demo mode selection */}
          <div className="flex items-center gap-6 pb-3 border-b border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="demoMode"
                value="chat"
                checked={demoMode === 'chat'}
                onChange={(e) => setDemoMode(e.target.value as 'chat' | 'categorization')}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Chat Assistant</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="demoMode"
                value="categorization"
                checked={demoMode === 'categorization'}
                onChange={(e) => setDemoMode(e.target.value as 'chat' | 'categorization')}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Data Categorization</span>
            </label>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium flex items-center gap-2">
              {demoMode === 'chat' ? 'Example: AI Assistant Chat (10 msg thread)' : 'Example: Product Review Categorization'}
              <span className="text-sm text-gray-600">×</span>
              <input
                type="number"
                value={userMultiplier}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setUserMultiplier(Math.min(value, 10000));
                }}
                min="1"
                max="10000"
                className="w-16 h-6 text-sm border border-gray-300 rounded text-center"
                aria-label={demoMode === 'chat' ? 'Number of users' : 'Number of batches'}
              />
              <span className="text-xs text-gray-500">
                {demoMode === 'chat' ? '(users)' : '(batches)'}
              </span>
            </h3>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Total tokens:{" "}
              <span className="font-medium">
                {totalTokens * userMultiplier}
              </span>
              {userMultiplier > 1000 && (
                <span className="text-yellow-600 ml-1">
                  (capped at 1000 {demoMode === 'chat' ? 'users' : 'batches'} for calculation)
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium text-sm text-gray-700">
                  {demoMode === 'chat' ? 'Sample Conversation' : 'Raw Data Input'}
                </div>
                <div className="flex gap-3">
                  <div className="text-xs text-blue-600">
                    Input:{" "}
                    <span className="font-medium">{inputTokenCount}</span>{" "}
                    tokens × {userMultiplier}
                  </div>
                  <div className="text-xs text-gray-600">
                    Output:{" "}
                    <span className="font-medium">{outputTokenCount}</span>{" "}
                    tokens × {userMultiplier}
                  </div>
                </div>
              </div>
              <div
                className="text-xs text-gray-600 overflow-auto max-h-20 font-mono"
                style={{ fontSize: "0.75rem" }}
              >
                {demoMode === 'chat' 
                  ? `${DEFAULT_SAMPLE_TEXT.substring(0, 150)}...` 
                  : `${rawDataExample.substring(0, 150)}...`}
              </div>
              {demoMode === 'chat' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                >
                  Read full conversation
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
              {demoMode === 'categorization' && (
                <div className="mt-2 text-xs text-gray-500">
                  Raw product reviews that need to be categorized and analyzed for sentiment
                </div>
              )}
            </div>

            {demoMode === 'categorization' && (
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium text-sm text-gray-700">Structured Output</div>
                  <div className="text-xs text-green-600">JSON taxonomy with sentiment analysis</div>
                </div>
                <div
                  className="text-xs text-gray-600 overflow-auto max-h-20 font-mono"
                  style={{ fontSize: "0.75rem" }}
                >
                  {categorizedOutput.substring(0, 200)}...
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  AI creates structured taxonomy with categories, sentiment scores, and summary statistics
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 justify-center text-gray-400 text-xs">
              <span className="border-t border-gray-200 w-16"></span>
              <span>
                {demoMode === 'chat' 
                  ? '5 user messages + 5 AI responses' 
                  : '8 review items → structured JSON output'}
              </span>
              <span className="border-t border-gray-200 w-16"></span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-blue-50 p-2 rounded text-xs">
                <div className="font-medium mb-1">
                  Input Tokens: {inputTokenCount} × {userMultiplier} ={" "}
                  {inputTokenCount * userMultiplier}
                </div>
                <div className="text-gray-600">
                  {demoMode === 'chat' 
                    ? 'User messages are typically charged at a lower rate'
                    : 'Raw data input is typically charged at a lower rate'}
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-xs">
                <div className="font-medium mb-1">
                  Output Tokens: {outputTokenCount} × {userMultiplier} ={" "}
                  {outputTokenCount * userMultiplier}
                </div>
                <div className="text-gray-600">
                  {demoMode === 'chat' 
                    ? 'AI responses are typically charged at a higher rate'
                    : 'Structured JSON output is typically charged at a higher rate'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default TextInputArea;
