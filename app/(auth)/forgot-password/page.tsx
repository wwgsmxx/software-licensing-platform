"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/shared/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12 text-slate-800 bg-slate-50/50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-2">
            <Logo size="lg" href="/" showTagline={false} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Восстановление доступа</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Введите рабочий адрес электронной почты для получения ссылки
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          {submitted ? (
            <div className="text-center space-y-3 py-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full w-fit mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Инструкция отправлена</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Если учётная запись для <strong>{email}</strong> существует, ссылка для восстановления доступа направлена на почту.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Вернуться ко входу
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <Input
                label="Рабочий адрес электронной почты"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />
              <Button type="submit" variant="primary" size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs">
                Восстановить доступ
              </Button>
              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 font-medium transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Вернуться ко входу
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
