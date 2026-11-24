"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Eye, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export interface AdminApplicationRow {
  id: string;
  applicantName: string;
  applicantEmail: string;
  softwareName: string;
  licenseType: string;
  status: string;
  submittedDate: string;
  signatureVerified: boolean;
}

export function AdminApplicationsClientView({ applications }: { applications: AdminApplicationRow[] }) {
  const { locale } = useLanguage();

  const TEXTS = {
    en: {
      title: "Application Review Queue",
      subtitle: "Official review registry for auditing software applications, checking file checksums, and making compliance decisions.",
      appId: "Application Number",
      applicantProfile: "Applicant",
      swProduct: "Software Name",
      licCategory: "License Category",
      workflowStatus: "Status",
      sigStatus: "Digital Signature",
      auditAction: "Action",
      validSig: "Confirmed",
      unsignedSig: "Unsigned",
      inspectBtn: "Review & Decision",
      searchPlaceholder: "Search queue by application number, applicant, or software...",
      emptyTitle: "No applications found",
      emptyDesc: "There are no applications matching your search query.",
    },
    kk: {
      title: "Өтінімдерді қарау кезегі",
      subtitle: "БЖ лицензиялау өтінімдерін аудиттеу, бақылау сомаларын тексеру және шешім қабылдаудың ресми тізілімі.",
      appId: "Өтінім нөмірі",
      applicantProfile: "Өтініш беруші",
      swProduct: "БЖ атауы",
      licCategory: "Лицензия санаты",
      workflowStatus: "Мәртебесі",
      sigStatus: "Сандық қолтаңба",
      auditAction: "Әрекет",
      validSig: "Расталған",
      unsignedSig: "Қол қойылмаған",
      inspectBtn: "Қарау және шешім",
      searchPlaceholder: "Өтінімдерді нөмірі, өтініш беруші немесе БЖ бойынша іздеу...",
      emptyTitle: "Өтінімдер табылмады",
      emptyDesc: "Іздеу сұрауына сәйкес келетін өтінімдер жоқ.",
    },
    ru: {
      title: "Рассмотрение заявлений",
      subtitle: "Официальный реестр заявлений на аудит технической документации, проверку электронной подписи и принятие решений.",
      appId: "Номер заявления",
      applicantProfile: "Заявитель",
      swProduct: "Наименование ПО",
      licCategory: "Категория лицензии",
      workflowStatus: "Статус",
      sigStatus: "Электронная подпись",
      auditAction: "Действие",
      validSig: "Подтверждена",
      unsignedSig: "Не подписано",
      inspectBtn: "Рассмотреть",
      searchPlaceholder: "Поиск по номеру заявления, заявителю или ПО...",
      emptyTitle: "Заявления не найдены",
      emptyDesc: "Нет заявлений, соответствующих вашему поисковому запросу.",
    },
  };

  const t = TEXTS[locale];

  const columns = [
    {
      header: t.appId,
      cell: (row: AdminApplicationRow) => (
        <span className="font-mono font-bold text-slate-900 text-xs">{row.id}</span>
      ),
    },
    {
      header: t.applicantProfile,
      cell: (row: AdminApplicationRow) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.applicantName}</p>
          <p className="text-[11px] text-slate-500">{row.applicantEmail}</p>
        </div>
      ),
    },
    { header: t.swProduct, accessorKey: "softwareName" as const },
    { header: t.licCategory, accessorKey: "licenseType" as const },
    {
      header: t.workflowStatus,
      cell: (row: AdminApplicationRow) => <StatusBadge status={row.status} />,
    },
    {
      header: t.sigStatus,
      cell: (row: AdminApplicationRow) => (
        row.signatureVerified ? (
          <span className="inline-flex items-center gap-1 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {t.validSig}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">{t.unsignedSig}</span>
        )
      ),
    },
    {
      header: t.auditAction,
      cell: (row: AdminApplicationRow) => (
        <Link href={`/admin/applications/${row.id}`}>
          <Button variant="primary" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
            {t.inspectBtn}
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
        data={applications as any}
        columns={columns as any}
        searchPlaceholder={t.searchPlaceholder}
        pageSize={12}
        emptyTitle={t.emptyTitle}
        emptyDescription={t.emptyDesc}
      />
    </div>
  );
}
