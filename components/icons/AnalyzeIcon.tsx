import React from 'react';

export const AnalyzeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 14l-4 4" />
    <path d="M10 10l4 4" />
    <circle cx="17" cy="7" r="3" />
    <path d="M12 21a9 9 0 0 0-9-9" />
  </svg>
);
