"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Laptop, Edit3, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/LanguageContext";

export interface UserProfileClientViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    roleName: string;
    roleCode: string;
  };
}

export function UserProfileClientView({ user: initialUser }: UserProfileClientViewProps) {
  const [user, setUser] = useState(initialUser);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("error", "Ошибка", "ФИО не может быть пустым.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setUser((prev) => ({
        ...prev,
        name: data.user.name,
        phone: data.user.phone,
      }));

      toast("success", "Профиль обновлён", "Данные учётной записи успешно сохранены.");
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось сохранить";
      toast("error", "Ошибка", msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800">
      <div className="p-5 rounded border border-slate-200 bg-white shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("profileTitle")}</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {t("profileSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="p-6 rounded border border-slate-200 bg-white text-center space-y-3 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{user.name}</h3>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <Badge variant="indigo" size="md">
            {user.roleName}
          </Badge>
        </div>

        {/* Account Details */}
        <div className="md:col-span-2 p-6 rounded border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("profileInfoTitle")}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              {t("profileEditBtn")}
            </Button>
          </div>

          <div className="space-y-3 text-xs">
            <Input label={t("profileFullName")} value={user.name} readOnly leftIcon={<User className="w-4 h-4 text-slate-400" />} />
            <Input label={t("profileEmail")} value={user.email} readOnly leftIcon={<Mail className="w-4 h-4 text-slate-400" />} />
            <Input label={t("profilePhone")} value={user.phone || t("profilePhoneNone")} readOnly leftIcon={<Phone className="w-4 h-4 text-slate-400" />} />
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("profileEditTitle")}
        description={t("profileSubtitle")}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t("profileCancelBtn")}
            </Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSaveProfile}>
              {t("profileSaveBtn")}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
          <Input
            label={`${t("profileFullName")} *`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            required
          />
          <Input
            label={t("profilePhone")}
            placeholder="+7 (701) 000-00-00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />
        </form>
      </Modal>
    </div>
  );
}
