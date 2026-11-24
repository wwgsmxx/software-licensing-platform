"use client";

import React from "react";
import { Check, XCircle } from "lucide-react";
import { getStatusStepNumber, ApplicationStatus } from "@/lib/state-machine";
import { useLanguage } from "@/lib/LanguageContext";

export interface ProgressTimelineProps {
  currentStatus: string;
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ currentStatus }) => {
  const { t } = useLanguage();
  const currentStep = getStatusStepNumber(currentStatus as ApplicationStatus);
  const isRejected = currentStatus === "REJECTED";
  const isCancelled = currentStatus === "CANCELLED";

  const STEPS = [
    { step: 1, title: t("timelineDraft"), desc: t("timelineSoftwareInfo") },
    { step: 2, title: t("timelineDocuments"), desc: t("timelineUploadSpecs") },
    { step: 3, title: t("timelineSigned"), desc: t("timelineEd25519") },
    { step: 4, title: t("timelineSubmitted"), desc: t("timelineSentToQueue") },
    { step: 5, title: t("timelineReview"), desc: t("timelineAuditCheck") },
    { step: 6, title: t("timelineApproved"), desc: t("timelineVerification") },
    { step: 7, title: t("timelineLicenseIssued"), desc: t("timelineCertActive") },
  ];

  return (
    <div className="w-full py-2 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[650px] relative px-4">
        {/* Progress Line */}
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{
              width: isRejected || isCancelled ? "0%" : `${Math.min(100, Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * 100))}%`,
            }}
          />
        </div>

        {STEPS.map((s) => {
          const isCompleted = !isRejected && !isCancelled && currentStep > s.step;
          const isCurrent = !isRejected && !isCancelled && currentStep === s.step;

          return (
            <div key={s.step} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors border-2 ${
                  isCompleted
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : isCurrent
                    ? "bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-600/20"
                    : "bg-white border-slate-300 text-slate-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <span>{s.step}</span>
                )}
              </div>

              <div className="text-center mt-2 max-w-[85px]">
                <p
                  className={`text-[11px] font-semibold leading-tight ${
                    isCurrent ? "text-indigo-600" : isCompleted ? "text-slate-800" : "text-slate-500"
                  }`}
                >
                  {s.title}
                </p>
                <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {(isRejected || isCancelled) && (
        <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center justify-center gap-2">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            {t("timelineEndedStatus")}: <strong>{currentStatus === "REJECTED" ? t("statusBadgeRejected") : t("statusBadgeCancelled")}</strong>
          </span>
        </div>
      )}
    </div>
  );
};
