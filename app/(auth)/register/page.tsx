"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Building2,
  Key,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/LanguageContext";
import { Logo } from "@/components/shared/Logo";
import {
  checkNCALayerAvailability,
  getNCALayerKeyInfo,
  signDataWithNCALayer,
  NCALayerCertificateInfo,
} from "@/lib/ncalayer";

export default function RegisterPage() {
  const { locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"STANDARD" | "ECP">(
    searchParams.get("ecp") === "true" ? "ECP" : "STANDARD"
  );

  // Standard form
  const [formData, setFormData] = useState({
    name: searchParams.get("name") || "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // ECP Registration form
  const [ncaStatus, setNcaStatus] = useState<"IDLE" | "CHECKING" | "AVAILABLE" | "UNAVAILABLE">("IDLE");
  const [ncaError, setNcaError] = useState<string | null>(null);
  const [ecpCert, setEcpCert] = useState<NCALayerCertificateInfo | null>(null);
  const [ecpEmail, setEcpEmail] = useState("");
  const [ecpPhone, setEcpPhone] = useState("");
  const [isReadingNca, setIsReadingNca] = useState(false);
  const [isRegisteringEcp, setIsRegisteringEcp] = useState(false);

  useEffect(() => {
    if (activeTab === "ECP" && ncaStatus === "IDLE") {
      runNcaCheck();
    }
  }, [activeTab, ncaStatus]);

  const runNcaCheck = async () => {
    setNcaStatus("CHECKING");
    setNcaError(null);
    try {
      const res = await checkNCALayerAvailability(2500);
      if (res.isAvailable) {
        setNcaStatus("AVAILABLE");
      } else {
        setNcaStatus("UNAVAILABLE");
        setNcaError(res.error || "NCALayer не запущен на порту 13579");
      }
    } catch (e: unknown) {
      setNcaStatus("UNAVAILABLE");
      setNcaError(e instanceof Error ? e.message : "Не удалось связаться с NCALayer");
    }
  };

  const handleSelectEcpCertificate = async () => {
    setIsReadingNca(true);
    try {
      const cert = await getNCALayerKeyInfo("PKCS12");
      setEcpCert(cert);
      toast(
        "success",
        "Сертификат проверен",
        `Владелец: ${cert.ownerName} (${cert.iin || cert.bin || "OK"})`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка выбора сертификата";
      toast("error", "NCALayer", msg);
    } finally {
      setIsReadingNca(false);
    }
  };

  const handleStandardRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast("error", "Ошибка", "Пожалуйста, заполните обязательные поля.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast("error", "Ошибка", "Введенные пароли не совпадают.");
      return;
    }

    if (formData.password.length < 6) {
      toast("error", "Ошибка", "Пароль должен содержать минимум 6 символов.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      toast("success", "Успешно", "Аккаунт успешно создан!");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка создания аккаунта";
      toast("error", "Ошибка", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEcpRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ecpCert) {
      toast("error", "ЭЦП", "Сначала выберите сертификат ЭЦП через NCALayer");
      return;
    }

    if (!ecpEmail || !ecpEmail.includes("@")) {
      toast("error", "Email", "Укажите корректный рабочий адрес электронной почты");
      return;
    }

    setIsRegisteringEcp(true);
    try {
      // 1. Get challenge
      const chRes = await fetch("/api/auth/challenge");
      const { challenge } = await chRes.json();

      // 2. Sign registration challenge via NCALayer
      const challengeBase64 = Buffer.from(challenge).toString("base64");
      const signRes = await signDataWithNCALayer(challengeBase64, "PKCS12");

      // 3. Register user with verified certificate data
      const res = await fetch("/api/auth/ecp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificate: ecpCert,
          signature: signRes.signature,
          challenge,
          email: ecpEmail.trim(),
          phone: ecpPhone.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка регистрации через ЭЦП");

      toast("success", "Регистрация завершена", `Добро пожаловать, ${data.user.name}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось завершить регистрацию";
      toast("error", "Ошибка регистрации", msg);
    } finally {
      setIsRegisteringEcp(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12 text-slate-800 bg-slate-50/50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-2">
            <Logo size="lg" href="/" showTagline={false} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Регистрация в системе FleXora
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Создайте учётную запись для управления лицензиями ПО и юридически значимого подписания
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("STANDARD")}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "STANDARD"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Стандартная</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("ECP");
              if (ncaStatus === "IDLE") runNcaCheck();
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "ECP"
                ? "bg-white text-indigo-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Через ЭЦП (eGov)</span>
          </button>
        </div>

        {/* ── STANDARD REGISTRATION ── */}
        {activeTab === "STANDARD" && (
          <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
            <form onSubmit={handleStandardRegister} className="space-y-3.5 text-xs">
              <Input
                label="ФИО или наименование компании *"
                placeholder="например, Acme Technologies"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label="Рабочий email *"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label="Контактный телефон"
                type="tel"
                placeholder="+7 (700) 000-00-00"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label="Пароль *"
                type="password"
                placeholder="Минимум 6 символов"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label="Подтверждение пароля *"
                type="password"
                placeholder="Повторите пароль"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Создать аккаунт
              </Button>
            </form>
          </div>
        )}

        {/* ── ECP REGISTRATION ── */}
        {activeTab === "ECP" && (
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 text-xs">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900">
                Регистрация с подтверждением личности через ЭЦП
              </h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                ФИО и ИИН будут надёжно подтверждены сертификатом Национального удостоверяющего центра РК
              </p>
            </div>

            {/* NCALayer probe banner */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ncaStatus === "AVAILABLE" ? (
                    <Wifi className="w-4 h-4 text-emerald-600" />
                  ) : ncaStatus === "UNAVAILABLE" ? (
                    <WifiOff className="w-4 h-4 text-rose-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                  )}
                  <span className="font-semibold text-slate-800">
                    NCALayer: {ncaStatus === "AVAILABLE" ? "Доступен" : ncaStatus === "UNAVAILABLE" ? "Не запущен" : "Проверка..."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={runNcaCheck}
                  className="text-indigo-600 hover:underline text-[11px] font-semibold"
                >
                  Обновить
                </button>
              </div>

              {ncaStatus === "UNAVAILABLE" && (
                <div className="text-rose-700 text-[11px] space-y-1">
                  <p>{ncaError || "NCALayer не запущен на порту 13579."}</p>
                  <p>
                    Запустите приложение NCALayer или{" "}
                    <a href="https://pki.gov.kz/ncalayer/" target="_blank" rel="noreferrer" className="underline font-bold text-indigo-700">
                      скачайте его с pki.gov.kz
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Select certificate step */}
            {!ecpCert ? (
              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  disabled={ncaStatus === "UNAVAILABLE"}
                  isLoading={isReadingNca}
                  onClick={handleSelectEcpCertificate}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  leftIcon={<Key className="w-4 h-4" />}
                >
                  Выбрать сертификат через NCALayer
                </Button>
                <div className="text-center text-slate-500 text-[11px]">
                  Нет ЭЦП?{" "}
                  <Link href="/get-ecp" className="text-indigo-600 font-bold hover:underline">
                    Получить ЭЦП или ключ платформы →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEcpRegister} className="space-y-3.5">
                {/* Verified Identity Box (Readonly) */}
                <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 tracking-wider">
                    Подтверждённая личность (НУЦ РК):
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{ecpCert.ownerName}</p>
                  <div className="grid grid-cols-2 gap-1 text-slate-600 text-[11px]">
                    <span>ИИН: <strong>{ecpCert.iin || "—"}</strong></span>
                    <span>Субъект: <strong>{ecpCert.subjectType === "LEGAL_ENTITY" ? "Юрлицо" : "Физлицо"}</strong></span>
                    {ecpCert.organizationName && (
                      <span className="col-span-2">Организация: <strong>{ecpCert.organizationName}</strong></span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEcpCert(null)}
                    className="text-[11px] text-indigo-700 underline font-semibold pt-1"
                  >
                    Выбрать другой сертификат
                  </button>
                </div>

                <Input
                  label="Рабочий email для уведомлений и доступа *"
                  type="email"
                  placeholder="name@company.kz"
                  value={ecpEmail}
                  onChange={(e) => setEcpEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label="Контактный телефон (необязательно)"
                  type="tel"
                  placeholder="+7 (700) 000-00-00"
                  value={ecpPhone}
                  onChange={(e) => setEcpPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isRegisteringEcp}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Подписать и завершить регистрацию
                </Button>
              </form>
            )}
          </div>
        )}

        <div className="pt-2 text-center text-xs text-slate-600">
          Уже зарегистрированы?{" "}
          <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700">
            Войти в систему
          </Link>
        </div>
      </div>
    </div>
  );
}
