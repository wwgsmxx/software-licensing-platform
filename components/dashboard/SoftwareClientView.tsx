"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, Box } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export interface SoftwareRow {
  id: string;
  name: string;
  version: string;
  developer: string;
  softwareType: string;
  platform: string;
  applicationsCount: number;
  licensesCount: number;
  createdAt: string;
}

export function SoftwareClientView({ softwareList }: { softwareList: SoftwareRow[] }) {
  const { locale } = useLanguage();

  const TEXTS = {
    en: {
      title: "My Software Catalog",
      subtitle: "Software products registered under your account for licensing.",
      btn: "New Application",
      colName: "Software Name",
      colVersion: "Version",
      colType: "Type",
      colPlatform: "Platform",
      colApps: "Applications",
      colLicenses: "Issued Licenses",
      searchPlaceholder: "Search registered software...",
      emptyTitle: "No software registered",
      emptyDesc: "Register your first software product by creating a license application.",
    },
    kk: {
      title: "Менің бағдарламалық өнімдерім",
      subtitle: "Лицензиялау үшін тіркелген бағдарламалық жасақтама тізілімі.",
      btn: "Жаңа өтінім",
      colName: "БЖ атауы",
      colVersion: "Нұсқасы",
      colType: "Түрі",
      colPlatform: "Платформа",
      colApps: "Өтінімдер",
      colLicenses: "Берілген лицензиялар",
      searchPlaceholder: "Бағдарламаларды іздеу...",
      emptyTitle: "Тіркелген БЖ табылмады",
      emptyDesc: "Лицензияға өтінім беру арқылы БЖ өнімін тіркеңіз.",
    },
    ru: {
      title: "Моё программное обеспечение",
      subtitle: "Реестр программных продуктов, заявленных на получение лицензии.",
      btn: "Подать заявление на ПО",
      colName: "Наименование ПО",
      colVersion: "Версия",
      colType: "Тип ПО",
      colPlatform: "Платформа",
      colApps: "Заявлений",
      colLicenses: "Лицензий",
      searchPlaceholder: "Поиск программного продукта...",
      emptyTitle: "Программные продукты отсутствуют",
      emptyDesc: "Зарегистрируйте первое ПО, создав заявление на получение лицензии.",
    },
  };

  const t = TEXTS[locale];

  const columns = [
    {
      header: t.colName,
      cell: (row: SoftwareRow) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.name}</p>
          <p className="text-[11px] text-slate-500">{row.developer}</p>
        </div>
      ),
    },
    { header: t.colVersion, accessorKey: "version" as const },
    { header: t.colType, accessorKey: "softwareType" as const },
    { header: t.colPlatform, accessorKey: "platform" as const },
    {
      header: t.colApps,
      cell: (row: SoftwareRow) => (
        <span className="font-semibold text-slate-700">{row.applicationsCount}</span>
      ),
    },
    {
      header: t.colLicenses,
      cell: (row: SoftwareRow) => (
        <span className="font-semibold text-emerald-700">{row.licensesCount}</span>
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
            {t.btn}
          </Button>
        </Link>
      </div>

      <DataTable
        data={softwareList as any}
        columns={columns as any}
        searchPlaceholder={t.searchPlaceholder}
        pageSize={10}
        emptyTitle={t.emptyTitle}
        emptyDescription={t.emptyDesc}
      />
    </div>
  );
}
