"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/LanguageContext";
import {
  checkNCALayerAvailability,
  getNCALayerKeyInfo,
  signDataWithNCALayer,
} from "@/lib/ncalayer";

export interface EcpManagementClientViewProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    roleCode: string;
    iin?: string | null;
  };
  certificates: Array<{
    id: string;
    subjectType: string;
    ownerName: string;
    iin?: string | null;
    bin?: string | null;
    organizationName?: string | null;
    keyFingerprint: string;
    serialNumber?: string | null;
    algorithm: string;
    issuer: string;
    source: string;
    status: string;
    issuedAt: string | Date;
    expiresAt: string | Date;
  }>;
  organizationMemberships: Array<{
    id: string;
    role: string;
    powerBasis?: string | null;
    organization: {
      id: string;
      bin: string;
      name: string;
      legalAddress?: string | null;
      verified: boolean;
    };
  }>;
  activityLogs: Array<{
    id: string;
    action: string;
    details?: string | null;
    createdAt: string | Date;
  }>;
}

export function EcpManagementClientView({
  currentUser,
  certificates,
  organizationMemberships,
  activityLogs,
}: EcpManagementClientViewProps) {
  const { toast } = useToast();
  const { t, locale } = useLanguage();

  const [ncaStatus, setNcaStatus] = useState<"IDLE" | "CHECKING" | "AVAILABLE" | "UNAVAILABLE">("IDLE");
  const [ncaError, setNcaError] = useState<string | null>(null);
  const [isBindingEcp, setIsBindingEcp] = useState(false);

  const checkNCALayer = async () => {
    setNcaStatus("CHECKING");
    setNcaError(null);
    try {
      const res = await checkNCALayerAvailability(2500);
      if (res.isAvailable) {
        setNcaStatus("AVAILABLE");
      } else {
        setNcaStatus("UNAVAILABLE");
        setNcaError(res.error || t("ncaNotRunningPrompt"));
      }
    } catch (e: unknown) {
      setNcaStatus("UNAVAILABLE");
      setNcaError(e instanceof Error ? e.message : t("ncaError"));
    }
  };

  // Bind an official NCALayer certificate to current user
  const handleBindNewEcp = async () => {
    setIsBindingEcp(true);
    try {
      // 1. Get challenge
      const chRes = await fetch("/api/auth/challenge");
      const { challenge } = await chRes.json();

      // 2. Read cert from NCALayer
      const certInfo = await getNCALayerKeyInfo("PKCS12");

      // 3. Sign challenge via NCALayer CMS
      const challengeBase64 = Buffer.from(challenge).toString("base64");
      const signRes = await signDataWithNCALayer(challengeBase64, "PKCS12", "", false, certInfo);

      // 4. Send to binding API
      const res = await fetch("/api/auth/ecp/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificate: certInfo,
          signature: signRes.signature,
          challenge,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("ecpBindFailed"));

      toast("success", t("ecpBoundSuccess"), `${t("ecpBoundSuccessDetail")}: ${certInfo.ownerName}`);
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("ecpBindError");
      toast("error", t("loginByEcp"), msg);
    } finally {
      setIsBindingEcp(false);
    }
  };

  const activeCert = certificates.find((c) => c.status === "ACTIVE") || certificates[0];
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "kk" ? "kk-KZ" : "en-US";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 text-slate-800">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("ecpManagementHeading")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("ecpManagementSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/get-ecp">
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              {t("howToGetStateEcp")}
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleBindNewEcp}
            isLoading={isBindingEcp}
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            {t("bindEcpNcaLayer")}
          </Button>
        </div>
      </div>

      {/* NCALayer Diagnostics Box */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              ncaStatus === "AVAILABLE"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : ncaStatus === "UNAVAILABLE"
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}>
              {ncaStatus === "AVAILABLE" ? (
                <Wifi className="w-5 h-5" />
              ) : ncaStatus === "UNAVAILABLE" ? (
                <WifiOff className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {t("ncalayerConnectionStatus")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("ncalayerLocalPortInfo")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {ncaStatus === "AVAILABLE" && (
              <Badge variant="success" size="md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t("ncaConnected")}
              </Badge>
            )}
            {ncaStatus === "UNAVAILABLE" && (
              <Badge variant="danger" size="md">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> {t("ncaDisconnected")}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={checkNCALayer}
              isLoading={ncaStatus === "CHECKING"}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              {t("checkNCALayer")}
            </Button>
          </div>
        </div>

        {ncaStatus === "UNAVAILABLE" && (
          <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-2">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              {t("ncaNotRunningNotice")}
            </p>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              {ncaError || t("ncaNotRunningDetail")}
            </p>
            <div className="flex gap-2 pt-1">
              <a
                href="https://pki.gov.kz/ncalayer/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3 py-1 bg-white border border-rose-300 rounded text-rose-700 hover:bg-rose-50 font-semibold text-[11px]"
              >
                {t("downloadNcaLayer")} →
              </a>
              <Link
                href="/get-ecp"
                className="inline-flex items-center px-3 py-1 text-indigo-700 hover:underline font-semibold text-[11px]"
              >
                {t("stepByStepInstructions")} →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Active Certificate Primary Card */}
      {activeCert ? (
        <div className="p-6 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/50 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {t("activeStateEcpCertificate")}
                </span>
                <h2 className="text-lg font-black text-slate-900">{activeCert.ownerName}</h2>
              </div>
            </div>
            <Badge variant="success" size="md">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t("statusActive")}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t("identifier")}</span>
              <span className="font-bold text-slate-900 font-mono">
                {activeCert.iin ? `ИИН: ${activeCert.iin}` : activeCert.bin ? `БИН: ${activeCert.bin}` : currentUser.email}
              </span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t("certificateIssuer")}</span>
              <span className="font-bold text-slate-900">{activeCert.issuer}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t("algorithm")}</span>
              <span className="font-bold text-slate-900 font-mono">{activeCert.algorithm}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t("validUntil")}</span>
              <span className="font-bold text-slate-900">
                {new Date(activeCert.expiresAt).toLocaleDateString(dateLocale)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-100/80 font-mono text-[11px] text-slate-600 truncate">
            {t("publicKeyFingerprint")}: <strong className="text-slate-900">{activeCert.keyFingerprint}</strong>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">{t("noEcpBoundYet")}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t("noEcpBoundDesc")}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/get-ecp">
              <Button variant="outline" size="sm">
                {t("howToGetEcp")}
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBindNewEcp}
              isLoading={isBindingEcp}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {t("bindEcpViaNcalayer")}
            </Button>
          </div>
        </div>
      )}

      {/* Verified Certificates List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {t("allVerifiedEcpCertificates")}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {certificates.length} {t("certificatesCount")}
          </span>
        </div>

        {certificates.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {certificates.map((cert) => (
              <div key={cert.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{cert.ownerName}</span>
                    <Badge variant={cert.status === "ACTIVE" ? "success" : "danger"} size="sm">
                      {cert.status === "ACTIVE" ? t("statusActive") : cert.status}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    {cert.iin && `ИИН: ${cert.iin} `}
                    {cert.bin && `| БИН: ${cert.bin} `}
                    {cert.organizationName && `(${cert.organizationName})`}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400">
                    {cert.issuer} • {cert.algorithm} • {t("fingerprintShort")}: {cert.keyFingerprint.substring(0, 16)}...
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-500 shrink-0">
                  <p>{t("validUntil")}: <strong className="text-slate-800">{new Date(cert.expiresAt).toLocaleDateString(dateLocale)}</strong></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            {t("noCertificatesInHistory")}
          </div>
        )}
      </div>

      {/* Organizations Section */}
      {organizationMemberships.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {t("legalEntityMemberships")}
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {organizationMemberships.map((m) => (
              <div key={m.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{m.organization.name}</h4>
                  <p className="text-slate-500 font-mono text-[11px]">БИН: {m.organization.bin}</p>
                  <p className="text-slate-400 text-[11px]">{m.organization.legalAddress || t("addressNotSpecified")}</p>
                </div>
                <div className="text-right text-[11px]">
                  <Badge variant="indigo" size="sm">
                    {m.role === "HEAD" ? t("firstLeader") : t("authorizedSigner")}
                  </Badge>
                  {m.powerBasis && <p className="text-slate-500 mt-1">{m.powerBasis}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cryptographic Activity Logs */}
      {activityLogs.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              {t("recentCryptoAuditLogs")}
            </h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3 sm:p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{log.action}</p>
                  <p className="text-slate-500 text-[11px]">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleString(dateLocale)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
