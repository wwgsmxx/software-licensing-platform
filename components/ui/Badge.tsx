import React from "react";
import { clsx } from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline" | "indigo";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
  size = "sm",
  ...props
}) => {
  const base = "inline-flex items-center font-medium rounded transition-colors";
  
  const variants = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-50 text-amber-900 border border-amber-200",
    danger: "bg-rose-50 text-rose-800 border border-rose-200",
    info: "bg-sky-50 text-sky-800 border border-sky-200",
    indigo: "bg-blue-50 text-blue-900 border border-blue-200",
    outline: "border border-slate-300 bg-white text-slate-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5 font-medium",
  };

  return (
    <span className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
