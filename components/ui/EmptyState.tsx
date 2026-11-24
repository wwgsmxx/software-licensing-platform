import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  description = "Get started by creating a new record.",
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 max-w-sm mx-auto">
      <div className="p-4 bg-muted/60 text-muted-foreground rounded-2xl">
        {icon || <FolderOpen className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
