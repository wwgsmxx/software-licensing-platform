import React from "react";
import { clsx } from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={clsx(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-muted-foreground">{rightIcon}</div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
