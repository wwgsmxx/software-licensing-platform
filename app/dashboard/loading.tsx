import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150 p-2">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
