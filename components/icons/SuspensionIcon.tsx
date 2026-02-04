
import React from 'react';

export const SuspensionIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      <path d="M3 8v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8"/>
      <path d="M5 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/>
      <path d="M3 13v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3"/>
      <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/>
  </svg>
);