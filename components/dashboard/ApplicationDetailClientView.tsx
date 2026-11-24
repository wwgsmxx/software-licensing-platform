"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  AlertTriangle,
  Download,
  ArrowLeft,
  FileCheck2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Building2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressTimeline } from "@/components/ui/ProgressTimeline";
import { DigitalSignatureCard } from "@/components/ui/DigitalSignatureCard";
import { useLanguage } from "@/lib/LanguageContext";

export interface ApplicationDetailClientViewProps {
  app: {
    id: string;
    status: string;
    createdAt: string | Date;
    rejectionReason?: string | null;
    requestedInfo?: string | null;
    licenseType: string;
    licenseDuration: string;
    numUsers: number;
    licenseDescription?: string | null;
    applicantType?: string | null;
    orgName?: string | null;
    orgBin?: string | null;
    orgAddress?: string | null;
    representativeName?: string | null;
    representativeRole?: string | null;
    representativeBasis?: string | null;
    user: {
      name: string;
      email: string;
    };
    software: {
      name: string;
      version: string;
      developer: string;
      softwareType: string;
      platform: string;
      description: string;
    };
    license?: {
      id: string;
    } | null;
    digitalSignature?: any | null;
    documents: Array<{
      id: string;
      originalName: string;
      checksumSha256: string;
      fileUrl: string;
    }>;
    statusHistory: Array<{
      id: string;
      fromStatus: string;
      toStatus: string;
      comment?: string | null;
      createdAt: string | Date;
      changedBy: {
        name: string;
      };
    }>;
  };
}

