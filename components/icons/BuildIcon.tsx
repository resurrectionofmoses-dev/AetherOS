
import React from 'react';

export const BuildIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M22 12h-4" />
    <path d="M20 15v-6" />
    <path d="M14 15.5V13a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2.5" />
    <path d="M12 11V9" />
    <path d="M10 9H8" />
    <path d="M16 9h-2" />
    <path d="M10 19v-2.5" />
    <path d="M14 19v-2.5" />
    <path d="M2 12h4" />
    <path d="M4 15v-6" />
    <path d="M8 11V9" />
  </svg>
);