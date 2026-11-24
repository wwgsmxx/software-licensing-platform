import React from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-xs transition-all duration-150",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200",
      outline:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
      ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
      success:
        "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-sm sm:text-base gap-2.5 font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
