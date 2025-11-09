
import React from 'react';

export const SwimIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="5" r="1" />
    <path d="m9 11 1-2" />
    <path d="m14 10 1 2" />
    <path d="M10 21a2.3 2.3 0 0 0 3.9 0" />
    <path d="M12 14v-4" />
    <path d="M5 14a4 4 0 0 0 4 3c2 0 3-1 3-3" />
    <path d="M19 14a4 4 0 0 1-4 3c-2 0-3-1-3-3" />
  </svg>
);
