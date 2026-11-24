"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  showTagline = true,
  size = "md",
  href = "/",
}) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-base font-bold",
    md: "text-lg font-extrabold",
    lg: "text-2xl font-black",
  };

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Modern Cryptographic Geometric Icon */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 p-[1.5px] shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0`}
      >
        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center p-1.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-indigo-600"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Geometric F & cryptographic key/shield facet */}
            <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" fill="none" className="stroke-indigo-600" />
            <path d="M9 9h6" stroke="currentColor" strokeWidth="2.2" />
            <path d="M9 13h4" stroke="currentColor" strokeWidth="2.2" />
            <path d="M9 9v7" stroke="currentColor" strokeWidth="2.2" />
          </svg>
        </div>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`${textSizes[size]} text-slate-900 tracking-tight font-sans`}>
            Fle<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-600">X</span>ora
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
            SaaS
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5 hidden sm:inline-block">
            License & Signature Cloud
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-flex items-center">{content}</Link>;
  }

  return content;
};
