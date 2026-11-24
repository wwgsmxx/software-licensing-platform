"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Search,
  Box,
  Key,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useLanguage } from "@/lib/LanguageContext";

export interface DashboardOverviewProps {
  session: {
    name: string;
    roleName: string;
  };
  metrics: {
    totalLicenses: number;
    activeLicenses: number;
    expiringLicenses: number;
    totalApps: number;
    pendingApps: number;
    requireActionCount?: number;
    totalSoftware: number;
  };
  recentLicenses: Array<{
    id: string;
    softwareName: string;
    licenseKey: string;
    licenseType: string;
    status: string;
    expiresAt: string;
  }>;
  recentApplications: Array<{
    id: string;
    softwareName: string;
    licenseType: string;
    status: string;
    createdAt?: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    details: string | null;
    entity: string;
    createdAt: string;
  }>;
}

export function DashboardOverviewClientView({
  session,
  metrics,
  recentLicenses,
  recentApplications,
  recentActivity,
}: DashboardOverviewProps) {
  const { t, locale } = useLanguage();
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "kk" ? "kk-KZ" : "en-US";
  const requireAction = metrics.requireActionCount ?? 0;

  // Calculate health ratio
  const activePercent =
    metrics.totalLicenses > 0
      ? Math.round((metrics.activeLicenses / metrics.totalLicenses) * 100)
      : 100;

  return (
    <div className="space-y-6 text-slate-800">

      {/* ── 1. Top SaaS Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t("citizenCabinetTitle")}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
              {session.roleName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            {t("welcomeBack")}, <strong className="text-slate-800 font-semibold">{session.name}</strong>. {t("citizenCabinetSubtitle")}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Link href="/dashboard/applications/new">
            <Button
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              {t("applyForLicense")}
            </Button>
          </Link>
          <Link href="/dashboard/software">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              leftIcon={<Box className="w-4 h-4 text-indigo-600" />}
            >
              {t("navSoftware")}
            </Button>
          </Link>
          <Link href="/verify-license">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              leftIcon={<Search className="w-4 h-4 text-slate-500" />}
            >
              {t("heroVerify")}
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. Action Required Alert Banner ── */}
      {requireAction > 0 && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-amber-900">{t("whatNeedsActionTitle")}</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                {t("whatNeedsActionDesc")} ({requireAction})
              </p>
            </div>
          </div>
          <Link href="/dashboard/applications" className="shrink-0">
            <Button variant="outline" size="sm" className="border-amber-300 bg-white hover:bg-amber-100/50 text-amber-900">
              {t("goToApplications")}
            </Button>
          </Link>
        </div>
      )}

      {/* ── 3. Real KPI Cards (Linear / Stripe Style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Licenses */}
        <div className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-2 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              {locale === "ru" ? "Всего лицензий" : locale === "kk" ? "Барлық лицензиялар" : "Total Licenses"}
            </span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalLicenses}</h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {metrics.totalSoftware} {locale === "ru" ? "продуктов" : "products"}
            </span>
          </div>
        </div>

        {/* Active Licenses */}
        <div className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-2 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              {t("activeLicenses")}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600">{metrics.activeLicenses}</h3>
            <span className="text-[11px] text-emerald-700 font-semibold px-1.5 py-0.5 rounded bg-emerald-50">
              {activePercent}% ratio
            </span>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-2 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              {locale === "ru" ? "Истекают скоро (30д)" : locale === "kk" ? "Жақында аяқталады" : "Expiring Soon"}
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600">{metrics.expiringLicenses}</h3>
            <span className="text-[11px] text-slate-400 font-medium">30 days alert</span>
          </div>
        </div>

        {/* Pending Audit / In Review */}
        <div className="p-5 rounded-xl border border-slate-200/90 bg-white space-y-2 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              {t("pendingAudit")}
            </span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-blue-600">{metrics.pendingApps}</h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {metrics.totalApps} {locale === "ru" ? "всего заявок" : "total apps"}
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. Main Tables: Active Licenses & Recent Applications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Active Licenses Table (Primary SaaS Entity) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>{locale === "ru" ? "Действующие лицензии" : locale === "kk" ? "Қолданыстағы лицензиялар" : "Active Licenses"}</span>
            </h2>
            <Link
              href="/dashboard/licenses"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              {t("viewAll")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
            {recentLicenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Certificate ID</th>
                      <th className="px-4 py-3">{t("softwareProduct")}</th>
                      <th className="px-4 py-3">License Key</th>
                      <th className="px-4 py-3">{t("status")}</th>
                      <th className="px-4 py-3 text-right">Expiration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {recentLicenses.map((lic) => (
                      <tr key={lic.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{lic.id}</td>
                        <td className="px-4 py-3 text-slate-700">{lic.softwareName}</td>
                        <td className="px-4 py-3 font-mono text-slate-500 text-[11px] select-all">{lic.licenseKey}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={lic.status} />
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 font-mono text-[11px]">
                          {new Date(lic.expiresAt).toLocaleDateString(dateLocale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 space-y-3">
                <p>{locale === "ru" ? "У вас пока нет выпущенных лицензий." : "No issued software licenses yet."}</p>
                <Link href="/dashboard/applications/new">
                  <Button variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {t("createFirstApp")}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Secondary: Recent Applications */}
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{t("recentApplications")}</h2>
              <Link
                href="/dashboard/applications"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                {t("viewAll")} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
              {recentApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-3">{t("applicationId")}</th>
                        <th className="px-4 py-3">{t("softwareProduct")}</th>
                        <th className="px-4 py-3">{t("applicationDate")}</th>
                        <th className="px-4 py-3">{t("status")}</th>
                        <th className="px-4 py-3 text-right">{t("action")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {recentApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">{app.id}</td>
                          <td className="px-4 py-3 text-slate-700">{app.softwareName}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString(dateLocale) : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/dashboard/applications/${app.id}`}>
                              <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-100">
                                {t("view")}
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  <p>{t("noApplicationsYet")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Security Activity & Verification Status */}
        <div className="space-y-4">
          {/* Cryptographic Security Box */}
          <div className="p-5 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-teal-50/30 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t("securityStatusTitle")}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("securityStatusDesc")}
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-indigo-100/60">
              <span>Engine Status:</span>
              <span className="font-semibold text-emerald-600">Operational (100%)</span>
            </div>
          </div>

          {/* Activity Stream */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>{t("recentActivityTitle")}</span>
            </h2>

            <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-3 shadow-xs">
              {recentActivity.length > 0 ? (
                <div className="space-y-2.5">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="text-xs space-y-0.5 pb-2.5 border-b border-slate-100 last:border-0">
                      <p className="font-semibold text-slate-900">{act.action}</p>
                      <p className="text-slate-600 text-[11px] truncate">{act.details || act.entity}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(act.createdAt).toLocaleString(dateLocale, { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">{t("noRecentActivity")}</p>
              )}

              <Link
                href="/dashboard/activity"
                className="block text-center text-xs text-indigo-600 font-semibold hover:text-indigo-700 pt-1 transition-colors"
              >
                {t("viewAuditLog")}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
