"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  FileText,
  HardDrive,
  Globe,
  Info,
  Key,
  Download,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/LanguageContext";
import { checkNCALayerAvailability } from "@/lib/ncalayer";

type NcaStatus = "IDLE" | "CHECKING" | "AVAILABLE" | "UNAVAILABLE";

export default function GetEcpPage() {
  const { toast } = useToast();
  const { t, locale } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);
  const [ncaStatus, setNcaStatus] = useState<NcaStatus>("IDLE");
  const [ncaError, setNcaError] = useState<string | null>(null);

  // Auto-check NCALayer when reaching step 1
  useEffect(() => {
    if (currentStep === 1 && ncaStatus === "IDLE") {
      runNcaCheck();
    }
  }, [currentStep]);

  const runNcaCheck = async () => {
    setNcaStatus("CHECKING");
    setNcaError(null);
    try {
      const res = await checkNCALayerAvailability(3000);
      if (res.isAvailable) {
        setNcaStatus("AVAILABLE");
      } else {
        setNcaStatus("UNAVAILABLE");
        setNcaError(res.error || null);
      }
    } catch (e: unknown) {
      setNcaStatus("UNAVAILABLE");
      setNcaError(e instanceof Error ? e.message : null);
    }
  };

  const STEPS = [
    { num: 1, title: t("getEcpStep1Title") },
    { num: 2, title: t("getEcpStep2Title") },
    { num: 3, title: t("getEcpStep3Title") },
    { num: 4, title: t("getEcpStep4Title") },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-slate-800">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>{t("getEcpBadge")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          {t("getEcpPageTitle")}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {t("getEcpPageSubtitle")}
        </p>
      </div>

      {/* Important notice box */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-700" />
        <div className="space-y-1">
          <p className="font-bold">{t("getEcpNoticeTitle")}</p>
          <p className="text-xs leading-relaxed">{t("getEcpNoticeBody")}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 text-xs">
        {STEPS.map((s) => {
          const isCurrent = currentStep === s.num;
          const isPast = currentStep > s.num;
          return (
            <div
              key={s.num}
              className={`p-3 rounded-lg flex items-center gap-2 transition-all ${
                isCurrent
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : isPast
                  ? "bg-white text-emerald-800 border border-slate-200 font-medium"
                  : "text-slate-500"
              }`}
            >
              <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isCurrent ? "bg-white text-indigo-600" : isPast ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
              }`}>
                {isPast ? "✓" : s.num}
              </span>
              <span className="truncate">{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: NCALayer Check ── */}
      {currentStep === 1 && (
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">{t("getEcpStep1Heading")}</h2>
            <p className="text-xs text-slate-500 mt-1">{t("getEcpStep1Info")}</p>
          </div>

          {/* NCALayer status panel */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  ncaStatus === "AVAILABLE"
                    ? "bg-emerald-100 text-emerald-700"
                    : ncaStatus === "UNAVAILABLE"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-slate-200 text-slate-600"
                }`}>
                  {ncaStatus === "AVAILABLE" ? (
                    <Wifi className="w-5 h-5" />
                  ) : ncaStatus === "UNAVAILABLE" ? (
                    <WifiOff className="w-5 h-5" />
                  ) : (
                    <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">NCALayer</h4>
                  <p className="text-xs text-slate-500">
                    <code>ws://127.0.0.1:13579/</code>
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={ncaStatus === "CHECKING"}
                onClick={runNcaCheck}
                leftIcon={ncaStatus === "CHECKING" ? <RefreshCw className="w-4 h-4 animate-spin" /> : undefined}
              >
                {ncaStatus === "CHECKING" ? t("getEcpChecking") : t("getEcpCheckAgain")}
              </Button>
            </div>

            {ncaStatus === "AVAILABLE" && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  {t("getEcpNcaAvailable")}
                </p>
                <p>{t("getEcpNcaAvailableDesc")}</p>
              </div>
            )}

            {ncaStatus === "UNAVAILABLE" && (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-3">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-700" />
                  {t("getEcpNcaUnavailable")}
                </p>
                <p className="text-slate-700 leading-relaxed">
                  {ncaError ? `${ncaError}. ` : ""}{t("getEcpNcaUnavailableDesc")}
                </p>
                <a href="https://pki.gov.kz/ncalayer/" target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="bg-white" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    {t("getEcpDownloadNca")}
                  </Button>
                </a>
              </div>
            )}

            {ncaStatus === "IDLE" && (
              <p className="text-xs text-slate-500">{t("getEcpCheckingWait")}</p>
            )}
          </div>

          {/* What is NCALayer */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs text-indigo-900 space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-700" />
              {t("getEcpWhatIsNca")}
            </p>
            <p className="leading-relaxed">{t("getEcpWhatIsNcaDesc")}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a href="https://pki.gov.kz/ncalayer/" target="_blank" rel="noreferrer" className="text-indigo-700 underline font-medium flex items-center gap-1">
                pki.gov.kz/ncalayer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button
              onClick={() => setCurrentStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              disabled={ncaStatus === "CHECKING"}
            >
              {t("getEcpBtnNext")}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Get EDS at official portal ── */}
      {currentStep === 2 && (
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">{t("getEcpStep2Heading")}</h2>
            <p className="text-xs text-slate-500 mt-1">{t("getEcpStep2Info")}</p>
          </div>

          {/* Portal links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="https://pki.gov.kz" target="_blank" rel="noreferrer"
              className="p-5 rounded-xl border-2 border-indigo-200 bg-indigo-50/50 hover:border-indigo-400 transition-all group flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">pki.gov.kz</p>
                  <p className="text-[11px] text-slate-500">{t("getEcpPkiDesc")}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-indigo-500 ml-auto group-hover:text-indigo-700" />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{t("getEcpPkiBody")}</p>
            </a>

            <a href="https://egov.kz/cms/ru/articles/private_key" target="_blank" rel="noreferrer"
              className="p-5 rounded-xl border-2 border-teal-200 bg-teal-50/50 hover:border-teal-400 transition-all group flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">egov.kz</p>
                  <p className="text-[11px] text-slate-500">{t("getEcpEgovDesc")}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-teal-500 ml-auto group-hover:text-teal-700" />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{t("getEcpEgovBody")}</p>
            </a>
          </div>

          {/* Step-by-step instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">{t("getEcpPortalStepsTitle")}</h3>
            <ol className="space-y-3 text-xs text-slate-700">
              {[
                { n: 1, text: t("getEcpPortalStep1") },
                { n: 2, text: t("getEcpPortalStep2") },
                { n: 3, text: t("getEcpPortalStep3") },
                { n: 4, text: t("getEcpPortalStep4") },
                { n: 5, text: t("getEcpPortalStep5") },
              ].map(({ n, text }) => (
                <li key={n} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold">
                    {n}
                  </span>
                  <span className="leading-relaxed pt-0.5">{text}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Types of EDS available */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
            <p className="font-bold text-slate-900">{t("getEcpTypesTitle")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200">
                <Key className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{t("getEcpTypeAuth")}</p>
                  <p className="text-[11px] text-slate-500">{t("getEcpTypeAuthDesc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200">
                <FileText className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{t("getEcpTypeSign")}</p>
                  <p className="text-[11px] text-slate-500">{t("getEcpTypeSignDesc")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCurrentStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t("getEcpBtnBack")}
            </Button>
            <Button onClick={() => setCurrentStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {t("getEcpBtnNext")}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Storage & Certificate files ── */}
      {currentStep === 3 && (
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">{t("getEcpStep3Heading")}</h2>
            <p className="text-xs text-slate-500 mt-1">{t("getEcpStep3Info")}</p>
          </div>

          {/* Storage options described */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-indigo-700" />
                <p className="font-bold text-slate-900">{t("getEcpStoragePC")}</p>
              </div>
              <p className="text-slate-600 leading-relaxed">{t("getEcpStoragePCDesc")}</p>
            </div>
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-700" />
                <p className="font-bold text-slate-900">{t("getEcpStorageMobile")}</p>
              </div>
              <p className="text-slate-600 leading-relaxed">{t("getEcpStorageMobileDesc")}</p>
            </div>
          </div>

          {/* Instructions for saving key files */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-3">
            <p className="font-bold text-slate-900">{t("getEcpKeyFilesTitle")}</p>
            <ol className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span className="pt-0.5 leading-relaxed">{t("getEcpKeyFile1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span className="pt-0.5 leading-relaxed">{t("getEcpKeyFile2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span className="pt-0.5 leading-relaxed">{t("getEcpKeyFile3")}</span>
              </li>
            </ol>
          </div>

          {/* Password reminder */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{t("getEcpPasswordNotice")}</p>
              <p className="leading-relaxed">{t("getEcpPasswordNoticeBody")}</p>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCurrentStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t("getEcpBtnBack")}
            </Button>
            <Button onClick={() => setCurrentStep(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {t("getEcpBtnNext")}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Use EDS on the Platform ── */}
      {currentStep === 4 && (
        <div className="p-6 sm:p-8 rounded-2xl border border-emerald-200 bg-white shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{t("getEcpStep4Heading")}</h2>
            </div>
            <p className="text-xs text-slate-500">{t("getEcpStep4Info")}</p>
          </div>

          {/* How to use EDS on this platform */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">{t("getEcpUsePlatformTitle")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-indigo-600" />
                  <p className="font-bold text-slate-900">{t("getEcpUseLogin")}</p>
                </div>
                <p className="text-slate-600 leading-relaxed">{t("getEcpUseLoginDesc")}</p>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="mt-1 w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    {t("getEcpBtnLogin")}
                  </Button>
                </Link>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <p className="font-bold text-slate-900">{t("getEcpUseSign")}</p>
                </div>
                <p className="text-slate-600 leading-relaxed">{t("getEcpUseSignDesc")}</p>
                <Link href="/dashboard/applications/new">
                  <Button variant="outline" size="sm" className="mt-1 w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    {t("getEcpBtnNewApp")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Bind EDS to account */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 text-xs space-y-2">
            <p className="font-bold text-indigo-900 flex items-center gap-2">
              <Key className="w-4 h-4" />
              {t("getEcpBindTitle")}
            </p>
            <p className="text-slate-700 leading-relaxed">{t("getEcpBindDesc")}</p>
            <Link href="/dashboard/ecp">
              <Button variant="primary" size="sm" className="mt-1" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                {t("getEcpBtnBind")}
              </Button>
            </Link>
          </div>

          {/* Official resources */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">{t("getEcpOfficialLinks")}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <a href="https://pki.gov.kz" target="_blank" rel="noreferrer" className="text-indigo-600 underline hover:text-indigo-800 flex items-center gap-1">
                pki.gov.kz <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://egov.kz" target="_blank" rel="noreferrer" className="text-indigo-600 underline hover:text-indigo-800 flex items-center gap-1">
                egov.kz <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://pki.gov.kz/ncalayer/" target="_blank" rel="noreferrer" className="text-indigo-600 underline hover:text-indigo-800 flex items-center gap-1">
                NCALayer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCurrentStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t("getEcpBtnBack")}
            </Button>
            <Link href="/dashboard/ecp">
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {t("getEcpBtnGoToDashboard")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
