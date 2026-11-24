"use client";

import React, { useState } from "react";
import { Info, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  if (dismissed) return null;

  return (
    <div className="bg-indigo-50/70 border-b border-indigo-100 px-4 py-2 text-xs text-indigo-950 flex items-center justify-between z-40 relative print:hidden">
      <div className="flex items-center gap-2 max-w-7xl mx-auto text-center sm:text-left">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 hidden sm:inline" />
        <span className="font-medium">{t("educationalNotice")}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded text-indigo-500 hover:text-indigo-950 hover:bg-indigo-100 shrink-0 ml-2"
        aria-label="Close notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
