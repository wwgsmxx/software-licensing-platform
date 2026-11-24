"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, Key, Hash, ShieldAlert, Cpu, ChevronDown, ChevronUp, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { useLanguage } from "@/lib/LanguageContext";

export interface DigitalSignatureCardProps {
  signature: {
    payloadHash: string;
    signature: string;
    algorithm: string;
    signatureType?: "NCALAYER" | "SIMULATED";
    keyFingerprint: string;
    verificationId: string;
    signerName: string;
    signerEmail: string;
    signerIin?: string | null;
    signerBin?: string | null;
    certificateIssuer?: string | null;
    signedAt: string | Date;
    isVerified?: boolean;
  };
  onReverify?: () => void;
}

export const DigitalSignatureCard: React.FC<DigitalSignatureCardProps> = ({
  signature,
  onReverify,
}) => {
  const { t, locale } = useLanguage();
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "kk" ? "kk-KZ" : "en-US";
  const signedDateFormatted = new Date(signature.signedAt).toLocaleString(dateLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const isVerified = signature.isVerified !== false;
  const sigType = signature.signatureType || (signature.algorithm?.includes("SIMULATED") ? "SIMULATED" : "NCALAYER");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm text-slate-800">
      {/* Official Signature Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900">
                {t("sigCardTitle")}
              </h4>
              {sigType === "NCALAYER" && (
                <Badge variant="success" size="sm">
                  {t("ecpSourceNcaLayer")}
                </Badge>
              )}
              {sigType === "SIMULATED" && (
                <Badge variant="warning" size="sm">
                  {t("simulatedTestSignature")}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {sigType === "NCALAYER"
                ? t("signedViaNcalayerOfficial")
                : t("signedViaSimulatedModule")}
            </p>
          </div>
        </div>

        {isVerified ? (
          <Badge variant="success" size="md" className="shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t("sigCardValid")}</span>
          </Badge>
        ) : (
          <Badge variant="danger" size="md" className="shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
            <span>{t("sigCardInvalid")}</span>
          </Badge>
        )}
      </div>

      {/* Primary citizen view: signer & verification ID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded border border-slate-200/80">
        <div>
          <span className="text-slate-500 block text-[11px] font-medium">{t("sigCardSignedBy")}</span>
          <span className="font-semibold text-slate-800">{signature.signerName}</span>
          {signature.signerIin && (
            <span className="block text-indigo-700 font-mono text-[10px]">ИИН: {signature.signerIin}</span>
          )}
          {signature.signerBin && (
            <span className="block text-teal-700 font-mono text-[10px]">БИН: {signature.signerBin}</span>
          )}
          <span className="block text-slate-500 text-[11px]">{signature.signerEmail}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px] font-medium">{t("sigCardSignedAt")}</span>
          <span className="font-semibold text-slate-800">{signedDateFormatted}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px] font-medium">{t("sigCardVerificationId")}</span>
          <span className="font-mono font-semibold text-blue-900 text-[11px]">{signature.verificationId}</span>
        </div>
      </div>

      {/* Explanatory notice */}
      <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/60 p-3 rounded border border-blue-100">
        {t("sigCardExplanation")}
      </p>

      {/* Collapsible Technical Details (SHA-256, Ed25519, Fingerprint) */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowTechDetails(!showTechDetails)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 focus:outline-none"
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
          <div className="mt-3 p-4 rounded bg-slate-100/70 border border-slate-200 space-y-3 text-xs animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-slate-600 font-medium flex items-center gap-1 text-[11px]">
                  <Hash className="w-3 h-3 text-slate-500" /> {t("sigCardPayloadHash")}
                </span>
                <p className="font-mono bg-white p-2 rounded border border-slate-200 break-all text-[11px] text-slate-700">
                  {signature.payloadHash}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-600 font-medium flex items-center gap-1 text-[11px]">
                  <Key className="w-3 h-3 text-slate-500" /> {t("sigCardKeyFingerprint")}
                </span>
                <p className="font-mono bg-white p-2 rounded border border-slate-200 break-all text-[11px] text-slate-700">
                  {signature.keyFingerprint}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-600 font-medium flex items-center gap-1 text-[11px]">
                <Cpu className="w-3 h-3 text-slate-500" /> {t("sigCardSignatureBuffer")}
              </span>
              <p className="font-mono bg-white p-2 rounded border border-slate-200 break-all text-[11px] text-slate-600 max-h-20 overflow-y-auto">
                {signature.signature}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>{t("algorithm")}: {signature.algorithm}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(signature.signature)}
                className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? t("copied") : t("copySignatureHex")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
