import React from "react";

type Props = {
  size?: number;
  color?: string;
};

// Stylized Vita Bella leaf/sprig mark.
export const Logo: React.FC<Props> = ({ size = 28, color = "#1E291E" }) => {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" fill="none">
      {/* Stem */}
      <path
        d="M20 4 V42"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <path
        d="M20 18 C 10 14, 4 18, 4 26 C 12 26, 18 24, 20 18 Z"
        fill={color}
      />
      {/* Right leaf */}
      <path
        d="M20 26 C 30 22, 36 26, 36 34 C 28 34, 22 32, 20 26 Z"
        fill={color}
      />
    </svg>
  );
};
