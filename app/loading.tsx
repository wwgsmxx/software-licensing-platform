import React from "react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-150">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-xs font-semibold text-muted-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}
