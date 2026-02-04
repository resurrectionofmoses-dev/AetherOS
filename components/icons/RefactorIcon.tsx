
import React from 'react';

export const RefactorIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l-3 2.7" />
    <path d="m12 12-2-2" />
    <path d="m10 10 2 2" />
    <path d="m14 14-2-2" />
    <path d="m12 12 2 2" />
  </svg>
);