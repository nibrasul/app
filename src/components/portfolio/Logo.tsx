import React from "react";

type LogoProps = React.SVGProps<SVGSVGElement>;

export default function Logo(props: LogoProps) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-current"
      {...props}
    >
      <rect width="40" height="40" rx="4" fill="currentColor" fillOpacity="0.05" />
      <path
        d="M10 28V12L20 20L30 12V28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M20 20V28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
