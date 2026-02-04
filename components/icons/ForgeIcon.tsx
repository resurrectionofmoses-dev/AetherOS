
import React from 'react';

export const ForgeIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M6 10H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M6 4v14" />
    <path d="M14 4v14" />
    <path d="M14 10h8v4h-8" />
    <path d="M18 10V8a2 2 0 0 0-2-2h-2" />
    <path d="M22 18H2" />
  </svg>
);


export const HammerIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      <path d="m15 12-8.373 8.373a2.828 2.828 0 1 1-4-4L11 8" />
      <path d="m18 5 4 4" />
      <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 20 8.172V7a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586L14.5 3.5" />
    </svg>
  );
