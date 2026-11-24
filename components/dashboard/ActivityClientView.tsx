"use client";

import React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export interface ActivityRow {
  id: string;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export function ActivityClientView({ logs }: { logs: ActivityRow[] }) {
  const { locale } = useLanguage();

  const TEXTS = {
    en: {
      title: "Activity & Audit Log",
      subtitle: "Official security log of logins, digital signatures, and application operations.",
      actionExec: "Action",
      entityTarget: "Object",
      details: "Details",
      ip: "IP Address",
      timestamp: "Date & Time",
      searchPlaceholder: "Search audit log...",
      emptyTitle: "No activity recorded",
      emptyDesc: "Security operations and actions will be logged here.",
    },
    kk: {
      title: "Әрекеттер мен аудит журналы",
      subtitle: "Кірулер, сандық қолтаңбалар мен өтінім әрекеттерінің қауіпсіздік журналы.",
      actionExec: "Әрекет",
      entityTarget: "Объект",
      details: "Мәліметтер",
      ip: "IP мекенжайы",
      timestamp: "Күні мен уақыты",
      searchPlaceholder: "Аудит журналын іздеу...",
      emptyTitle: "Журнал бос",
      emptyDesc: "Қауіпсіздік операциялары мен әрекеттер осында жазылады.",
    },
    ru: {
      title: "Журнал действий и безопасности",
      subtitle: "Официальный аудит авторизаций, формирования электронной подписи и действий с заявлениями.",
      actionExec: "Действие",
      entityTarget: "Объект",
      details: "Описание",
      ip: "IP-адрес",
      timestamp: "Дата и время",
      searchPlaceholder: "Поиск по журналу действий...",
      emptyTitle: "Записи отсутствуют",
      emptyDesc: "Действия в системе фиксируются здесь в целях обеспечения информационной безопасности.",
    },
  };

  const t = TEXTS[locale];

  const columns = [
    {
      header: t.actionExec,
      cell: (row: ActivityRow) => (
        <span className="font-bold text-slate-900 text-xs">{row.action}</span>
      ),
    },
    { header: t.entityTarget, accessorKey: "entity" as const },
    { header: t.details, accessorKey: "details" as const },
    {
      header: t.ip,
      cell: (row: ActivityRow) => <span className="font-mono text-[11px] text-slate-500">{row.ipAddress}</span>,
    },
    {
      header: t.timestamp,
      cell: (row: ActivityRow) => <span className="text-[11px] text-slate-600">{row.timestamp}</span>,
    },
  ];

  return (
    <div className="space-y-5 text-slate-800">
      <div className="p-5 rounded border border-slate-200 bg-white shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
      </div>

      <DataTable
        data={logs as any}
        columns={columns as any}
        searchPlaceholder={t.searchPlaceholder}
        pageSize={12}
        emptyTitle={t.emptyTitle}
        emptyDescription={t.emptyDesc}
      />
    </div>
  );
}