export function ApplicationDetailClientView({ app }: ApplicationDetailClientViewProps) {
  const { t, locale } = useLanguage();
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "kk" ? "kk-KZ" : "en-US";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 text-slate-800">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded border border-slate-200 bg-white shadow-sm">
        <div>
          <Link
            href="/dashboard/applications"
            className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t("backToApplications")}
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              № {app.id}
            </h1>
            <StatusBadge status={app.status} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("submittedBy")}: <strong>{app.user.name}</strong> ({app.user.email}) • {new Date(app.createdAt).toLocaleDateString(dateLocale)}
          </p>
        </div>

        {app.license && (
          <Link href={`/dashboard/licenses/${app.license.id}`}>
            <Button variant="success" leftIcon={<Award className="w-4 h-4" />}>
              {t("viewLicenseCertBtn")}
            </Button>
          </Link>
        )}
      </div>

      {/* Visual Workflow Progress Timeline */}
      <div className="p-5 rounded border border-slate-200 bg-white shadow-sm space-y-2">
        <h2 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
          {t("workflowProgression")}
        </h2>
        <ProgressTimeline currentStatus={app.status} />
      </div>

      {/* Rejection Alert */}
      {app.rejectionReason && (
        <div className="p-4 rounded border border-rose-200 bg-rose-50/70 text-xs space-y-1 text-rose-900">
          <h3 className="font-bold text-sm text-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-700" /> {t("statusBadgeRejected")}:
          </h3>
          <p className="text-slate-800 pl-6 leading-relaxed">{app.rejectionReason}</p>
        </div>
      )}

      {/* Additional Info Required Alert */}
      {app.requestedInfo && app.status === "ADDITIONAL_INFO_REQUIRED" && (
        <div className="p-4 rounded border border-amber-200 bg-amber-50/70 text-xs space-y-1 text-amber-900">
          <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" /> {t("statusBadgeInfoRequired")}:
          </h3>
          <p className="text-slate-800 pl-6 leading-relaxed">{app.requestedInfo}</p>
        </div>
      )}

      {/* Applicant / Subject Identity */}
      <div className="p-5 rounded border border-slate-200 bg-white space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            {app.applicantType === "LEGAL_ENTITY" ? (
              <Building2 className="w-4 h-4 text-indigo-600" />
            ) : (
              <User className="w-4 h-4 text-indigo-600" />
            )}
            {locale === "ru" ? "Сведения о заявителе" : locale === "kk" ? "Өтініш беруші туралы мәліметтер" : "Applicant Information"}
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {app.applicantType === "LEGAL_ENTITY"
              ? (locale === "ru" ? "Юридическое лицо" : locale === "kk" ? "Заңды тұлға" : "Legal Entity")
              : (locale === "ru" ? "Физическое лицо" : locale === "kk" ? "Жеке тұлға" : "Individual")}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px] font-medium">
              {locale === "ru" ? "Имя / Представитель" : locale === "kk" ? "Аты / Өкіл" : "Name / Representative"}
            </span>
            <p className="font-bold text-slate-900 mt-0.5">
              {app.representativeName || app.user.name}
            </p>
            <p className="text-[11px] text-slate-500">{app.user.email}</p>
          </div>

          {app.applicantType === "LEGAL_ENTITY" && (
            <>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">
                  {locale === "ru" ? "Организация и БИН" : locale === "kk" ? "Ұйым және БСН" : "Organization & BIN"}
                </span>
                <p className="font-bold text-slate-900 mt-0.5">{app.orgName || "—"}</p>
                <p className="text-[11px] font-mono text-indigo-600">БИН: {app.orgBin || "—"}</p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] font-medium">
                  {locale === "ru" ? "Полномочия" : locale === "kk" ? "Өкілеттігі" : "Authority & Role"}
                </span>
                <p className="font-medium text-slate-800 mt-0.5">{app.representativeRole || "Руководитель"}</p>
                <p className="text-[11px] text-slate-500">{app.representativeBasis || "На основании Устава"}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grid: Details & Licensing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Software Details */}
        <div className="p-5 rounded border border-slate-200 bg-white space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
            {t("step1FormHeading")}
          </h3>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">{t("softwareNameLabel")}</span>
              <p className="font-bold text-slate-900 text-sm">
                {app.software.name} <span className="text-xs text-slate-500 font-normal">v{app.software.version}</span>
              </p>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] font-medium">{t("softwareDeveloperLabel")}</span>
              <p className="font-semibold text-slate-800">{app.software.developer}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">{t("softwareTypeLabel")}</span>
                <p className="font-medium text-slate-800">{app.software.softwareType}</p>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">{t("platformLabel")}</span>
                <p className="font-medium text-slate-800">{app.software.platform}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] font-medium">{t("softwareDescriptionLabel")}</span>
              <p className="text-slate-600 leading-relaxed mt-0.5">{app.software.description}</p>
            </div>
          </div>
        </div>

        {/* Licensing Details */}
        <div className="p-5 rounded border border-slate-200 bg-white space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
            {t("step2FormHeading")}
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">{t("licenseTypeLabel")}</span>
                <p className="font-bold text-slate-900 text-sm">{app.licenseType}</p>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">{t("licenseDurationLabel")}</span>
                <p className="font-bold text-slate-900 text-sm">{app.licenseDuration}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] font-medium">{t("licenseSeatsLabel")}</span>
              <p className="font-semibold text-slate-800">{app.numUsers}</p>
            </div>

            {app.licenseDescription && (
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">{t("licenseNotesLabel")}</span>
                <p className="text-slate-600 leading-relaxed mt-0.5">{app.licenseDescription}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Digital Signature Card */}
      {app.digitalSignature && (
        <DigitalSignatureCard signature={app.digitalSignature} />
      )}

      {/* Attached Documents */}
      <div className="p-5 rounded border border-slate-200 bg-white space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
          {t("fileUploadAttachedDocs")} ({app.documents.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {app.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 rounded border border-slate-200 bg-slate-50 text-xs"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="p-2 bg-white text-slate-600 rounded border border-slate-200 shrink-0">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-slate-800 truncate">{doc.originalName}</p>
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{t("fileChecksumVerified")}</span>
                  </p>
                </div>
              </div>

              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="shrink-0 ml-2">
                <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  {t("fileUploadView")}
                </Button>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* History of Actions */}
      <div className="p-5 rounded border border-slate-200 bg-white space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
          {t("activityHistoryTitle")} ({app.statusHistory.length})
        </h3>

        <div className="space-y-3 text-xs">
          {app.statusHistory.map((hist) => (
            <div key={hist.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
              <div className="p-1.5 bg-slate-100 text-slate-500 rounded mt-0.5">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-600 font-medium">{t("statusTransition")}:</span>
                  <StatusBadge status={hist.fromStatus} />
                  <span className="text-slate-400">→</span>
                  <StatusBadge status={hist.toStatus} />
                </div>
                <p className="text-[11px] text-slate-500">
                  {t("actionBy")} <strong>{hist.changedBy.name}</strong> • {new Date(hist.createdAt).toLocaleString(dateLocale)}
                </p>
                {hist.comment && (
                  <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 mt-1 italic">
                    «{hist.comment}»
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
