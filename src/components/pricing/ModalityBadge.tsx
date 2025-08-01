"use client";

import React from "react";

interface ModalityBadgeProps {
  modality?: string;
  size?: "sm" | "md" | "lg";
}

const ModalityBadge: React.FC<ModalityBadgeProps> = ({
  modality,
  size = "sm",
}) => {
  if (!modality) return null;

  const getModalityConfig = (modality: string) => {
    const modalityLower = modality.toLowerCase();
    
    // Handle different modality formats from the API
    if (modalityLower.includes("multimodal") || modalityLower.includes("multi-modal")) {
      return {
        label: "Multimodal",
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
        borderColor: "border-purple-200",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${getSizeClasses(size).icon} mr-1`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
      };
    }
    
    if (modalityLower.includes("text") || modalityLower.includes("language")) {
      return {
        label: "Text",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        borderColor: "border-blue-200",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${getSizeClasses(size).icon} mr-1`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
      };
    }
    
    if (modalityLower.includes("vision") || modalityLower.includes("image")) {
      return {
        label: "Vision",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-200",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${getSizeClasses(size).icon} mr-1`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        ),
      };
    }
    
    if (modalityLower.includes("audio") || modalityLower.includes("speech")) {
      return {
        label: "Audio",
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
        borderColor: "border-orange-200",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${getSizeClasses(size).icon} mr-1`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        ),
      };
    }
    
    if (modalityLower.includes("code") || modalityLower.includes("programming")) {
      return {
        label: "Code",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        borderColor: "border-gray-200",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${getSizeClasses(size).icon} mr-1`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        ),
      };
    }
    
    // Default for any other modality
    return {
      label: modality.charAt(0).toUpperCase() + modality.slice(1),
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      borderColor: "border-gray-200",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${getSizeClasses(size).icon} mr-1`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    };
  };

  const getSizeClasses = (size: "sm" | "md" | "lg") => {
    switch (size) {
      case "sm":
        return {
          container: "px-1.5 py-0.5 text-xs",
          icon: "h-3 w-3",
        };
      case "md":
        return {
          container: "px-2 py-1 text-sm",
          icon: "h-4 w-4",
        };
      case "lg":
        return {
          container: "px-3 py-1.5 text-sm",
          icon: "h-5 w-5",
        };
      default:
        return {
          container: "px-1.5 py-0.5 text-xs",
          icon: "h-3 w-3",
        };
    }
  };

  const config = getModalityConfig(modality);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses.container}`}
      title={`${config.label} model`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export default ModalityBadge;