
import React from 'react';

export const DoveIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M10.33 2.03 12 4h2l1.67-1.97" />
    <path d="M11 6.53c0-1.5.54-3 2-3s2 1.5 2 3" />
    <path d="M12.33 22H16a2 2 0 0 0 2-2v-1.33" />
    <path d="M18 14v-2.25c0-1-.5-2-1-2-1 0-2 1-2 2L12.5 14" />
    <path d="M8 18.67V16a2 2 0 0 0-2-2H4.33" />
    <path d="M6 10l-2.5 2c-1 1-1.5 2.24-1.5 3.5.01 2.25 2 4.5 4.5 4.5H8" />
  </svg>
);
