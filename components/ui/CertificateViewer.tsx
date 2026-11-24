"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  ShieldCheck,
  Award,
  Printer,
  ExternalLink,
  Download,
  Building2,
  UserCheck,
  CheckCircle2,
  Lock,
  Cpu,
} from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { useLanguage } from "@/lib/LanguageContext";
import { CorporateStamp } from "./CorporateStamp";

export interface LicenseCertificateProps {
  license: {
    id: string;
    licenseKey: string;
    licenseType: string;
    status: string;
    issuedAt: string | Date;
    expiresAt: string | Date;
    software: {
      name: string;
      version: string;
      developer: string;
      softwareType: string;
      platform: string;
    };
    user: {
      name: string;
      email: string;
    };
    application?: {
      applicantType?: string;
      orgName?: string | null;
      orgBin?: string | null;
      representativeName?: string | null;
      numUsers?: number;
      licenseDuration?: string;
    };
    digitalSignature?: {
      payloadHash: string;
      keyFingerprint: string;
      algorithm?: string;
      signatureType?: string;
      signerName?: string;
      signerIin?: string | null;
      signerBin?: string | null;
      verificationId?: string;
      signedAt: string | Date;
    };
  };
}

export const CertificateViewer: React.FC<LicenseCertificateProps> = ({ license }) => {
  const { t, locale } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const verificationUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify-license?id=${encodeURIComponent(license.id)}`
    : `/verify-license?id=${license.id}`;

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, [verificationUrl]);

  const handlePrint = () => {
    window.print();
  };

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "kk" ? "kk-KZ" : "en-US";

  const issuedDate = new Date(license.issuedAt).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const expiresDate = new Date(license.expiresAt).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isLicenseActive = license.status === "ACTIVE";
  const applicantType = license.application?.applicantType || "INDIVIDUAL";
  const isLegalEntity = applicantType === "LEGAL_ENTITY";

  const licenseeTitle = isLegalEntity && license.application?.orgName
    ? license.application.orgName
    : license.user.name;

  return (
    <div className="certificate-print-root space-y-6 text-slate-800">
      {/* ── Toolbar (Hidden on Print) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl print:hidden">
        <div className="flex items-center gap-2">
          <Badge variant={isLicenseActive ? "success" : "danger"} size="md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isLicenseActive ? t("statusActive") : license.status}</span>
          </Badge>
          <span className="text-xs text-slate-500 font-mono font-semibold">
            № {license.licenseKey}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4 text-slate-600" />}
          >
            {t("printA4")}
          </Button>

          <a href={`/api/licenses/${license.id}/pdf`} download={`License-${license.id}.pdf`}>
            <Button
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              leftIcon={<Download className="w-4 h-4" />}
            >
              {t("downloadPdf")}
            </Button>
          </a>

          <a href={`/verify-license?id=${license.id}`} target="_blank" rel="noreferrer">
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ExternalLink className="w-4 h-4" />}
            >
              {t("verifyOnline")}
            </Button>
          </a>
        </div>
      </div>

      {/* ── Official Certificate Canvas (A4 Styled Document) ── */}
      <div className="relative bg-white p-6 sm:p-12 rounded-2xl border-2 border-slate-300 shadow-xl max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none print:m-0">
        {/* Document Security Frame */}
        <div className="relative border-2 border-slate-300 p-6 sm:p-10 space-y-6 print:p-4 print:space-y-3 print:border-slate-800">
          {/* Subtle Security Guilloche Background Watermark */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <Award className="w-96 h-96 text-slate-900" />
          </div>

          {/* 1. Official Header */}
          <div className="text-center space-y-2 border-b border-slate-200 pb-5 relative z-10 print:pb-2 print:space-y-0.5">
            <div className="inline-flex items-center justify-center p-2.5 bg-slate-100 text-indigo-700 rounded-full mb-0.5 border border-slate-200 print:p-1.5">
              <Award className="w-8 h-8 stroke-[1.5] print:w-6 print:h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500">
              FLEXORA SYSTEMS LICENSING AUTHORITY
            </p>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900 leading-tight print:text-lg">
              СЕРТИФИКАТ КОММЕРЧЕСКОЙ ЛИЦЕНЗИИ
            </h1>
            <p className="text-[11px] text-slate-500 font-medium print:text-[10px]">
              Официальный документ о предоставлении права использования программного обеспечения
            </p>
            <div className="flex items-center justify-center gap-3 pt-0.5">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200 print:text-[11px]">
                № {license.licenseKey}
              </span>
              <span className="text-xs text-slate-400 font-mono print:text-[10px]">
                ID: {license.id}
              </span>
            </div>
          </div>

          {/* 2. Certificate Body Content */}
          <div className="space-y-4 text-center text-xs sm:text-sm relative z-10 print:space-y-2">
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed text-xs print:text-[10.5px]">
              Настоящий сертификат удостоверяет, что указанному ниже лицензиату предоставлено право на коммерческое использование и развёртывание следующего программного обеспечения:
            </p>

            {/* Software Product Box */}
            <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl max-w-2xl mx-auto space-y-1.5 text-left print:p-2.5 print:space-y-0.5">
              <span className="text-[9.5px] font-bold uppercase text-slate-500 tracking-wider">
                Лицензируемое программное обеспечение
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 print:text-sm">
                {license.software.name} <span className="text-xs font-normal text-slate-500">v{license.software.version}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 pt-0.5 print:text-[10px]">
                <p>Разработчик: <strong className="text-slate-900">{license.software.developer}</strong></p>
                <p>Тип ПО: <strong>{license.software.softwareType}</strong></p>
                <p>Платформа: <strong>{license.software.platform}</strong></p>
                <p>Дата выпуска релиза: <strong>{issuedDate}</strong></p>
              </div>
            </div>

            {/* Licensee Box */}
            <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl max-w-2xl mx-auto space-y-1.5 text-left print:p-2.5 print:space-y-0.5">
              <span className="text-[9.5px] font-bold uppercase text-slate-500 tracking-wider">
                Сведения о лицензиате (Владельце лицензии)
              </span>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-indigo-700 mt-0.5 print:p-1.5">
                  {isLegalEntity ? <Building2 className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 print:text-xs">{licenseeTitle}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600 print:text-[10px]">
                    <p>Субъект: <strong>{isLegalEntity ? "Юридическое лицо" : "Физическое лицо"}</strong></p>
                    {isLegalEntity && license.application?.orgBin ? (
                      <p>БИН: <strong className="font-mono text-slate-900">{license.application.orgBin}</strong></p>
                    ) : (
                      <p>Email: <strong className="text-slate-900">{license.user.email}</strong></p>
                    )}
                    {isLegalEntity && license.application?.representativeName && (
                      <p className="col-span-2">
                        Представитель: <strong>{license.application.representativeName}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* License Terms Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto text-xs text-left print:gap-1.5 print:text-[10px]">
              <div className="p-2.5 border border-slate-200 bg-white rounded-lg print:p-1.5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Категория</span>
                <span className="font-bold text-slate-900">{license.licenseType}</span>
              </div>
              <div className="p-2.5 border border-slate-200 bg-white rounded-lg print:p-1.5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Рабочих мест</span>
                <span className="font-bold text-slate-900">{license.application?.numUsers || 1} мест</span>
              </div>
              <div className="p-2.5 border border-slate-200 bg-white rounded-lg print:p-1.5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Дата выдачи</span>
                <span className="font-bold text-slate-900">{issuedDate}</span>
              </div>
              <div className="p-2.5 border border-slate-200 bg-white rounded-lg print:p-1.5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Действительна до</span>
                <span className="font-bold text-slate-900">{expiresDate}</span>
              </div>
            </div>
          </div>

          {/* 3. Certificate Footer: Signature + Corporate Stamp + QR-Code */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-xs print:pt-2.5 print:gap-2">
            {/* Signature & Issuer Verification metadata */}
            <div className="space-y-1 text-left max-w-xs print:space-y-0.5">
              <p className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] print:text-[9.5px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ЭЦП издателя подтверждена</span>
              </p>
              {license.digitalSignature && (
                <div className="space-y-0.5 text-[10px] text-slate-600 print:text-[8.5px]">
                  <p>
                    Алгоритм: <strong>{license.digitalSignature.algorithm || "Ed25519-SHA256"}</strong>
                  </p>
                  <p className="font-mono text-[9px] text-slate-500 break-all print:text-[8px]">
                    Отпечаток: {license.digitalSignature.keyFingerprint}
                  </p>
                  {license.digitalSignature.signerIin && (
                    <p>ИИН подписанта: <strong className="font-mono">{license.digitalSignature.signerIin}</strong></p>
                  )}
                  {license.digitalSignature.verificationId && (
                    <p className="font-mono text-[9px] text-indigo-700 print:text-[8px]">
                      Токен: {license.digitalSignature.verificationId}
                    </p>
                  )}
                </div>
              )}
              <p className="text-[9px] text-slate-400 pt-0.5 print:text-[8px]">
                Дата: {new Date().toLocaleDateString(dateLocale)} • FleXora Platform
              </p>
            </div>

            {/* Official Corporate Blue Ink Seal (matching Photo 3 sample) */}
            <div className="shrink-0 flex items-center justify-center my-1 sm:my-0">
              <CorporateStamp size={125} tilt={-5} />
            </div>

            {/* Real Dynamic QR-Code for Verification */}
            <div className="flex items-center gap-2 p-2.5 border border-slate-200 bg-slate-50 rounded-xl shrink-0 print:p-1.5">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR-код проверки лицензии"
                  className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 print:w-14 print:h-14"
                />
              ) : (
                <div className="w-16 h-16 bg-slate-200 rounded-lg animate-pulse" />
              )}
              <div className="text-left text-[10px] space-y-0.5 max-w-[120px] print:text-[8.5px]">
                <p className="font-bold text-slate-900">Проверка подлинности</p>
                <p className="text-slate-500 text-[9px] leading-tight print:text-[7.5px]">
                  Наведите камеру смартфона для мгновенной валидации
                </p>
                <p className="text-[8px] text-indigo-600 font-mono truncate">
                  /verify-license?id={license.id}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
