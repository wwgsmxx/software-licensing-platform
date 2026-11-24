"use client";

import React from "react";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export interface DocumentRow {
  id: string;
  originalName: string;
  softwareName: string;
  sizeMB: string;
  checksum: string;
  uploadedAt: string;
  fileUrl: string;
}

export function DocumentsClientView({ documents }: { documents: DocumentRow[] }) {
  const { locale } = useLanguage();

  const TEXTS = {
    en: {
      title: "Attached Documents",
      subtitle: "Archive of technical specifications and integrity-verified documents.",
      docName: "Document Name",
      size: "Size",
      checksum: "Integrity Status",
      uploadedDate: "Uploaded Date",
      action: "Action",
      download: "Download",
      searchPlaceholder: "Search documents...",
      emptyTitle: "No documents attached",
      emptyDesc: "Documents attached during application creation will appear here.",
      appFor: "For software",
      checksumVerified: "Checksum verified",
    },
    kk: {
      title: "Тіркелген құжаттар",
      subtitle: "Техникалық сипаттамалар мен тұтастығы тексерілген құжаттар мұрағаты.",
      docName: "Құжат атауы",
      size: "Көлемі",
      checksum: "Тұтастық мәртебесі",
      uploadedDate: "Жүктелген күні",
      action: "Әрекет",
      download: "Жүктеу",
      searchPlaceholder: "Құжаттарды іздеу...",
      emptyTitle: "Құжаттар табылмады",
      emptyDesc: "Өтінім беру кезінде жүктелген құжаттар осында көрсетіледі.",
      appFor: "БЖ үшін",
      checksumVerified: "Бақылау сомасы тексерілді",
    },
    ru: {
      title: "Прикреплённые документы",
      subtitle: "Реестр загруженных технических спецификаций с подтверждённой контрольной суммой.",
      docName: "Название документа",
      size: "Размер",
      checksum: "Проверка целостности",
      uploadedDate: "Дата загрузки",
      action: "Действие",
      download: "Скачать",
      searchPlaceholder: "Поиск документов...",
      emptyTitle: "Документы отсутствуют",
      emptyDesc: "Файлы, прикрепленные к поданным заявлениям, будут отображаться здесь.",
      appFor: "К программе",
      checksumVerified: "Целостность подтверждена",
    },
  };

  const t = TEXTS[locale];

  const columns = [
    {
      header: t.docName,
      cell: (row: DocumentRow) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.originalName}</p>
          <p className="text-[11px] text-slate-500">{t.appFor}: {row.softwareName}</p>
        </div>
      ),
    },
    { header: t.size, accessorKey: "sizeMB" as const },
    {
      header: t.checksum,
      cell: (row: DocumentRow) => (
        <span className="inline-flex items-center gap-1 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{t.checksumVerified}</span>
        </span>
      ),
    },
    { header: t.uploadedDate, accessorKey: "uploadedAt" as const },
    {
      header: t.action,
      cell: (row: DocumentRow) => (
        <a href={row.fileUrl} target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            {t.download}
          </Button>
        </a>
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
        data={documents as any}
        columns={columns as any}
        searchPlaceholder={t.searchPlaceholder}
        pageSize={10}
        emptyTitle={t.emptyTitle}
        emptyDescription={t.emptyDesc}
      />
    </div>
  );
}
