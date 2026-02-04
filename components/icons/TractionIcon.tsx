
import React from 'react';

export const TractionIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      <path d="M7 21a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4h10a4 4 0 0 0 4-4V3" />
      <path d="M17 11a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h10a4 4 0 0 1 4 4v2" />
  </svg>
);