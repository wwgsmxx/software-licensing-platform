"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 ${
              t.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
                : t.type === "error"
                ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
                : "bg-indigo-950/90 border-indigo-500/40 text-indigo-200"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs space-y-0.5">
              <p className="font-semibold">{t.title}</p>
              {t.message && <p className="opacity-90">{t.message}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
};
