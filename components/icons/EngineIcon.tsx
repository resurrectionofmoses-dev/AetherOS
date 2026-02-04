import React from 'react';

export const EngineIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M12 20V10" />
    <path d="M12 10V4.5A2.5 2.5 0 0 1 14.5 2h0A2.5 2.5 0 0 1 17 4.5V10" />
    <path d="M12 10V4.5A2.5 2.5 0 0 0 9.5 2h0A2.5 2.5 0 0 0 7 4.5V10" />
    <path d="M12 10H7c-1.1 0-2 .9-2 2v2a2 2 0 0 0 2 2h1" />
    <path d="M12 10h5c1.1 0 2 .9 2 2v2a2 2 0 0 1-2 2h-1" />
  </svg>
);
