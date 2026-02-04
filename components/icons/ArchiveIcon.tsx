
import React from 'react';

export const ArchiveIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <rect x="2" y="4" width="20" height="5" rx="1" />
    <rect x="2" y="11" width="20" height="5" rx="1" />
    <rect x="2" y="18" width="20" height="5" rx="1" />
    <line x1="6" x2="6.01" y1="7" y2="7" />
    <line x1="6" x2="6.01" y1="14" y2="14" />
    <line x1="6" x2="6.01" y1="21" y2="21" />
  </svg>
);
