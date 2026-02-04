
import React from 'react';

export const PinIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M12 17v5" />
    <path d="M12 3v5" />
    <path d="M18.36 6.64 12 13l-6.36-6.36a9 9 0 1 1 12.72 0Z" />
  </svg>
);
