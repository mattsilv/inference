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

  // This effect runs once on mount to set up initial token counts
  useEffect(() => {
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
  }, []);

  // This effect runs whenever the multiplier changes to update the pricing table
  useEffect(() => {
    // For pricing calculation, we use the entire conversation with a multiplier for token counts
    // Instead of repeating the full text, we'll pass the original text and handle the multiplication in the formatters
    // This avoids performance issues with very large strings when userMultiplier is high
    try {
      const maxSafeMultiplier = 1000; // Cap the multiplier to prevent browser crashes
      const safeMultiplier = Math.min(userMultiplier, maxSafeMultiplier);

      // Add a special metadata prefix that our formatters will detect
      const userMessagesWithMultiplier = `[TOKEN_MULTIPLIER:${safeMultiplier}]${totalUserMessages}`;
      const aiResponsesWithMultiplier = `[TOKEN_MULTIPLIER:${safeMultiplier}]${totalAIResponses}`;

      onTextUpdate(userMessagesWithMultiplier, aiResponsesWithMultiplier);
    } catch (err) {
      console.error("Error updating text with multiplier:", err);
      // Fallback to single instance if there's an error
      onTextUpdate(totalUserMessages, totalAIResponses);
    }
  }, [onTextUpdate, totalUserMessages, totalAIResponses, userMultiplier]);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow p-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium flex items-center gap-2">
              Example: AI Assistant Chat (10 msg thread)
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
                aria-label="Number of users"
              />
              <span className="text-xs text-gray-500">(users)</span>
            </h3>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Total tokens:{" "}
              <span className="font-medium">
                {totalTokens * userMultiplier}
              </span>
              {userMultiplier > 1000 && (
                <span className="text-yellow-600 ml-1">
                  (capped at 1000 users for calculation)
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium text-sm text-gray-700">
                  Sample Conversation
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
                {DEFAULT_SAMPLE_TEXT.substring(0, 150)}...
              </div>
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
            </div>

            <div className="flex items-center gap-2 justify-center text-gray-400 text-xs">
              <span className="border-t border-gray-200 w-16"></span>
              <span>5 user messages + 5 AI responses</span>
              <span className="border-t border-gray-200 w-16"></span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-blue-50 p-2 rounded text-xs">
                <div className="font-medium mb-1">
                  Input Tokens: {inputTokenCount} × {userMultiplier} ={" "}
                  {inputTokenCount * userMultiplier}
                </div>
                <div className="text-gray-600">
                  User messages are typically charged at a lower rate
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-xs">
                <div className="font-medium mb-1">
                  Output Tokens: {outputTokenCount} × {userMultiplier} ={" "}
                  {outputTokenCount * userMultiplier}
                </div>
                <div className="text-gray-600">
                  AI responses are typically charged at a higher rate
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
