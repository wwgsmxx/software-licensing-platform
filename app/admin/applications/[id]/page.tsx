"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  ArrowLeft,
  FileCheck2,
  Clock,
  Send,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DigitalSignatureCard } from "@/components/ui/DigitalSignatureCard";
import { ProgressTimeline } from "@/components/ui/ProgressTimeline";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/LanguageContext";

export default function AdminReviewPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [app, setApp] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Decision Modal States
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [requestInfoModal, setRequestInfoModal] = useState(false);

  const [rejectionReason, setRejectionReason] = useState("");
  const [requestedInfoMessage, setRequestedInfoMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchApplication = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/applications/${id}`);
      if (!res.ok) throw new Error("Application not found");
      const data = await res.json();
      setApp(data);
    } catch {
      toast("error", "Error", "Failed to load application details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  if (isLoading || !app) {
    return <div className="p-12 text-center text-xs text-muted-foreground">Loading application audit data...</div>;
  }

  // Action Handler: Approve
  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/applications/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");

      toast("success", "Application Approved!", `Digital License ${data.license ? data.license.id : ""} generated.`);
      setApproveModal(false);
      fetchApplication();
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Approval failed";
      toast("error", "Error", msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Action Handler: Reject
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast("error", "Reason Required", "Please enter a valid rejection reason.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/applications/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason: rejectionReason }),
      });

      if (!res.ok) throw new Error("Rejection failed");

      toast("error", "Application Rejected", "Rejection recorded and notification sent to applicant.");
      setRejectModal(false);
      fetchApplication();
      router.refresh();
    } catch {
      toast("error", "Error", "Failed to reject application.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Action Handler: Request Additional Info
  const handleRequestInfo = async () => {
    if (!requestedInfoMessage.trim()) {
      toast("error", "Message Required", "Please specify the requested information.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/applications/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REQUEST_INFO", message: requestedInfoMessage }),
      });

      if (!res.ok) throw new Error("Request failed");

      toast("info", "Information Requested", "Applicant has been notified.");
      setRequestInfoModal(false);
      fetchApplication();
      router.refresh();
    } catch {
      toast("error", "Error", "Failed to send information request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const { locale } = useLanguage();

  const TEXTS = {
    en: {
      backToQueue: "Back to Review Queue",
      applicant: "Applicant",
      approveBtn: "Approve & Issue License",
      requestInfoBtn: "Request Info",
      rejectBtn: "Reject",
      workflowState: "Current Application State",
      softwareDetails: "Software Product Details",
      licenseTerms: "Requested License Terms",
      developer: "Developer",
      category: "Category",
      platform: "Platform",
      seats: "Authorized Users / Seats",
      documentsTitle: "Submitted Documents & Integrity",
      download: "Inspect",
      checksumVerified: "SHA-256 Checksum Verified",
      approveModalTitle: "Confirm Application Approval",
      approveModalDesc: "This action will approve the application and automatically issue an official electronic digital license certificate.",
      approveModalNotice: "The system will verify signature integrity, generate an immutable certificate ID, register the license in the public registry, and notify the applicant.",
      confirmApproveBtn: "Confirm Approval",
      rejectModalTitle: "Reject Application",
      rejectModalDesc: "Please provide a clear justification and reason for rejecting the application.",
      rejectionReasonLabel: "Rejection Reason *",
      rejectionReasonPlaceholder: "Specify non-compliance reasons or missing legal criteria...",
      confirmRejectBtn: "Confirm Rejection",
      requestInfoModalTitle: "Request Additional Information",
      requestInfoModalDesc: "Notify applicant to upload missing documentation or update application details.",
      requestedInfoLabel: "Required Information Details *",
      requestedInfoPlaceholder: "Specify what documents or details need to be updated by the applicant...",
      sendRequestBtn: "Send Request",
      cancel: "Cancel",
    },
    kk: {
      backToQueue: "Қарау кезегіне оралу",
      applicant: "Өтініш беруші",
      approveBtn: "Одобрить және лицензия беру",
      requestInfoBtn: "Қосымша мәлімет сұрау",
      rejectBtn: "Қабылдамау",
      workflowState: "Өтінімнің ағымдағы күйі",
      softwareDetails: "Бағдарламалық өнім туралы мәлімет",
      licenseTerms: "Сұралған лицензия шарттары",
      developer: "Әзірлеуші",
      category: "Санаты",
      platform: "Платформа",
      seats: "Рұқсат етілген пайдаланушылар саны",
      documentsTitle: "Ұсынылған құжаттар және тұтастық",
      download: "Қарау",
      checksumVerified: "SHA-256 бақылау сомасы тексерілді",
      approveModalTitle: "Өтінімді мақұлдауды растау",
      approveModalDesc: "Бұл әрекет өтінімді мақұлдап, ресми электрондық сандық лицензия сертификатын автоматты түрде береді.",
      approveModalNotice: "Жүйе қолтаңба тұтастығын тексереді, өзгермейтін сертификат нөмірін жасайды және мемлекеттік тізілімге енгізеді.",
      confirmApproveBtn: "Мақұлдауды растау",
      rejectModalTitle: "Өтінімді қабылдамау",
      rejectModalDesc: "Өтінімді қабылдамаудың нақты себебі мен негіздемесін көрсетіңіз.",
      rejectionReasonLabel: "Қабылдамау себебі *",
      rejectionReasonPlaceholder: "Сәйкессіздік себептерін немесе жетіспейтін құжаттарды көрсетіңіз...",
      confirmRejectBtn: "Қабылдамауды растау",
      requestInfoModalTitle: "Қосымша ақпарат сұрау",
      requestInfoModalDesc: "Өтініш берушіге жетіспейтін құжаттарды жүктеу немесе мәліметтерді нақтылау туралы хабарлама жіберу.",
      requestedInfoLabel: "Қажетті ақпарат сипаттамасы *",
      requestedInfoPlaceholder: "Өтініш беруші қандай құжаттарды қосуы немесе түзетуі керек екенін жазыңыз...",
      sendRequestBtn: "Сұрауды жіберу",
      cancel: "Болдырмау",
    },
    ru: {
      backToQueue: "Назад к очереди заявок",
      applicant: "Заявитель",
      approveBtn: "Одобрить и выдать лицензию",
      requestInfoBtn: "Запросить сведения",
      rejectBtn: "Отклонить",
      workflowState: "Текущее состояние заявления",
      softwareDetails: "Сведения о программном обеспечении",
      licenseTerms: "Параметры запрашиваемой лицензии",
      developer: "Разработчик",
      category: "Категория",
      platform: "Платформа",
      seats: "Количество пользователей / рабочих мест",
      documentsTitle: "Приложенные документы и проверка целостности",
      download: "Просмотреть",
      checksumVerified: "Контрольная сумма SHA-256 проверена",
      approveModalTitle: "Подтверждение одобрения заявления",
      approveModalDesc: "Это действие одобрит заявление и автоматически выпустит официальный электронный сертификат лицензии.",
      approveModalNotice: "Система проверит цифровую подпись, сформирует уникальный номер документа, внесет запись в государственный реестр и уведомит заявителя.",
      confirmApproveBtn: "Подтвердить одобрение",
      rejectModalTitle: "Отклонение заявления",
      rejectModalDesc: "Пожалуйста, укажите причину отклонения для заявителя.",
      rejectionReasonLabel: "Причина отклонения *",
      rejectionReasonPlaceholder: "Укажите несоответствие требованиям или недостающие материалы...",
      confirmRejectBtn: "Подтвердить отклонение",
      requestInfoModalTitle: "Запрос дополнительных сведений",
      requestInfoModalDesc: "Уведомить заявителя о необходимости приложить недостающие документы или скорректировать данные.",
      requestedInfoLabel: "Содержание запроса *",
      requestedInfoPlaceholder: "Опишите, какие именно документы или сведения требуются от заявителя...",
      sendRequestBtn: "Отправить запрос",
      cancel: "Отмена",
    },
  };

  const t = TEXTS[locale];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/applications"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t.backToQueue}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 font-mono">№ {app.id}</h1>
            <StatusBadge status={app.status} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.applicant}: <strong className="text-slate-800">{app.user.name}</strong> ({app.user.email})
          </p>
        </div>

        {/* Reviewer Action Buttons */}
        {app.status === "LICENSE_ISSUED" || app.status === "APPROVED" ? (
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {locale === "ru" ? "Лицензия выпущена" : locale === "kk" ? "Лицензия берілді" : "License Issued"}
              </span>
            </div>
            {app.license && (
              <Link href={`/verify-license?id=${app.license.id}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  {locale === "ru" ? "Проверить сертификат" : locale === "kk" ? "Сертификатты тексеру" : "Verify Certificate"}
                </Button>
              </Link>
            )}
          </div>
        ) : app.status === "REJECTED" ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>
              {locale === "ru" ? "Заявление отклонено" : locale === "kk" ? "Өтінім қабылданбады" : "Application Rejected"}
            </span>
          </div>
        ) : app.status === "CANCELLED" ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <span>
              {locale === "ru" ? "Заявление отозвано" : locale === "kk" ? "Өтінім тоқтатылды" : "Cancelled"}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="success"
              size="md"
              onClick={() => setApproveModal(true)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {t.approveBtn}
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => setRequestInfoModal(true)}
              leftIcon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
            >
              {t.requestInfoBtn}
            </Button>

            <Button
              variant="destructive"
              size="md"
              onClick={() => setRejectModal(true)}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              {t.rejectBtn}
            </Button>
          </div>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          {t.workflowState}
        </h3>
        <ProgressTimeline currentStatus={app.status} />
      </div>

      {/* Grid: Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">{t.softwareDetails}</h3>
          <div>
            <p className="text-base font-bold text-primary">{app.software.name}</p>
            <p className="text-slate-500 font-mono text-[11px]">v{app.software.version}</p>
          </div>
          <p className="text-slate-600"><span className="text-slate-400">{t.developer}:</span> {app.software.developer}</p>
          <p className="text-slate-600"><span className="text-slate-400">{t.category}:</span> {app.software.softwareType} ({app.software.platform})</p>
          {app.software.description && (
            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed mt-2">
              {app.software.description}
            </p>
          )}
        </div>

        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">{t.licenseTerms}</h3>
          <div>
            <p className="text-base font-bold text-slate-900">{app.licenseType}</p>
            <p className="text-slate-500">{app.licenseDuration}</p>
          </div>
          <p className="text-slate-600"><span className="text-slate-400">{t.seats}:</span> {app.numUsers}</p>
          {app.licenseDescription && (
            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed mt-2">
              {app.licenseDescription}
            </p>
          )}
        </div>
      </div>

      {/* Digital Signature Audit Card */}
      {app.digitalSignature && (
        <DigitalSignatureCard signature={app.digitalSignature} />
      )}

      {/* Documents Verification List */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          {t.documentsTitle} ({app.documents.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {app.documents.map((doc: any) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-primary/10 text-primary rounded-md shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-slate-900 truncate">{doc.originalName}</p>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    {t.checksumVerified}
                  </p>
                </div>
              </div>

              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="shrink-0 ml-2">
                <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  {t.download}
                </Button>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* APPROVE MODAL */}
      <Modal
        isOpen={approveModal}
        onClose={() => setApproveModal(false)}
        title={t.approveModalTitle}
        description={t.approveModalDesc}
        footer={
          <>
            <Button variant="outline" onClick={() => setApproveModal(false)}>
              {t.cancel}
            </Button>
            <Button variant="success" isLoading={isProcessing} onClick={handleApprove}>
              {t.confirmApproveBtn}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          {t.approveModalNotice}
        </p>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        title={t.rejectModalTitle}
        description={t.rejectModalDesc}
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectModal(false)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" isLoading={isProcessing} onClick={handleReject}>
              {t.confirmRejectBtn}
            </Button>
          </>
        }
      >
        <Textarea
          label={t.rejectionReasonLabel}
          placeholder={t.rejectionReasonPlaceholder}
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
      </Modal>

      {/* REQUEST INFO MODAL */}
      <Modal
        isOpen={requestInfoModal}
        onClose={() => setRequestInfoModal(false)}
        title={t.requestInfoModalTitle}
        description={t.requestInfoModalDesc}
        footer={
          <>
            <Button variant="outline" onClick={() => setRequestInfoModal(false)}>
              {t.cancel}
            </Button>
            <Button variant="primary" isLoading={isProcessing} onClick={handleRequestInfo}>
              {t.sendRequestBtn}
            </Button>
          </>
        }
      >
        <Textarea
          label={t.requestedInfoLabel}
          placeholder={t.requestedInfoPlaceholder}
          rows={4}
          value={requestedInfoMessage}
          onChange={(e) => setRequestedInfoMessage(e.target.value)}
        />
      </Modal>
    </div>
  );
}
