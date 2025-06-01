import * as React from "react";

// Icono corona para destacados
const CrownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 17L2 7l6.5 5L12 4l3.5 8L22 7l-2 10H4z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      fill="currentColor"
    />
    <rect x="4" y="19" width="16" height="2" rx="1" fill="currentColor" />
  </svg>
);

export default CrownIcon; 