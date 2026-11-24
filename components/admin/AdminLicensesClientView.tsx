"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldAlert, PauseCircle, PlayCircle, CalendarPlus, XOctagon, AlertTriangle, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/LanguageContext";

export interface AdminLicenseRow {
  id: string;
  licenseKey: string;
  softwareName: string;
  version: string;
  userName: string;
  userEmail: string;
  licenseType: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
}

export function AdminLicensesClientView({ licenses: initialLicenses }: { licenses: AdminLicenseRow[] }) {
  const [licenses, setLicenses] = useState(initialLicenses);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    licenseId: string;
    action: "SUSPEND" | "REVOKE" | "EXTEND" | "REINSTATE";
    title: string;
    message: string;
  }>({
    isOpen: false,
    licenseId: "",
    action: "SUSPEND",
    title: "",
    message: "",
  });

  const { toast } = useToast();
  const { locale } = useLanguage();
  const router = useRouter();

  const activeCount = licenses.filter((l) => l.status === "ACTIVE").length;
  const suspendedCount = licenses.filter((l) => l.status === "SUSPENDED").length;
  const revokedCount = licenses.filter((l) => l.status === "REVOKED").length;

  const handleActionConfirm = async () => {
    const { licenseId, action } = confirmModal;
    setUpdatingId(licenseId);
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    try {
      const res = await fetch(`/api/admin/licenses/${licenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update license");

      setLicenses((prev) =>
        prev.map((l) =>
          l.id === licenseId
            ? {
                ...l,
                status: data.license.status,
                expiresAt: new Date(data.license.expiresAt).toLocaleDateString(),
              }
            : l
        )
      );

      toast("info", "Статус обновлен", `Лицензия ${licenseId}: статус изменен.`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка выполнения операции";
      toast("error", "Ошибка", msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const openConfirm = (licenseId: string, action: "SUSPEND" | "REVOKE" | "EXTEND" | "REINSTATE") => {
    let title = "";
    let message = "";

    if (action === "SUSPEND") {
      title = "Приостановить действие лицензии?";
      message = `Вы действительно хотите приостановить действие лицензии № ${licenseId}? Пользователь временно утратит право использования.`;
    } else if (action === "REVOKE") {
      title = "Отозвать лицензию безвозвратно?";
      message = `Внимание: отзыв лицензии № ${licenseId} является необратимой операцией. Лицензионный сертификат будет аннулирован.`;
    } else if (action === "EXTEND") {
      title = "Продлить срок действия лицензии?";
      message = `Срок действия лицензии № ${licenseId} будет продлён на 1 год.`;
    } else {
      title = "Возобновить действие лицензии?";
      message = `Действие лицензии № ${licenseId} будет восстановлено в активный статус.`;
    }

    setConfirmModal({
      isOpen: true,
      licenseId,
      action,
      title,
      message,
    });
  };

  const TEXTS = {
    en: {
      title: "License Lifecycle Management",
      subtitle: "Official register of issued software licenses, renewal, suspension, and revocation operations.",
      licenseKey: "License Number",
      swProduct: "Software Name",
      licUser: "Licensee",
      type: "Category",
      status: "Status",
      expDate: "Expires On",
      action: "Actions",
      inspect: "Certificate",
      suspendBtn: "Suspend",
      reinstateBtn: "Activate",
      extendBtn: "Extend (+1y)",
      revokeBtn: "Revoke",
      searchPlaceholder: "Search licenses by number, licensee, or software...",
      emptyTitle: "No licenses found",
      activeTitle: "Active Licenses",
      suspendedTitle: "Suspended",
      revokedTitle: "Revoked",
      confirmBtn: "Confirm Action",
      cancelBtn: "Cancel",
    },
    kk: {
      title: "Лицензияларды басқару",
      subtitle: "Берілген лицензиялардың өмірлік циклін басқару, тоқтату, қайтарып алу және мерзімін ұзарту.",
      licenseKey: "Лицензия нөмірі",
      swProduct: "БЖ атауы",
      licUser: "Лицензиат",
      type: "Санаты",
      status: "Мәртебесі",
      expDate: "Қолданылу мерзімі",
      action: "Әрекеттер",
      inspect: "Сертификат",
      suspendBtn: "Тоқтата тұру",
      reinstateBtn: "Жандандыру",
      extendBtn: "Ұзарту (+1 жыл)",
      revokeBtn: "Қайтарып алу",
      searchPlaceholder: "Лицензияларды нөмірі, лицензиат немесе БЖ бойынша іздеу...",
      emptyTitle: "Лицензиялар табылмады",
      activeTitle: "Белсенді",
      suspendedTitle: "Тоқтатылған",
      revokedTitle: "Қайтарып алынған",
      confirmBtn: "Растау",
      cancelBtn: "Болдырмау",
    },
    ru: {
      title: "Управление лицензиями",
      subtitle: "Официальный реестр лицензий программного обеспечения, продление, приостановление и отзыв.",
      licenseKey: "Номер лицензии",
      swProduct: "Наименование ПО",
      licUser: "Лицензиат",
      type: "Категория",
      status: "Статус",
      expDate: "Срок действия",
      action: "Действия",
      inspect: "Сертификат",
      suspendBtn: "Приостановить",
      reinstateBtn: "Возобновить",
      extendBtn: "Продлить (+1 г)",
      revokeBtn: "Отозвать",
      searchPlaceholder: "Поиск по номеру лицензии, лицензиату или ПО...",
      emptyTitle: "Лицензии не найдены",
      activeTitle: "Действующие",
      suspendedTitle: "Приостановленные",
      revokedTitle: "Отозванные",
      confirmBtn: "Подтвердить действие",
      cancelBtn: "Отмена",
    },
  };

  const t = TEXTS[locale];

  const columns = [
    {
      header: t.licenseKey,
      cell: (row: AdminLicenseRow) => (
        <span className="font-mono font-bold text-slate-900 text-xs">№ {row.licenseKey}</span>
      ),
    },
    {
      header: t.swProduct,
      cell: (row: AdminLicenseRow) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.softwareName}</p>
          <p className="text-[11px] text-slate-500">v{row.version}</p>
        </div>
      ),
    },
    {
      header: t.licUser,
      cell: (row: AdminLicenseRow) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.userName}</p>
          <p className="text-[11px] text-slate-500">{row.userEmail}</p>
        </div>
      ),
    },
    { header: t.type, accessorKey: "licenseType" as const },
    {
      header: t.status,
      cell: (row: AdminLicenseRow) => <StatusBadge status={row.status} />,
    },
    { header: t.expDate, accessorKey: "expiresAt" as const },
    {
      header: t.action,
      cell: (row: AdminLicenseRow) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href={`/dashboard/licenses/${row.id}`}>
            <Button variant="outline" size="sm">
              {t.inspect}
            </Button>
          </Link>

          {row.status === "ACTIVE" && (
            <Button
              variant="outline"
              size="sm"
              disabled={updatingId === row.id}
              onClick={() => openConfirm(row.id, "SUSPEND")}
              title={t.suspendBtn}
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
            </Button>
          )}

          {row.status === "SUSPENDED" && (
            <Button
              variant="success"
              size="sm"
              disabled={updatingId === row.id}
              onClick={() => openConfirm(row.id, "REINSTATE")}
              title={t.reinstateBtn}
            >
              <PlayCircle className="w-3.5 h-3.5" />
            </Button>
          )}

          {row.status !== "REVOKED" && (
            <Button
              variant="outline"
              size="sm"
              disabled={updatingId === row.id}
              onClick={() => openConfirm(row.id, "EXTEND")}
              title={t.extendBtn}
            >
              <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />
            </Button>
          )}

          {row.status !== "REVOKED" && (
            <Button
              variant="destructive"
              size="sm"
              disabled={updatingId === row.id}
              onClick={() => openConfirm(row.id, "REVOKE")}
              title={t.revokeBtn}
            >
              <XOctagon className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded border border-slate-200 bg-white space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{t.activeTitle}</span>
          <h3 className="text-2xl font-bold text-emerald-700">{activeCount}</h3>
        </div>
        <div className="p-4 rounded border border-amber-200 bg-amber-50/50 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-amber-900 tracking-wider">{t.suspendedTitle}</span>
          <h3 className="text-2xl font-bold text-amber-800">{suspendedCount}</h3>
        </div>
        <div className="p-4 rounded border border-rose-200 bg-rose-50/50 space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-rose-900 tracking-wider">{t.revokedTitle}</span>
          <h3 className="text-2xl font-bold text-rose-800">{revokedCount}</h3>
        </div>
      </div>

      <DataTable
        data={licenses as any}
        columns={columns as any}
        searchPlaceholder={t.searchPlaceholder}
        pageSize={12}
        emptyTitle={t.emptyTitle}
      />

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        description={confirmModal.message}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
            >
              {t.cancelBtn}
            </Button>
            <Button
              variant={confirmModal.action === "REVOKE" ? "destructive" : "primary"}
              onClick={handleActionConfirm}
            >
              {t.confirmBtn}
            </Button>
          </>
        }
      >
        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>Все изменения статуса фиксируются в неизменяемом государственном журнале аудита.</span>
        </div>
      </Modal>
    </div>
  );
}
