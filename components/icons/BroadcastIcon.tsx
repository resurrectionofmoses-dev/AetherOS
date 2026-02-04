
import React from 'react';

export const BroadcastIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M6.34 15.66a9 9 0 1 0 11.32-11.32" />
    <path d="M10.59 11.41a5 5 0 1 0 2.82-2.82" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);
