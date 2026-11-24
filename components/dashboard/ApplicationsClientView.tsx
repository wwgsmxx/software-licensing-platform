"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, ArrowRight, ShieldCheck, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export interface ApplicationRow {
  id: string;
  softwareName: string;
  licenseType: string;
  numUsers: number;
  status: string;
  signedAt: string;
  createdAt: string;
}

export function ApplicationsClientView({ applications }: { applications: ApplicationRow[] }) {
  const { locale } = useLanguage();

  const TEXTS = {
    en: {
      title: "My License Applications",
      subtitle: "Official register of your software licensing applications and review statuses.",
      newBtn: "Submit New Application",
      appId: "Application Number",
      swProduct: "Software Name",
      licType: "License Category",
      status: "Current Status",
      sigStatus: "Digital Signature",
      sigConfirmed: "Signed with Digital Signature",
      sigPending: "Pending Signature",
      action: "Action",
      details: "Inspect",
      searchPlaceholder: "Search applications by number, software name, or status...",
      emptyTitle: "No applications registered",
      emptyDesc: "You have not submitted any licensing applications yet.",
    },
    kk: {
      title: "Менің өтінімдерім",
      subtitle: "Бағдарламалық жасақтаманы лицензиялау өтінімдерінің ресми тізілімі.",
      newBtn: "Жаңа өтінім беру",
      appId: "Өтінім нөмірі",
      swProduct: "БЖ атауы",
      licType: "Лицензия санаты",
      status: "Ағымдағы мәртебе",
      sigStatus: "Сандық қолтаңба",
      sigConfirmed: "ЭЦП-мен расталған",
      sigPending: "Қол қойылмаған",
      action: "Әрекет",
      details: "Қарау",
      searchPlaceholder: "Өтінімді нөмірі, атауы немесе мәртебесі бойынша іздеу...",
      emptyTitle: "Өтінімдер табылмады",
      emptyDesc: "Сіз әлі ешқандай өтінім берген жоқсыз.",
    },
    ru: {
      title: "Мои заявления",
      subtitle: "Реестр поданных заявлений на лицензирование программного обеспечения.",
      newBtn: "Подать заявление",
      appId: "Номер заявления",
      swProduct: "Наименование ПО",
      licType: "Категория лицензии",
      status: "Статус рассмотрения",
      sigStatus: "Электронная подпись",
      sigConfirmed: "Подписано ЭЦП",
      sigPending: "Ожидает подписи",
      action: "Действие",
      details: "Просмотреть",
      searchPlaceholder: "Поиск заявления по номеру, названию ПО или статусу...",
      emptyTitle: "Заявления не найдены",
      emptyDesc: "Вы ещё не подавали заявлений на получение лицензии.",
    },
  };

  const t = TEXTS[locale];

  const columns = [
    {
      header: t.appId,
      cell: (row: ApplicationRow) => (
        <span className="font-mono font-bold text-slate-900 text-xs">{row.id}</span>
      ),
    },
    {
      header: t.swProduct,
      accessorKey: "softwareName" as const,
    },
    {
      header: t.licType,
      accessorKey: "licenseType" as const,
    },
    {
      header: t.status,
      cell: (row: ApplicationRow) => <StatusBadge status={row.status} />,
    },
    {
      header: t.sigStatus,
      cell: (row: ApplicationRow) => (
        row.signedAt && row.signedAt !== "Unsigned" ? (
          <span className="inline-flex items-center gap-1 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {t.sigConfirmed}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">
            {t.sigPending}
          </span>
        )
      ),
    },
    {
      header: t.action,
      cell: (row: ApplicationRow) => (
        <Link href={`/dashboard/applications/${row.id}`}>
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            {t.details}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5 text-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded border border-slate-200 bg-white shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>

        <Link href="/dashboard/applications/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            {t.newBtn}
          </Button>
        </Link>
      </div>

      <DataTable
        data={applications as any}
        columns={columns as any}
        searchPlaceholder={t.searchPlaceholder}
        pageSize={10}
        emptyTitle={t.emptyTitle}
        emptyDescription={t.emptyDesc}
      />
    </div>
  );
}
