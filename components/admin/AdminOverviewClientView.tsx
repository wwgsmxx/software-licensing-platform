"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Layers,
  ArrowRight,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useLanguage } from "@/lib/LanguageContext";

export interface AdminOverviewProps {
  metrics: {
    totalUsers: number;
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    activeLicenses: number;
  };
  reviewQueue: Array<{
    id: string;
    applicantName: string;
    softwareName: string;
    status: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    userEmail: string | null;
    details: string | null;
    entity: string;
    createdAt: string;
  }>;
}

export function AdminOverviewClientView({
  metrics,
  reviewQueue,
  recentActivity,
}: AdminOverviewProps) {
  const { locale } = useLanguage();

  const TEXTS = {
    en: {
      title: "Government Portal Administration",
      subtitle: "Official metrics, review queues, user accounts, and immutable security audit stream.",
      openQueue: "Open Review Queue",
      totalUsers: "Total Users",
      applications: "Total Applications",
      pendingAudit: "Pending Review",
      approved: "Approved",
      rejected: "Rejected",
      activeLicenses: "Active Licenses",
      priorityQueue: "Applications Awaiting Review",
      viewAllQueue: "View Complete Register",
      appId: "Application Number",
      applicant: "Applicant",
      swProduct: "Software Name",
      status: "Status",
      action: "Action",
      review: "Inspect",
      emptyQueue: "All submitted applications have been audited. No pending items.",
      securityStream: "System Security & Action Stream",
      fullAuditLog: "Full System Audit Log →",
    },
    kk: {
      title: "Мемлекеттік портал әкімшілігі",
      subtitle: "Ресми статистика, өтінімдер кезегі, пайдаланушылар тізілімі және қауіпсіздік журналы.",
      openQueue: "Тексеру кезегін ашу",
      totalUsers: "Пайдаланушылар",
      applications: "Барлық өтінімдер",
      pendingAudit: "Қарауда",
      approved: "Мақұлданған",
      rejected: "Қабылданбаған",
      activeLicenses: "Белсенді лицензиялар",
      priorityQueue: "Тексеруді күтіп тұрған өтінімдер",
      viewAllQueue: "Толық тізілімді ашу",
      appId: "Өтінім нөмірі",
      applicant: "Өтініш беруші",
      swProduct: "БЖ атауы",
      status: "Мәртебесі",
      action: "Әрекет",
      review: "Қарау",
      emptyQueue: "Қарауды күтіп тұрған өтінімдер жоқ. Барлығы өңделді.",
      securityStream: "Жүйелік қауіпсіздік ағыны",
      fullAuditLog: "Толық аудит журналы →",
    },
    ru: {
      title: "Панель управления государственного портала",
      subtitle: "Сводные государственные показатели, очередь рассмотрения заявлений и журнал аудита.",
      openQueue: "Открыть очередь заявлений",
      totalUsers: "Пользователей",
      applications: "Всего заявлений",
      pendingAudit: "На рассмотрении",
      approved: "Одобрено",
      rejected: "Отклонено",
      activeLicenses: "Выдано лицензий",
      priorityQueue: "Заявления, ожидающие рассмотрения",
      viewAllQueue: "Перейти ко всем заявлениям",
      appId: "Номер заявления",
      applicant: "Заявитель",
      swProduct: "Наименование ПО",
      status: "Статус",
      action: "Действие",
      review: "Рассмотреть",
      emptyQueue: "Очередь пуста: все поступившие заявления рассмотрены.",
      securityStream: "Журнал действий и безопасности",
      fullAuditLog: "Полный журнал действий →",
    },
  };

  const t = TEXTS[locale];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded border border-slate-200 bg-white shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>

        <Link href="/admin/applications" prefetch={false}>
          <Button variant="primary" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
            {t.openQueue} ({metrics.pendingApplications})
          </Button>
        </Link>
      </div>

      {/* Global State KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded border border-slate-200 bg-white space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{t.totalUsers}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{metrics.totalUsers}</h3>
        </div>

        <div className="p-4 rounded border border-slate-200 bg-white space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{t.applications}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-indigo-600">{metrics.totalApplications}</h3>
        </div>

        <div className="p-4 rounded border border-amber-200 bg-amber-50/50 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-amber-900 tracking-wider">{t.pendingAudit}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-amber-800">{metrics.pendingApplications}</h3>
        </div>

        <div className="p-4 rounded border border-emerald-200 bg-emerald-50/50 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-emerald-900 tracking-wider">{t.approved}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-emerald-800">{metrics.approvedApplications}</h3>
        </div>

        <div className="p-4 rounded border border-rose-200 bg-rose-50/50 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-rose-900 tracking-wider">{t.rejected}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-rose-800">{metrics.rejectedApplications}</h3>
        </div>

        <div className="p-4 rounded border border-slate-200 bg-white space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{t.activeLicenses}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-emerald-700">{metrics.activeLicenses}</h3>
        </div>
      </div>

      {/* Main Grid: Review Queue + Security Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Priority Review Queue */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">{t.priorityQueue}</h2>
            <Link
              href="/admin/applications"
              prefetch={false}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              {t.viewAllQueue} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded border border-slate-200 bg-white overflow-hidden shadow-sm">
            {reviewQueue.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="px-4 py-3">{t.appId}</th>
                      <th className="px-4 py-3">{t.applicant}</th>
                      <th className="px-4 py-3">{t.swProduct}</th>
                      <th className="px-4 py-3">{t.status}</th>
                      <th className="px-4 py-3 text-right">{t.action}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {reviewQueue.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{app.id}</td>
                        <td className="px-4 py-3 font-medium">{app.applicantName}</td>
                        <td className="px-4 py-3">{app.softwareName}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/admin/applications/${app.id}`} prefetch={false}>
                            <Button variant="primary" size="sm">
                              {t.review}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">{t.emptyQueue}</div>
            )}
          </div>
        </div>

        {/* Security Stream */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" /> {t.securityStream}
          </h2>

          <div className="p-4 rounded border border-slate-200 bg-white space-y-3 shadow-sm">
            {recentActivity.map((act) => (
              <div key={act.id} className="text-xs space-y-0.5 pb-2.5 border-b border-slate-100 last:border-0">
                <p className="font-semibold text-slate-900">{act.action}</p>
                <p className="text-slate-600 text-[11px] truncate">
                  {act.userEmail || "System"} • {act.details || act.entity}
                </p>
                <span className="text-[10px] text-slate-400">
                  {new Date(act.createdAt).toLocaleString()}
                </span>
              </div>
            ))}

            <Link
              href="/admin/activity"
              prefetch={false}
              className="block text-center text-xs text-indigo-600 font-semibold hover:underline pt-1"
            >
              {t.fullAuditLog}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
