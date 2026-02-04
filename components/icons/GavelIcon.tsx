import React from 'react';

// Added GavelIcon definition
export const GavelIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 13l-4 4L2 14V6l8-8 4 4" /><path d="m22 22-8-8" /><path d="M14 13H4" />
    </svg>
);