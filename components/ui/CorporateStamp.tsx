"use client";

import React from "react";

interface CorporateStampProps {
  className?: string;
  size?: number; // width/height in px
  tilt?: number; // rotation in degrees, e.g. -6
}

export const CorporateStamp: React.FC<CorporateStampProps> = ({
  className = "",
  size = 140,
  tilt = -6,
}) => {
  const inkColor = "#15297c"; // Authentic stamp ink deep blue from sample photo

  return (
    <div
      className={`inline-block select-none pointer-events-none transition-transform ${className}`}
      style={{
        transform: `rotate(${tilt}deg)`,
        filter: "drop-shadow(0 1px 1px rgba(21, 41, 124, 0.15))",
      }}
    >
      <svg
        viewBox="0 0 260 260"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: inkColor }}
      >
        <defs>
          {/* Outer circle arc paths */}
          {/* Top outer arc (left to right clockwise) */}
          <path
            id="stampOuterTop"
            d="M 20,130 A 110,110 0 1,1 240,130"
            fill="none"
          />
          {/* Bottom outer arc (right to left clockwise around bottom) */}
          <path
            id="stampOuterBottom"
            d="M 240,130 A 110,110 0 0,1 20,130"
            fill="none"
          />

          {/* Inner circle arc paths */}
          {/* Top inner arc */}
          <path
            id="stampInnerTop"
            d="M 44,130 A 86,86 0 1,1 216,130"
            fill="none"
          />
          {/* Bottom inner arc */}
          <path
            id="stampInnerBottom"
            d="M 216,130 A 86,86 0 0,1 44,130"
            fill="none"
          />
        </defs>

        {/* 1. Outer Borders */}
        <circle cx="130" cy="130" r="122" fill="none" stroke={inkColor} strokeWidth="3.2" />
        <circle cx="130" cy="130" r="115" fill="none" stroke={inkColor} strokeWidth="1.2" />

        {/* 2. Outer Ring Text */}
        <text
          fill={inkColor}
          fontSize="9.2"
          fontWeight="bold"
          letterSpacing="0.14em"
          fontFamily="Arial, sans-serif"
        >
          <textPath href="#stampOuterTop" startOffset="50%" textAnchor="middle">
            ИННОВАЦИОННЫЕ ТЕХНОЛОГИИ • РАЗРАБОТКА И ВНЕДРЕНИЕ
          </textPath>
        </text>

        <text
          fill={inkColor}
          fontSize="9"
          fontWeight="bold"
          letterSpacing="0.12em"
          fontFamily="Arial, sans-serif"
        >
          <textPath href="#stampOuterBottom" startOffset="50%" textAnchor="middle">
            ★ 2026 ★ № 08-11/26 ★ ТЕХНОЛОГИЧЕСКИЙ ПРОЕКТ
          </textPath>
        </text>

        {/* 3. Middle Borders */}
        <circle cx="130" cy="130" r="97" fill="none" stroke={inkColor} strokeWidth="1.8" />
        <circle
          cx="130"
          cy="130"
          r="93"
          fill="none"
          stroke={inkColor}
          strokeWidth="0.8"
          strokeDasharray="2,2"
        />

        {/* 4. Inner Ring Text */}
        <text
          fill={inkColor}
          fontSize="10"
          fontWeight="900"
          letterSpacing="0.16em"
          fontFamily="Arial, sans-serif"
        >
          <textPath href="#stampInnerTop" startOffset="50%" textAnchor="middle">
            ★ ПРОЕКТ УТВЕРЖДЕН ★
          </textPath>
        </text>

        <text
          fill={inkColor}
          fontSize="9.5"
          fontWeight="900"
          letterSpacing="0.14em"
          fontFamily="Arial, sans-serif"
        >
          <textPath href="#stampInnerBottom" startOffset="50%" textAnchor="middle">
            ★ APPROVED PROJECT ★
          </textPath>
        </text>

        {/* 5. Center Circle Border */}
        <circle cx="130" cy="130" r="70" fill="none" stroke={inkColor} strokeWidth="1.2" />

        {/* 6. Center Emblem (Flexora F Monogram + Brand Name) */}
        <g transform="translate(130, 114) scale(0.9)">
          {/* Stylized Ribbon F */}
          <path
            d="M-12 -22 C-5 -24 10 -22 18 -15 C24 -9 20 -3 10 -1 C2 0 -6 1 -10 5 C-14 9 -15 15 -14 20 C-11 20 -6 15 2 11 C8 8 13 8 14 12 C14 15 8 19 -1 21 C-10 23 -19 18 -21 10 C-23 2 -18 -8 -13 -13 C-10 -16 -11 -20 -12 -22 Z"
            fill={inkColor}
          />
          <path
            d="M-9 -10 C-2 -12 8 -10 13 -6 C16 -3 14 0 7 2 C0 3 -7 5 -8 8 C-7 6 -6 4 -6 2 C-6 -2 -8 -6 -9 -10 Z"
            fill={inkColor}
            opacity="0.8"
          />
        </g>

        {/* Center Typography "FLEXORA" */}
        <text
          x="130"
          y="152"
          textAnchor="middle"
          fill={inkColor}
          fontSize="15"
          fontWeight="900"
          letterSpacing="0.18em"
          fontFamily="Arial, sans-serif"
        >
          FLEXORA
        </text>

        {/* Small subtitle under FLEXORA */}
        <text
          x="130"
          y="163"
          textAnchor="middle"
          fill={inkColor}
          fontSize="6.5"
          fontWeight="bold"
          letterSpacing="0.1em"
          fontFamily="Arial, sans-serif"
        >
          DIGITAL LICENSE SEAL
        </text>
      </svg>
    </div>
  );
};

