import React from 'react';

export const BatteryIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <rect width="18" height="12" x="3" y="6" rx="2" />
    <line x1="21" x2="21" y1="10" y2="14" />
    <line x1="7" x2="7" y1="10" y2="14" />
    <line x1="12" x2="12" y1="10" y2="14" />
    <line x1="17" x2="17" y1="10" y2="14" />
  </svg>
);
