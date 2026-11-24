"use client";

import React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export interface AdminActivityRow {
  id: string;
  userEmail: string;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export function AdminActivityClientView({ logs }: { logs: AdminActivityRow[] }) {
  const { locale } = useLanguage();

  const TEXTS = {
    en: {
      title: "System Audit Trail Log",
      subtitle: "Immutable append-only record of all security actions, digital signature executions, and state transitions.",
      userId: "User Identity",
      actionExec: "Action Executed",
      entityTarget: "Entity Targeted",
      details: "Details",
      ip: "IP Address",
      timestamp: "Timestamp",
      searchPlaceholder: "Search system audit log by user, action, or entity...",
      emptyTitle: "No audit logs recorded",
    },
    kk: {
      title: "Жүйелік аудит журналы",
      subtitle: "Барлық қауіпсіздік әрекеттерінің, қолтаңбаларды орындаудың және күй ауысуларының өзгермейтін журналы.",
      userId: "Пайдаланушы",
      actionExec: "Орындалған әрекет",
      entityTarget: "Мақсатты объект",
      details: "Толығырақ",
      ip: "IP мекенжайы",
      timestamp: "Уақыт таңбасы",
      searchPlaceholder: "Жүйелік аудит журналын пайдаланушы, әрекет немесе объект бойынша іздеу...",
      emptyTitle: "Аудит журналдары табылмады",
    },
    ru: {
      title: "Журнал системного аудита",
      subtitle: "Неизменяемая запись всех действий безопасности, цифровых подписей и переходов состояний.",
      userId: "Пользователь",
      actionExec: "Выполненное действие",
      entityTarget: "Целевой объект",
      details: "Детали",
      ip: "IP-адрес",
      timestamp: "Метка времени",
      searchPlaceholder: "Поиск по журналу системного аудита...",
      emptyTitle: "Записи аудита отсутствуют",
    },
  };

  const t = TEXTS[locale];

  const columns = [
    {
      header: t.userId,
      cell: (row: AdminActivityRow) => <span className="font-semibold text-foreground text-xs">{row.userEmail}</span>,
    },
    {
      header: t.actionExec,
      cell: (row: AdminActivityRow) => <span className="font-mono text-indigo-400 font-bold text-xs">{row.action}</span>,
    },
    { header: t.entityTarget, accessorKey: "entity" as const },
    { header: t.details, accessorKey: "details" as const },
    {
      header: t.ip,
      cell: (row: AdminActivityRow) => <span className="font-mono text-[11px] text-muted-foreground">{row.ipAddress}</span>,
    },
    {
      header: t.timestamp,
      cell: (row: AdminActivityRow) => <span className="font-mono text-[11px] text-muted-foreground">{row.timestamp}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">{t.title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</p>
      </div>

      <DataTable
        data={logs as any}
        columns={columns as any}
        searchPlaceholder={t.searchPlaceholder}
        pageSize={15}
        emptyTitle={t.emptyTitle}
      />
    </div>
  );
}
