"use client";

import React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export interface AdminSoftwareRow {
  id: string;
  name: string;
  version: string;
  developer: string;
  applicant: string;
  softwareType: string;
  platform: string;
  applicationsCount: number;
  licensesCount: number;
  createdAt: string;
}

export function AdminSoftwareClientView({ softwareList }: { softwareList: AdminSoftwareRow[] }) {
  const { locale } = useLanguage();

  const TEXTS = {
    en: {
      title: "Global Software Registry Audit",
      subtitle: "System-wide directory of software products registered for licensing applications.",
      swProduct: "Software Product",
      version: "Version",
      applicant: "Applicant",
      type: "Type",
      platform: "Platform",
      apps: "Applications",
      licenses: "Active Licenses",
      searchPlaceholder: "Search global software registry...",
      emptyTitle: "No software products registered",
    },
    kk: {
      title: "Жаһандық БЖ тізілімінің аудиті",
      subtitle: "Лицензиялық өтінімдер үшін тіркелген БЖ өнімдерінің жүйелік каталогы.",
      swProduct: "Бағдарламалық өнім",
      version: "Нұсқасы",
      applicant: "Өтініш беруші",
      type: "Түрі",
      platform: "Платформа",
      apps: "Өтінімдер",
      licenses: "Белсенді лицензиялар",
      searchPlaceholder: "Жаһандық БЖ тізілімін іздеу...",
      emptyTitle: "Тіркелген БЖ өнімдері табылмады",
    },
    ru: {
      title: "Аудит глобального реестра ПО",
      subtitle: "Системный каталог программных продуктов, зарегистрированных для заявок на лицензирование.",
      swProduct: "Программный продукт",
      version: "Версия",
      applicant: "Заявитель",
      type: "Тип",
      platform: "Платформа",
      apps: "Заявки",
      licenses: "Активные лицензии",
      searchPlaceholder: "Поиск по глобальному реестру ПО...",
      emptyTitle: "Зарегистрированные продукты ПО не найдены",
    },
  };

  const t = TEXTS[locale];

  const columns = [
    {
      header: t.swProduct,
      cell: (row: AdminSoftwareRow) => (
        <div>
          <p className="font-bold text-foreground text-xs">{row.name}</p>
          <p className="text-[11px] text-muted-foreground">{row.developer}</p>
        </div>
      ),
    },
    { header: t.version, accessorKey: "version" as const },
    { header: t.applicant, accessorKey: "applicant" as const },
    { header: t.type, accessorKey: "softwareType" as const },
    { header: t.platform, accessorKey: "platform" as const },
    {
      header: t.apps,
      cell: (row: AdminSoftwareRow) => <span className="font-semibold text-indigo-400 text-xs">{row.applicationsCount}</span>,
    },
    {
      header: t.licenses,
      cell: (row: AdminSoftwareRow) => <span className="font-semibold text-emerald-400 text-xs">{row.licensesCount}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">{t.title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</p>
      </div>

      <DataTable
        data={softwareList as any}
        columns={columns as any}
        searchPlaceholder={t.searchPlaceholder}
        pageSize={12}
        emptyTitle={t.emptyTitle}
      />
    </div>
  );
}
