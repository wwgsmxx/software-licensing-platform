"use client";

import React from "react";
import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export function UserNotificationsClientView({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const { t, locale } = useLanguage();
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "kk" ? "kk-KZ" : "en-US";

  return (
    <div className="max-w-4xl mx-auto space-y-5 text-slate-800">
      <div className="p-5 rounded border border-slate-200 bg-white shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("notifPageTitle")}</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {t("notifPageSubtitle")}
        </p>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded border flex items-start gap-3.5 transition-colors ${
                !n.read
                  ? "bg-blue-50/50 border-blue-200"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="p-2 bg-slate-100 text-indigo-600 rounded shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{n.title}</h4>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.createdAt).toLocaleString(dateLocale, { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                {n.link && (
                  <Link
                    href={n.link}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline pt-1"
                  >
                    {t("notifOpen")} <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded">
            {t("notifEmpty")}
          </div>
        )}
      </div>
    </div>
  );
}
