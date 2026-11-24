"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserX, UserCheck, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/LanguageContext";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  roleCode: string;
  phone: string;
  isSuspended: boolean;
  applicationsCount: number;
  licensesCount: number;
  createdAt: string;
}

export function AdminUsersClientView({ users: initialUsers }: { users: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useLanguage();
  const router = useRouter();

  const handleToggleSuspend = async (row: UserRow) => {
    setUpdatingId(row.id);
    try {
      const newStatus = !row.isSuspended;
      const res = await fetch(`/api/admin/users/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setUsers((prev) =>
        prev.map((u) => (u.id === row.id ? { ...u, isSuspended: newStatus } : u))
      );

      toast(
        newStatus ? "error" : "success",
        newStatus ? "Учётная запись заблокирована" : "Учётная запись активирована",
        `Пользователь ${row.name}: статус обновлён.`
      );
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка обновления статуса";
      toast("error", "Ошибка", msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (row: UserRow, newRoleCode: string) => {
    setUpdatingId(row.id);
    try {
      const res = await fetch(`/api/admin/users/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleCode: newRoleCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Role update failed");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === row.id
            ? { ...u, roleCode: data.user.roleCode, role: data.user.role }
            : u
        )
      );

      toast("info", "Роль обновлена", `Пользователю ${row.name} назначена роль '${data.user.role}'.`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось обновить роль";
      toast("error", "Ошибка", msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const TEXTS = {
    en: {
      title: "User Accounts Management",
      subtitle: "Official register of system users, assigned roles, and access authorization.",
      userId: "User Identity",
      role: "Assigned Role",
      phone: "Phone",
      apps: "Applications",
      licenses: "Licenses",
      accState: "Access Status",
      suspended: "Blocked",
      active: "Active",
      action: "Actions",
      blockBtn: "Block",
      unblockBtn: "Unblock",
      searchPlaceholder: "Search users by name, email, or role...",
      emptyTitle: "No users found",
    },
    kk: {
      title: "Пайдаланушылар тізілімі",
      subtitle: "Жүйелік пайдаланушылар тіркелгілерін, рөлдерін және қолжетімділік мәртебесін басқару.",
      userId: "Пайдаланушы",
      role: "Рөлі",
      phone: "Телефон",
      apps: "Өтінімдер",
      licenses: "Лицензиялар",
      accState: "Қолжетімділік",
      suspended: "Бұғатталған",
      active: "Белсенді",
      action: "Әрекеттер",
      blockBtn: "Бұғаттау",
      unblockBtn: "Қалпына келтіру",
      searchPlaceholder: "Пайдаланушыларды аты, email немесе рөлі бойынша іздеу...",
      emptyTitle: "Пайдаланушылар табылмады",
    },
    ru: {
      title: "Управление пользователями",
      subtitle: "Реестр зарегистрированных пользователей государственной системы и управление ролями.",
      userId: "Пользователь",
      role: "Роль в системе",
      phone: "Телефон",
      apps: "Заявлений",
      licenses: "Лицензий",
      accState: "Статус доступа",
      suspended: "Заблокирован",
      active: "Активен",
      action: "Действия",
      blockBtn: "Заблокировать",
      unblockBtn: "Разблокировать",
      searchPlaceholder: "Поиск пользователей по имени, email или роли...",
      emptyTitle: "Пользователи не найдены",
    },
  };

  const t = TEXTS[locale];

  const columns = [
    {
      header: t.userId,
      cell: (row: UserRow) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.name}</p>
          <p className="text-[11px] text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: t.role,
      cell: (row: UserRow) => (
        <select
          value={row.roleCode}
          disabled={updatingId === row.id}
          onChange={(e) => handleRoleChange(row, e.target.value)}
          className="bg-white border border-slate-300 text-slate-800 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
        >
          <option value="USER">USER (Клиент / Пользователь)</option>
          <option value="REVIEWER">REVIEWER (Рецензент / Аудитор)</option>
          <option value="LICENSE_MANAGER">LICENSE_MANAGER (Менеджер лицензий)</option>
          <option value="ADMIN">ADMIN (Администратор системы)</option>
        </select>
      ),
    },
    { header: t.phone, accessorKey: "phone" as const },
    {
      header: t.apps,
      cell: (row: UserRow) => (
        <span className="font-semibold text-slate-700">{row.applicationsCount}</span>
      ),
    },
    {
      header: t.licenses,
      cell: (row: UserRow) => (
        <span className="font-semibold text-emerald-700">{row.licensesCount}</span>
      ),
    },
    {
      header: t.accState,
      cell: (row: UserRow) => (
        <Badge variant={row.isSuspended ? "danger" : "success"} size="sm">
          {row.isSuspended ? t.suspended : t.active}
        </Badge>
      ),
    },
    {
      header: t.action,
      cell: (row: UserRow) => (
        <Button
          variant={row.isSuspended ? "success" : "outline"}
          size="sm"
          disabled={updatingId === row.id}
          onClick={() => handleToggleSuspend(row)}
          leftIcon={row.isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5 text-rose-600" />}
        >
          {row.isSuspended ? t.unblockBtn : t.blockBtn}
        </Button>
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

      <DataTable
        data={users as any}
        columns={columns as any}
        searchPlaceholder={t.searchPlaceholder}
        pageSize={12}
        emptyTitle={t.emptyTitle}
      />
    </div>
  );
}
