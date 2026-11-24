"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Search,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  Award,
  AlertCircle,
  Hash,
  Key,
  Building2,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLanguage } from "@/lib/LanguageContext";

interface VerificationResult {
  found: boolean;
  license?: {
    id: string;
    licenseKey: string;
    licenseType: string;
    status: string;
    issuedAt: string;
    expiresAt: string;
    applicantType?: string;
    licenseeName?: string;
    orgBin?: string | null;
    numUsers?: number;
    software: {
      name: string;
      version: string;
      developer: string;
      softwareType: string;
      platform: string;
    };
    digitalSignature?: {
      keyFingerprint: string;
      verificationId: string;
      isVerified: boolean;
      algorithm?: string;
    };
  };
  message?: string;
}

function VerifyLicenseContent() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id") || "";

  const [inputLicenseId, setInputLicenseId] = useState(queryId);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [showTechDetails, setShowTechDetails] = useState(false);

  const performVerification = async (targetId: string) => {
    if (!targetId.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/verify-license?id=${encodeURIComponent(targetId.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        found: false,
        message: t("verifySystemError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setInputLicenseId(queryId);
      performVerification(queryId);
    }
  }, [queryId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(inputLicenseId);
  };

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "kk" ? "kk-KZ" : "en-US";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800">
      {/* Official Header */}
      <div className="text-center space-y-2">
        <div className="p-3 bg-blue-50 text-indigo-600 rounded-full w-fit mx-auto border border-blue-100">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {t("verifyPageTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          {t("verifyPageSubtitle")}
        </p>
      </div>

      {/* Official Search Form */}
      <form onSubmit={handleSearch} className="p-6 rounded border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {t("verifyInputLabel")}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder={t("verifyPlaceholder")}
                value={inputLicenseId}
                onChange={(e) => setInputLicenseId(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="sm:w-36"
            >
              {t("verifyBtnText")}
            </Button>
          </div>
        </div>

        {/* Short Instruction */}
        <p className="text-[11px] text-slate-500">
          {t("verifyInstructionNote")}
        </p>
      </form>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-6 rounded border border-slate-200 bg-white space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="animate-in fade-in-50 duration-200">
          {result.found && result.license ? (
            <div
              className={`p-6 rounded border bg-white space-y-6 shadow-sm ${
                result.license.status === "ACTIVE"
                  ? "border-emerald-300"
                  : result.license.status === "EXPIRED"
                  ? "border-amber-300 bg-amber-50/20"
                  : result.license.status === "SUSPENDED"
                  ? "border-orange-300 bg-orange-50/20"
                  : "border-rose-300 bg-rose-50/20"
              }`}
            >
              {/* Status Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  {result.license.status === "ACTIVE" && (
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  {result.license.status === "EXPIRED" && (
                    <div className="p-2 bg-amber-50 text-amber-700 rounded border border-amber-200 mt-0.5">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}
                  {result.license.status === "SUSPENDED" && (
                    <div className="p-2 bg-orange-50 text-orange-700 rounded border border-orange-200 mt-0.5">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}
                  {result.license.status === "REVOKED" && (
                    <div className="p-2 bg-rose-50 text-rose-700 rounded border border-rose-200 mt-0.5">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h2
                      className={`text-base font-bold ${
                        result.license.status === "ACTIVE"
                          ? "text-emerald-900"
                          : result.license.status === "EXPIRED"
                          ? "text-amber-900"
                          : result.license.status === "SUSPENDED"
                          ? "text-orange-900"
                          : "text-rose-900"
                      }`}
                    >
                      {result.license.status === "ACTIVE"
                        ? (locale === "ru" ? "Лицензия подлинна и активна" : locale === "kk" ? "Лицензия жарамды және белсенді" : "License is Authentic & Active")
                        : result.license.status === "EXPIRED"
                        ? (locale === "ru" ? "Срок действия лицензии истек" : locale === "kk" ? "Лицензияның қолданылу мерзімі аяқталды" : "License Has Expired")
                        : result.license.status === "SUSPENDED"
                        ? (locale === "ru" ? "Действие лицензии временно приостановлено" : locale === "kk" ? "Лицензияның қолданылуы тоқтатыла тұрды" : "License is Suspended")
                        : (locale === "ru" ? "Лицензия отозвана / аннулирована" : locale === "kk" ? "Лицензия кері қайтарылды / жойылды" : "License is Revoked")}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {result.license.status === "ACTIVE"
                        ? t("verifySignatureValidExplanation")
                        : result.license.status === "EXPIRED"
                        ? (locale === "ru" ? "Запись найдена в реестре, но установленный срок действия лицензии завершился." : locale === "kk" ? "Жазба тізілімде бар, бірақ мерзімі өткен." : "Record found in registry, but the validity period has expired.")
                        : (locale === "ru" ? "Лицензия не предоставляет право на использование программного обеспечения." : locale === "kk" ? "Лицензия бағдарламаны пайдалануға құқық бермейді." : "This license does not grant rights to run the software.")}
                    </p>
                  </div>
                </div>
                <StatusBadge status={result.license.status} size="md" />
              </div>

              {/* License Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Product */}
                <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    {t("certSoftwareProduct")}
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {result.license.software.name} <span className="font-normal text-slate-500 text-xs">v{result.license.software.version}</span>
                  </p>
                  <p className="text-slate-600">
                    {t("certDevelopedBy")}: <strong>{result.license.software.developer}</strong>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {result.license.software.softwareType} • {result.license.software.platform}
                  </p>
                </div>

                {/* License Parameters */}
                <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    {t("licDetails")}
                  </span>
                  <p className="text-sm font-mono font-bold text-indigo-600">
                    № {result.license.licenseKey}
                  </p>
                  <p className="text-slate-600">
                    {t("certLicenseType")}: <strong>{result.license.licenseType}</strong>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {t("certIssuedDate")}: {new Date(result.license.issuedAt).toLocaleDateString(dateLocale)}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {t("certExpiresDate")}: {new Date(result.license.expiresAt).toLocaleDateString(dateLocale)}
                  </p>
                  {result.license.numUsers && (
                    <p className="text-slate-500 text-[11px]">
                      {locale === "ru" ? "Рабочих мест" : locale === "kk" ? "Жұмыс орындары" : "Workstations"}: {result.license.numUsers}
                    </p>
                  )}
                </div>

                {/* Licensee / Holder */}
                <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider flex items-center justify-between">
                    <span>{locale === "ru" ? "Лицензиат" : locale === "kk" ? "Лицензиат" : "Licensee"}</span>
                    <span className="text-[9px] font-normal px-1.5 py-0.2 rounded bg-white border border-slate-200">
                      {result.license.applicantType === "LEGAL_ENTITY"
                        ? (locale === "ru" ? "Юрлицо" : locale === "kk" ? "Заңды тұлға" : "Legal")
                        : (locale === "ru" ? "Физлицо" : locale === "kk" ? "Жеке тұлға" : "Individual")}
                    </span>
                  </span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {result.license.applicantType === "LEGAL_ENTITY" ? (
                      <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    )}
                    <span className="truncate">{result.license.licenseeName || "—"}</span>
                  </p>
                  {result.license.orgBin && (
                    <p className="text-slate-600 font-mono text-[11px]">
                      БИН: <strong>{result.license.orgBin}</strong>
                    </p>
                  )}
                  <p className="text-slate-500 text-[11px] pt-1">
                    {locale === "ru"
                      ? "Право использования зарегистрировано в Государственном электронном реестре"
                      : locale === "kk"
                      ? "Пайдалану құқығы Мемлекеттік электрондық тізілімде тіркелген"
                      : "Usage rights recorded in the Electronic Licensing Register"}
                  </p>
                </div>
              </div>

              {/* Status Explanation */}
              {result.license.status === "ACTIVE" && (
                <div className="p-3 rounded bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
                  {t("verifyLicenseActiveNotice")}
                </div>
              )}
              {result.license.status === "EXPIRED" && (
                <div className="p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  {locale === "ru"
                    ? "Внимание: срок действия данной лицензии завершился. Для продолжения легального использования требуется подать заявку на продление."
                    : locale === "kk"
                    ? "Назар аударыңыз: бұл лицензияның қолданылу мерзімі аяқталды. Қолдануды жалғастыру үшін ұзартуға өтінім беру қажет."
                    : "Notice: The validity period for this software license has expired. Please apply for a license extension to continue legal operations."}
                </div>
              )}
              {result.license.status === "SUSPENDED" && (
                <div className="p-3 rounded bg-orange-50 border border-orange-200 text-xs text-orange-900">
                  {t("verifyLicenseSuspendedNotice")}
                </div>
              )}
              {result.license.status === "REVOKED" && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-900">
                  {t("verifyLicenseRevokedNotice")}
                </div>
              )}

              {/* Collapsible Technical Details (SHA-256, Ed25519) */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTechDetails(!showTechDetails)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 focus:outline-none"
                >
                  {showTechDetails ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>{t("hideTechDetails")}</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>{t("showTechDetails")}</span>
                    </>
                  )}
                </button>

                {showTechDetails && (
                  <div className="mt-3 p-4 rounded bg-slate-50 border border-slate-200 space-y-2.5 text-xs animate-in fade-in-50 duration-150">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                        <Key className="w-3 h-3 text-slate-500" /> {t("certKeyFingerprint")}
                      </span>
                      <p className="font-mono bg-white p-2 rounded border border-slate-200 break-all text-[11px] text-slate-700">
                        {result.license.digitalSignature?.keyFingerprint || "N/A"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                        <Hash className="w-3 h-3 text-slate-500" /> {t("sigCardVerificationId")}
                      </span>
                      <p className="font-mono bg-white p-2 rounded border border-slate-200 break-all text-[11px] text-slate-700">
                        {result.license.digitalSignature?.verificationId || result.license.id}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-500 pt-1">
                      {t("verifyTechnicalProofExplanation")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Error / Not Found */
            <div className="p-6 rounded border border-rose-200 bg-white space-y-3 text-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 text-rose-700 rounded border border-rose-200">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-rose-900">{t("verifyNotFoundTitle")}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{result.message || t("verifyNotFoundDesc")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyLicensePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto py-12 px-4 text-center">
          <Skeleton className="h-10 w-48 mx-auto" />
        </div>
      }
    >
      <VerifyLicenseContent />
    </Suspense>
  );
}
