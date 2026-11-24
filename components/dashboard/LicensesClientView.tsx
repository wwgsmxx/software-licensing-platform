"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Award, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export interface LicenseRow {
  id: string;
  licenseKey: string;
  softwareName: string;
  version: string;
  licenseType: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
}

export function LicensesClientView({ licenses }: { licenses: LicenseRow[] }) {
  const { locale } = useLanguage();

  const TEXTS = {
    en: {
      title: "My Software Licenses",
      subtitle: "Official electronic software license certificates and online verification tokens.",
      licenseKey: "License Number",
      swProduct: "Software Name",
      type: "Category",
      status: "Status",
      expDate: "Expires On",
      action: "Action",
      viewCert: "View Certificate",
      searchPlaceholder: "Search licenses by number or software name...",
      emptyTitle: "No licenses issued yet",
      emptyDesc: "Once your applications are approved by reviewers, issued licenses will appear here.",
    },
    kk: {
      title: "Менің лицензияларым",
      subtitle: "Берілген ресми электрондық лицензиялар мен тексеру токендері.",
      licenseKey: "Лицензия нөмірі",
      swProduct: "БЖ атауы",
      type: "Санаты",
      status: "Мәртебесі",
      expDate: "Қолданылу мерзімі",
      action: "Әрекет",
      viewCert: "Сертификатты қарау",
      searchPlaceholder: "Лицензияларды нөмірі немесе атауы бойынша іздеу...",
      emptyTitle: "Берілген лицензиялар жоқ",
      emptyDesc: "Өтінімдеріңіз мақұлданған соң берілген лицензиялар осында көрсетіледі.",
    },
    ru: {
      title: "Мои лицензии",
      subtitle: "Реестр действующих электронных лицензий и сертификатов программного обеспечения.",
      licenseKey: "Номер лицензии",
      swProduct: "Наименование ПО",
      type: "Категория",
      status: "Статус лицензии",
      expDate: "Срок действия",
      action: "Действие",
      viewCert: "Сертификат",
      searchPlaceholder: "Поиск лицензий по номеру или названию ПО...",
      emptyTitle: "Выданные лицензии отсутствуют",
      emptyDesc: "После одобрения поданных заявлений выданные лицензии появятся в этом реестре.",
    },
  };

  const t = TEXTS[locale];

  const columns = [
    {
      header: t.licenseKey,
      cell: (row: LicenseRow) => (
        <span className="font-mono font-bold text-slate-900 text-xs">№ {row.licenseKey}</span>
      ),
    },
    {
      header: t.swProduct,
      cell: (row: LicenseRow) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.softwareName}</p>
          <p className="text-[11px] text-slate-500">v{row.version}</p>
        </div>
      ),
    },
    { header: t.type, accessorKey: "licenseType" as const },
    {
      header: t.status,
      cell: (row: LicenseRow) => <StatusBadge status={row.status} />,
    },
    { header: t.expDate, accessorKey: "expiresAt" as const },
    {
      header: t.action,
      cell: (row: LicenseRow) => (
        <Link href={`/dashboard/licenses/${row.id}`}>
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            {t.viewCert}
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
      </div>

      <DataTable
        data={licenses as any}
        columns={columns as any}
        searchPlaceholder={t.searchPlaceholder}
        pageSize={10}
        emptyTitle={t.emptyTitle}
        emptyDescription={t.emptyDesc}
      />
    </div>
  );
}
