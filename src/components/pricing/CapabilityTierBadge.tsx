"use client";

import React from "react";

interface CapabilityTierBadgeProps {
  tier?: string;
  size?: "sm" | "md" | "lg";
}

const CapabilityTierBadge: React.FC<CapabilityTierBadgeProps> = ({
  tier,
  size = "sm",
}) => {
  if (!tier) return null;
  
  // Suppress the "Specialized" tier as it's too general
  if (tier.toLowerCase() === "specialized") return null;

  const getTierConfig = (tier: string) => {
    const tierLower = tier.toLowerCase();
    
    switch (tierLower) {
      case "frontier":
        return {
          label: "Frontier",
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          ),
        };
      case "production":
        return {
          label: "Production",
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      case "specialized":
        return {
          label: "Specialized",
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
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          ),
        };
      case "experimental":
        return {
          label: "Experimental",
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          ),
        };
      case "standard":
        return {
          label: "Standard",
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
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          ),
        };
      case "lightweight":
        return {
          label: "Lightweight",
          bgColor: "bg-cyan-100",
          textColor: "text-cyan-800",
          borderColor: "border-cyan-200",
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      default:
        return {
          label: tier.charAt(0).toUpperCase() + tier.slice(1),
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
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          ),
        };
    }
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

  const config = getTierConfig(tier);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses.container}`}
      title={`${config.label} tier model`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export default CapabilityTierBadge;