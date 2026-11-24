"use client";

import React from "react";
import { Badge } from "./Badge";
import {
  FileEdit,
  FileCheck2,
  FileKey2,
  Send,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Award,
  Ban,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "sm" }) => {
  const { t } = useLanguage();

  switch (status) {
    case "DRAFT":
      return (
        <Badge variant="default" size={size}>
          <FileEdit className="w-3 h-3 text-slate-500" />
          <span>{t("statusBadgeDraft")}</span>
        </Badge>
      );
    case "DOCUMENTS_REQUIRED":
      return (
        <Badge variant="warning" size={size}>
          <FileCheck2 className="w-3 h-3 text-amber-700" />
          <span>{t("statusBadgeDocsRequired")}</span>
        </Badge>
      );
    case "SIGNED":
      return (
        <Badge variant="indigo" size={size}>
          <FileKey2 className="w-3 h-3 text-blue-700" />
          <span>{t("statusBadgeSigned")}</span>
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge variant="info" size={size}>
          <Send className="w-3 h-3 text-sky-700" />
          <span>{t("statusBadgeSubmitted")}</span>
        </Badge>
      );
    case "UNDER_REVIEW":
      return (
        <Badge variant="warning" size={size}>
          <Eye className="w-3 h-3 text-amber-700" />
          <span>{t("statusBadgeUnderReview")}</span>
        </Badge>
      );
    case "ADDITIONAL_INFO_REQUIRED":
      return (
        <Badge variant="warning" size={size}>
          <AlertTriangle className="w-3 h-3 text-amber-700" />
          <span>{t("statusBadgeInfoRequired")}</span>
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant="success" size={size}>
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          <span>{t("statusBadgeApproved")}</span>
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="danger" size={size}>
          <XCircle className="w-3 h-3 text-rose-700" />
          <span>{t("statusBadgeRejected")}</span>
        </Badge>
      );
    case "LICENSE_ISSUED":
    case "ACTIVE":
      return (
        <Badge variant="success" size={size}>
          <Award className="w-3 h-3 text-emerald-700" />
          <span>{t("statusBadgeLicenseIssued")}</span>
        </Badge>
      );
    case "EXPIRING_SOON":
      return (
        <Badge variant="warning" size={size}>
          <Clock className="w-3 h-3 text-amber-700" />
          <span>{t("statusBadgeExpiringSoon")}</span>
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge variant="default" size={size}>
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{t("statusBadgeExpired")}</span>
        </Badge>
      );
    case "SUSPENDED":
      return (
        <Badge variant="warning" size={size}>
          <AlertTriangle className="w-3 h-3 text-amber-700" />
          <span>{t("statusBadgeSuspended")}</span>
        </Badge>
      );
    case "REVOKED":
      return (
        <Badge variant="danger" size={size}>
          <Ban className="w-3 h-3 text-rose-700" />
          <span>{t("statusBadgeRevoked")}</span>
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="default" size={size}>
          <Ban className="w-3 h-3 text-slate-500" />
          <span>{t("statusBadgeCancelled")}</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="default" size={size}>
          {status}
        </Badge>
      );
  }
};
