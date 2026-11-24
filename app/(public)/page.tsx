"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  HelpCircle,
  Mail,
  ArrowRight,
  Lock,
  Award,
  Layers,
  Key,
  Database,
  Cpu,
  Fingerprint,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sliders,
  Send,
  MessageSquare,
  Building2,
  UserCheck,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/LanguageContext";
import { checkNCALayerAvailability } from "@/lib/ncalayer";

export default function LandingPage() {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<"table" | "crypto">("table");

  // Live NCALayer Checker State
  const [ncaStatus, setNcaStatus] = useState<"IDLE" | "CHECKING" | "AVAILABLE" | "UNAVAILABLE">("IDLE");
  const [ncaError, setNcaError] = useState<string | null>(null);

  const testNCALayerConnection = async () => {
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
      setNcaError(e instanceof Error ? e.message : "Ошибка подключения");
    }
  };

  // In-place Support Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactIssue, setContactIssue] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactIssue.trim()) {
      setContactError(
        locale === "ru"
          ? "Пожалуйста, заполните все поля"
          : locale === "kk"
          ? "Барлық өрістерді толтырыңыз"
          : "Please fill in all fields"
      );
      return;
    }
    setContactSubmitting(true);
    setContactError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          subject: "Support Request / Мәселе туралы",
          message: contactIssue.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setContactSubmitted(true);
      setContactName("");
      setContactEmail("");
      setContactIssue("");
    } catch {
      setContactError(
        locale === "ru"
          ? "Ошибка отправки. Попробуйте позже."
          : locale === "kk"
          ? "Жіберу қатесі. Кейінірек қайталап көріңіз."
          : "Failed to submit. Please try again."
      );
    } finally {
      setContactSubmitting(false);
    }
  };

  // Sample live-like demonstration license records
  const DEMO_LICENSES = [
    {
      id: "CERT-8F92-41A0",
      product: "Enterprise ERP Core v4.2",
      type: "Commercial",
      key: "FX-2026-COMM-9981-A2",
      fingerprint: "E4B2...91F0",
      status: "ACTIVE",
      expires: "2027-12-31",
    },
    {
      id: "CERT-3A71-99C4",
      product: "Cloud Storage Agent v2.0",
      type: "Enterprise",
      key: "FX-2026-ENT-7712-B8",
      fingerprint: "7A99...22D1",
      status: "ACTIVE",
      expires: "2028-06-15",
    },
    {
      id: "CERT-1D45-66E2",
      product: "Security Gateway SDK v1.4",
      type: "Developer",
      key: "FX-2026-DEV-3341-C0",
      fingerprint: "3F11...88B4",
      status: "EXPIRING_SOON",
      expires: "2026-11-30",
    },
  ];

  const CAPABILITIES = [
    {
      title: locale === "ru" ? "Полный жизненный цикл лицензий" : locale === "kk" ? "Лицензияның толық өмірлік циклі" : "Full License Lifecycle",
      desc:
        locale === "ru"
          ? "Централизованное создание, продление, приостановка и отзыв программных лицензий с фиксацией в журнале аудита."
          : locale === "kk"
          ? "Аудит журналында тіркеу арқылы БЖ лицензияларын орталықтандырылған жасау, ұзарту, тоқтата тұру және қайтарып алу."
          : "Centralized issuance, renewal, suspension, and revocation with full immutable audit logging.",
      icon: Layers,
    },
    {
      title: locale === "ru" ? "Криптографическая защита Ed25519" : locale === "kk" ? "Ed25519 криптографиялық қорғауы" : "Ed25519 Cryptographic Signatures",
      desc:
        locale === "ru"
          ? "Асимметричные цифровые подписи на эллиптических кривых и каноническое хеширование SHA-256 исключают подделку данных."
          : locale === "kk"
          ? "Эллиптикалық қисықтардағы асимметриялық сандық қолтаңбалар мен канондық SHA-256 деректерді бұрмалауды болдырмайды."
          : "Asymmetric elliptic curve digital signatures paired with canonical SHA-256 prevent data tampering.",
      icon: Fingerprint,
    },
    {
      title: locale === "ru" ? "Мгновенная верификация подлинности" : locale === "kk" ? "Түпнұсқалықты лезде тексеру" : "Instant Authenticity Verification",
      desc:
        locale === "ru"
          ? "Открытый интерфейс и API для мгновенной валидации сертификатов, проверки хэш-сумм и срока действия лицензии."
          : locale === "kk"
          ? "Сертификаттарды, хэш-сомаларды және лицензия мерзімін жылдам тексеруге арналған ашық интерфейс пен API."
          : "Public verification page and endpoints for immediate validation of license keys and cryptographic certificates.",
      icon: ShieldCheck,
    },
    {
      title: locale === "ru" ? "Каталог программных продуктов" : locale === "kk" ? "БЖ өнімдерінің каталогы" : "Software Product Catalog",
      desc:
        locale === "ru"
          ? "Структурированное управление версиями, платформами (Desktop, Web, Cloud) и типами лицензирования ваших продуктов."
          : locale === "kk"
          ? "Нұсқаларды, платформаларды (Desktop, Web, Cloud) және лицензиялау түрлерін құрылымдық басқару."
          : "Structured management of software versions, deployment platforms (Cloud, Desktop, Web), and licensing policies.",
      icon: Database,
    },
  ];

  const WORKFLOW_STEPS = [
    {
      step: "01",
      title: locale === "ru" ? "Регистрация ПО" : locale === "kk" ? "БЖ тіркеу" : "Register Software",
      desc:
        locale === "ru"
          ? "Внесите метаданные программного продукта: название, версию, целевые платформы и описание архитектуры."
          : locale === "kk"
          ? "Өнім метадеректерін енгізіңіз: атауы, нұсқасы, платформалары және архитектуралық сипаттамасы."
          : "Register your software product metadata: name, version, supported platforms, and developer details.",
    },
    {
      step: "02",
      title: locale === "ru" ? "Настройка лицензии" : locale === "kk" ? "Лицензияны баптау" : "Configure License",
      desc:
        locale === "ru"
          ? "Выберите тип лицензии (Commercial, Enterprise, Developer), срок действия и лимит рабочих мест."
          : locale === "kk"
          ? "Лицензия түрін (Commercial, Enterprise, Developer), қолданылу мерзімін және пайдаланушылар шегін таңдаңыз."
          : "Configure license duration, seat limits, allowed environments, and optional compliance documents.",
    },
    {
      step: "03",
      title: locale === "ru" ? "Криптографическая подпись" : locale === "kk" ? "Криптографиялық қол қою" : "Cryptographic Signing",
      desc:
        locale === "ru"
          ? "Каноникализация полезной нагрузки JSON и генерация цифровой подписи Ed25519 с расчётом хэша SHA-256."
          : locale === "kk"
          ? "JSON деректерін каноникализациялау және SHA-256 хэшімен Ed25519 сандық қолтаңбасын жасау."
          : "Deterministic canonical JSON hashing (SHA-256) followed by Ed25519 asymmetric signature generation.",
    },
    {
      step: "04",
      title: locale === "ru" ? "Выпуск и валидация" : locale === "kk" ? "Беру және тексеру" : "Issue & Validate",
      desc:
        locale === "ru"
          ? "Клиент получает криптографический сертификат с уникальным токеном и QR-кодом для проверки подлинности."
          : locale === "kk"
          ? "Пайдаланушы түпнұсқалықты тексеруге арналған бірегей белгісі мен QR-коды бар сертификат алады."
          : "Receive the verifiable digital certificate with public verification URL, license key, and QR code.",
    },
  ];

  const FAQS = [
    {
      q:
        locale === "ru"
          ? "Как FleXora гарантирует неизменность данных лицензии?"
          : locale === "kk"
          ? "FleXora лицензия деректерінің өзгермеуіне қалай кепілдік береді?"
          : "How does FleXora guarantee license data integrity?",
      a:
        locale === "ru"
          ? "Перед подписанием все параметры заявки и хэши прикрепленных файлов сортируются в канонический формат JSON (RFC 8785) и хешируются SHA-256. Любое изменение хотя бы одного символа приводит к несовпадению подписи Ed25519."
          : locale === "kk"
          ? "Қол қояр алдында өтінімнің барлық параметрлері мен құжаттар хэштері канондық JSON форматына келтіріліп, SHA-256 арқылы хэштеледі. Тіпті бір таңбаның өзгеруі Ed25519 қолтаңбасының жарамсыздығына әкеледі."
          : "Before signing, all application attributes and attached document checksums are deterministically canonicalized (RFC 8785) and hashed via SHA-256. Any modification invalidates the Ed25519 signature.",
    },
    {
      q:
        locale === "ru"
          ? "Можно ли проверить лицензию без входа в систему?"
          : locale === "kk"
          ? "Жүйеге кірмей лицензияны тексеруге бола ма?"
          : "Can a license be verified without an account?",
      a:
        locale === "ru"
          ? "Да, общедоступный раздел «Проверить лицензию» позволяет любому клиенту или партнёру мгновенно подтвердить статус, номер и валидность цифровой подписи по номеру сертификата."
          : locale === "kk"
          ? "Иә, «Лицензияны тексеру» ашық бөлімі арқылы кез келген серіктес сертификат нөмірі бойынша сандық қолтаңба мен мәртебені бірден тексере алады."
          : "Yes, the public verification page allows anyone to inspect validity dates, issuer credentials, and digital signature validity without logging in.",
    },
    {
      q:
        locale === "ru"
          ? "Какие алгоритмы шифрования и подписи используются?"
          : locale === "kk"
          ? "Қандай шифрлау және қолтаңба алгоритмдері қолданылады?"
          : "Which cryptographic algorithms are used?",
      a:
        locale === "ru"
          ? "Платформа использует криптографический стандарт Ed25519 (RFC 8032) на базе эллиптических кривых Edwards для цифровой подписи и безопасное 256-битное хеширование SHA-256."
          : locale === "kk"
          ? "Платформа сандық қолтаңба үшін Edwards эллиптикалық қисықтарына негізделген Ed25519 (RFC 8032) және қауіпсіз 256-биттік SHA-256 хэштеуін қолданады."
          : "The engine uses Ed25519 (RFC 8032) elliptic-curve asymmetric cryptography alongside standard SHA-256 digests.",
    },
    {
      q:
        locale === "ru"
          ? "Как разделяются права доступа в системе?"
          : locale === "kk"
          ? "Жүйеде қолжетімділік құқықтары қалай бөлінеді?"
          : "How are role permissions enforced?",
      a:
        locale === "ru"
          ? "В платформе реализовано строгое серверное разграничение ролей: Пользователи управляют только своими продуктами и лицензиями, а администраторы и менеджеры лицензий проводят верификацию и контроль безопасности."
          : locale === "kk"
          ? "Платформада серверлік рөлдер нақты бөлінген: Пайдаланушылар тек өз лицензияларын басқарады, ал әкімшілер верификация мен қауіпсіздікке жауапты."
          : "Server-side authorization ensures strict role separation: Users manage only their software and licenses, while Reviewers and Admins oversee issuance and audit trails.",
    },
  ];

  return (
    <div className="space-y-20 pb-24 text-slate-800 bg-white">

      {/* ── 1. HERO SECTION (MODERN SAAS) ── */}
      <section id="hero" className="relative overflow-hidden pt-12 sm:pt-20 pb-16 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 via-white to-white scroll-mt-24">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">

            {/* SaaS Category Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50/80 border border-indigo-200/60 text-indigo-700 text-xs font-semibold rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>{t("officialGovServiceBadge")} • v2.4</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
              {locale === "ru" ? (
                <>
                  Централизованное лицензирование ПО с{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600">
                    цифровой подписью
                  </span>
                </>
              ) : locale === "kk" ? (
                <>
                  Бағдарламалық жасақтаманы{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600">
                    сандық қолтаңбамен
                  </span>{" "}
                  лицензиялау
                </>
              ) : (
                <>
                  Modern Software Licensing with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600">
                    Cryptographic Signatures
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              {locale === "ru"
                ? "FleXora предоставляет единую платформу для выпуска, валидации и мониторинга лицензий с асимметричной криптографией Ed25519 и защитой от подделки."
                : locale === "kk"
                ? "FleXora — Ed25519 асимметриялық криптографиясы мен бұрмалаудан қорғауы бар лицензияларды беру, тексеру және бақылау платформасы."
                : "FleXora provides a unified SaaS infrastructure for issuing, verifying, and managing cryptographic software licenses powered by Ed25519 signatures."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link href="/register">
                <Button variant="primary" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {locale === "ru" ? "Начать работу бесплатно" : locale === "kk" ? "Тегін бастау" : "Get Started Free"}
                </Button>
              </Link>
              <Link href="/verify-license">
                <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50" leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}>
                  {t("heroVerify")}
                </Button>
              </Link>
            </div>

            {/* Quick Live Verification Box directly on Landing Hero */}
            <div className="max-w-xl mx-auto pt-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget.elements.namedItem("licenseQuery") as HTMLInputElement;
                  if (target && target.value.trim()) {
                    window.location.href = `/verify-license?id=${encodeURIComponent(target.value.trim())}`;
                  }
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-white shadow-md focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 transition-all"
              >
                <div className="pl-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <input
                  type="text"
                  name="licenseQuery"
                  placeholder={
                    locale === "ru"
                      ? "Быстрая проверка: введите номер лицензии или ID сертификата..."
                      : locale === "kk"
                      ? "Жылдам тексеру: лицензия немесе сертификат нөмірін енгізіңіз..."
                      : "Instant verification: enter license key or certificate ID..."
                  }
                  className="flex-1 bg-transparent border-0 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 px-2 py-1.5"
                />
                <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                  {locale === "ru" ? "Проверить" : locale === "kk" ? "Тексеру" : "Verify"}
                </Button>
              </form>
              <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-slate-400">
                <span>{locale === "ru" ? "Демо-примеры:" : locale === "kk" ? "Демо-мысалдар:" : "Demo IDs:"}</span>
                <Link
                  href="/verify-license?id=LIC-2026-000108"
                  className="font-mono text-indigo-600 hover:underline font-semibold"
                >
                  LIC-2026-000108
                </Link>
                <span>•</span>
                <Link
                  href="/verify-license?id=LIC-2026-000104"
                  className="font-mono text-indigo-600 hover:underline font-semibold"
                >
                  LIC-2026-000104
                </Link>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Ed25519 Asymmetric Engine
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                SHA-256 Canonical JSON
              </span>
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero Tamper Vulnerability
              </span>
            </div>
          </div>

          {/* ── 2. LIVE INTERFACE PREVIEW (LINEAR/STRIPE STYLE) ── */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              {/* Window Header */}
              <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-semibold text-slate-600 hidden sm:inline">
                    FleXora Workspace • License Registry
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-[11px] text-slate-600 font-mono">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Ed25519: ACTIVE (256-bit)</span>
                </div>
              </div>

              {/* Window Controls / Tabs */}
              <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab("table")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === "table"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Active Licenses Ledger
                  </button>
                  <button
                    onClick={() => setActiveTab("crypto")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === "crypto"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Cryptographic Payload Digest
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Realtime Signature Engine</span>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "table" ? (
                <div className="overflow-x-auto p-4 sm:p-6">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="pb-3 px-3">Certificate ID</th>
                        <th className="pb-3 px-3">Software Product</th>
                        <th className="pb-3 px-3">License Key</th>
                        <th className="pb-3 px-3">Key Fingerprint</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3 text-right">Expiration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {DEMO_LICENSES.map((lic) => (
                        <tr key={lic.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{lic.id}</td>
                          <td className="py-3 px-3 text-slate-700">{lic.product}</td>
                          <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{lic.key}</td>
                          <td className="py-3 px-3 font-mono text-indigo-600 text-[11px]">{lic.fingerprint}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                lic.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {lic.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-500 font-mono text-[11px]">{lic.expires}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-3 font-mono text-xs text-slate-700 bg-slate-950 text-slate-200 rounded-b-xl overflow-x-auto">
                  <p className="text-slate-400 text-[11px]">// Deterministic RFC 8785 Canonical JSON Signature String</p>
                  <pre className="text-emerald-400 text-[11px] leading-relaxed">
{`{
  "algorithm": "Ed25519-SHA256-SIMULATED",
  "applicationId": "LIC-2026-000101",
  "documents": [{"checksumSha256":"9e107d9d372bb6826bd81d3542a419d6"}],
  "licenseDuration": "1 Year",
  "licenseType": "Commercial",
  "numUsers": 10,
  "payloadHash": "6B86B273FF34FCE19D6B804EFF5A3F5747ADA4EAA22F1D49C01E52DDB7875B4B",
  "publicKeyFingerprint": "9B3E2F1A00C498D1",
  "softwareName": "Enterprise Cloud Sync v2.4"
}`}
                  </pre>
                  <p className="text-teal-400 text-[11px]">✓ Asymmetric Signature Verified: 64-byte Ed25519 signature match confirmed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CORE CAPABILITIES (4 CARDS) ── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {locale === "ru" ? "Технологические возможности FleXora" : locale === "kk" ? "FleXora технологиялық мүмкіндіктері" : "Enterprise Capabilities"}
          </h2>
          <p className="text-sm text-slate-500">
            {locale === "ru"
              ? "Все необходимые инструменты для безопасного управления и аудита программных лицензий"
              : locale === "kk"
              ? "БЖ лицензияларын қауіпсіз басқаруға және аудиттеуге қажетті барлық құралдар"
              : "Everything tech companies need for secure, verifiable software license administration."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CAPABILITIES.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{cap.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{cap.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. HOW LICENSING WORKS (4 SEQUENTIAL STEPS) ── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("howToGetLicenseTitle")}
          </h2>
          <p className="text-sm text-slate-500">
            {t("howToGetLicenseSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WORKFLOW_STEPS.map((st) => (
            <div
              key={st.step}
              className="p-6 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200 space-y-3 relative"
            >
              <div className="text-2xl font-black text-indigo-600/40 tracking-tight font-mono">{st.step}</div>
              <h3 className="font-bold text-sm text-slate-900 leading-snug">{st.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4.5. ECP & NCALAYER INTEGRATION SHOWCASE (NEW) ── */}
      <section id="get-ecp" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
        <div id="ecp-service" className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-8 sm:p-12 space-y-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-indigo-100 pb-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                <Key className="w-3.5 h-3.5" />
                <span>eGov & NCALayer Compatibility</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {locale === "ru"
                  ? "Электронная цифровая подпись (ЭЦП) и NCALayer"
                  : locale === "kk"
                  ? "Электрондық цифрлық қолтаңба (ЭЦҚ) және NCALayer"
                  : "Digital Signature (EDS) & NCALayer Integration"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {locale === "ru"
                  ? "Платформа FleXora полностью поддерживает юридически значимую работу с ЭЦП Республики Казахстан (НУЦ РК) через локальное приложение NCALayer, а также выпуск персональных ключей безопасности."
                  : locale === "kk"
                  ? "FleXora платформасы жергілікті NCALayer қолданбасы арқылы ҚР ҰКО ЭЦҚ-мен заңды маңызы бар жұмысты және жеке қауіпсіздік кілттерін беруді толық қолдайды."
                  : "FleXora fully supports legally valid Kazakhstani digital signatures (NCA RK) via NCALayer as well as downloadable personal security keys."}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link href="/get-ecp">
                <Button variant="primary" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {locale === "ru" ? "Получить ЭЦП онлайн" : locale === "kk" ? "ЭЦҚ онлайн алу" : "Get Digital Signature"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Entity Separation Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Physical Person */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center gap-3 text-indigo-700">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {locale === "ru" ? "Физическое лицо" : locale === "kk" ? "Жеке тұлға" : "Individual Applicant"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Для граждан и индивидуальных разработчиков</p>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Идентификация владельца по ИИН и личному сертификату НУЦ РК.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Автоматическое заполнение ФИО заявителя из подтверждённого сертификата.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {locale === "ru"
                      ? "Юридически значимое подписание заявлений через государственную ЭЦП (NCALayer)."
                      : locale === "kk"
                      ? "NCALayer арқылы мемлекеттік ЭЦП-мен өтінімдерге заңды күші бар қол қою."
                      : "Legally binding application signing via state EDS (NCALayer)."}
                  </span>
                </li>
              </ul>
              <Link href="/get-ecp?type=individual" className="inline-block text-xs font-bold text-indigo-600 hover:underline pt-2">
                {locale === "ru" ? "Оформить для физлица →" : locale === "kk" ? "Жеке тұлғаға рәсімдеу →" : "Apply as Individual →"}
              </Link>
            </div>

            {/* Legal Entity */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center gap-3 text-teal-700">
                <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {locale === "ru" ? "Юридическое лицо" : locale === "kk" ? "Заңды тұлға" : "Legal Entity / Enterprise"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Для компаний, ТОО, АО и государственных органов</p>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Проверка БИН организации и подтверждение полномочий представителя.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Фиксация должности и основания полномочий (Устав или Доверенность).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Официальное коммерческое лицензирование от имени предприятия.</span>
                </li>
              </ul>
              <Link href="/get-ecp?type=legal" className="inline-block text-xs font-bold text-teal-700 hover:underline pt-2">
                {locale === "ru" ? "Оформить для организации →" : locale === "kk" ? "Заңды тұлғаға рәсімдеу →" : "Apply as Enterprise →"}
              </Link>
            </div>
          </div>

          {/* Live NCALayer Hardware / Service Detector */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                ncaStatus === "AVAILABLE"
                  ? "bg-emerald-100 text-emerald-700"
                  : ncaStatus === "UNAVAILABLE"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {ncaStatus === "AVAILABLE" ? (
                  <Wifi className="w-5 h-5 text-emerald-700" />
                ) : ncaStatus === "UNAVAILABLE" ? (
                  <WifiOff className="w-5 h-5 text-rose-700" />
                ) : (
                  <Cpu className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">
                  {locale === "ru" ? "Статус подключения NCALayer (порт 13579):" : locale === "kk" ? "NCALayer қосылу мәртебесі (13579 порты):" : "NCALayer Service Detector (Port 13579):"}
                </p>
                {ncaStatus === "IDLE" && (
                  <p className="text-slate-500">Нажмите «Проверить доступность», чтобы выполнить реальный WebSocket-тест.</p>
                )}
                {ncaStatus === "CHECKING" && (
                  <p className="text-indigo-600 flex items-center gap-1 font-semibold">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Подключение к ws://127.0.0.1:13579...
                  </p>
                )}
                {ncaStatus === "AVAILABLE" && (
                  <p className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> NCALayer успешно обнаружен и готов к подписанию
                  </p>
                )}
                {ncaStatus === "UNAVAILABLE" && (
                  <div className="text-rose-600 space-y-0.5">
                    <p className="font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> NCALayer не обнаружен на вашем компьютере.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Запустите приложение NCALayer или{" "}
                      <a href="https://pki.gov.kz/ncalayer/" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium">
                        установите его с официального сайта pki.gov.kz
                      </a>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={ncaStatus === "CHECKING"}
              onClick={testNCALayerConnection}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 shrink-0 font-semibold"
            >
              {ncaStatus === "CHECKING" ? "Проверка..." : "Проверить NCALayer"}
            </Button>
          </div>
        </div>
      </section>

      {/* ── 5. SECURITY & CRYPTOGRAPHY SPECIFICATIONS (REAL FACTS) ── */}
      <section id="security" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 sm:p-12 space-y-8 shadow-xl">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold rounded-full">
              <Lock className="w-3.5 h-3.5" />
              <span>Cryptographic Guarantee & Security Invariants</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {locale === "ru"
                ? "Проверенная криптографическая основа"
                : locale === "kk"
                ? "Дәлелденген криптографиялық негіз"
                : "Verified Cryptographic Foundation"}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {locale === "ru"
                ? "В FleXora цифровая подпись формируется математически через Node.js криптографический модуль. Это гарантирует аутентичность и невозможность тайной подмены параметров лицензии."
                : locale === "kk"
                ? "FleXora-да сандық қолтаңба Node.js криптографиялық модулі арқылы математикалық түрде жасалады. Бұл лицензия параметрлерін жасырын өзгертуді мүмкін етпейді."
                : "Digital signatures in FleXora are computed mathematically via the native cryptographic engine, ensuring zero possibility of undetected tampering."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Fingerprint className="w-4 h-4" />
                <span>Ed25519 Algorithm</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Edwards-curve Digital Signature Algorithm (EdDSA) обеспечивает 128-битный уровень стойкости при компактном 64-байтном размере подписи.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <Cpu className="w-4 h-4" />
                <span>Canonical JSON Hashing</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Детерминированная сортировка ключей объекта устраняет атаки через пробелы и порядок полей перед вычислением дайджеста SHA-256.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Document Checksums</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Хэш-суммы SHA-256 каждого сопутствующего документа включаются в подписываемый массив, связывая файлы с сертификатом.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. PUBLIC VERIFICATION CALLOUT ── */}
      <section id="verify-license" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t("verifyBlockTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t("verifyBlockDesc")}
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/verify-license">
              <Button variant="primary" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white" leftIcon={<ShieldCheck className="w-5 h-5 text-emerald-300" />}>
                {t("goToVerifyBtn")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. FREQUENTLY ASKED QUESTIONS ── */}
      <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" /> {t("faqSectionTitle")}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{t("faqSectionSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="p-6 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. IN-PLACE SUPPORT / CONTACT FORM (ДАЛ СОЛ ЖЕРДЕ БОЛЕК ОКНО КЫЛМАЙ) ── */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="p-8 sm:p-12 rounded-2xl border border-slate-200 bg-white shadow-lg space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>{locale === "ru" ? "Служба поддержки" : locale === "kk" ? "Қолдау қызметі" : "Technical Support"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {locale === "ru" ? "Свяжитесь с нами" : locale === "kk" ? "Қолдау байланысы" : "Get in Touch with Support"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {locale === "ru"
                ? "Возникли вопросы по выпуску лицензий или криптографической проверке? Заполните форму ниже, и мы ответим в течение нескольких минут."
                : locale === "kk"
                ? "Лицензия алу немесе криптографиялық тексеру бойынша сұрақтарыңыз бар ма? Төмендегі пішінді толтырыңыз, біз жедел жауап береміз."
                : "Questions about licensing or cryptographic verification? Fill in the details below and our team will get back to you promptly."}
            </p>
          </div>

          {contactSubmitted ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-4 animate-in fade-in duration-300">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm">
                  {locale === "ru" ? "Обращение успешно отправлено!" : locale === "kk" ? "Өтінішіңіз сәтті қабылданды!" : "Support Request Sent Successfully!"}
                </h4>
                <p className="text-xs text-emerald-800">
                  {locale === "ru"
                    ? "Спасибо! Наша команда поддержки свяжется с вами по указанному email."
                    : locale === "kk"
                    ? "Рақмет! Біздің қолдау тобы көрсетілген email арқылы сізбен жақын арада байланысады."
                    : "Thank you! Our support specialists will respond to your email shortly."}
                </p>
                <button
                  type="button"
                  onClick={() => setContactSubmitted(false)}
                  className="mt-3 text-xs font-semibold text-emerald-700 underline hover:text-emerald-900"
                >
                  {locale === "ru" ? "Отправить ещё одно сообщение" : locale === "kk" ? "Тағы хабарлама жіберу" : "Send another message"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-6 max-w-2xl">
              {contactError && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {contactError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {locale === "ru" ? "Аты (Имя)" : locale === "kk" ? "Атыңыз" : "Full Name"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={locale === "ru" ? "Арман Бақытұлы" : locale === "kk" ? "Арман Бақытұлы" : "John Doe"}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  />
                </div>

                {/* 2. Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {locale === "ru" ? "Е-майл (Email)" : locale === "kk" ? "Электрондық пошта (Email)" : "Email Address"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              {/* 3. Issue description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {locale === "ru" ? "Қандай мәселе болды (Суть вопроса / проблемы)" : locale === "kk" ? "Қандай мәселе болды?" : "Issue Description"} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={contactIssue}
                  onChange={(e) => setContactIssue(e.target.value)}
                  placeholder={
                    locale === "ru"
                      ? "Опишите вашу проблему или вопрос по лицензии..."
                      : locale === "kk"
                      ? "Лицензия немесе платформа туралы мәселеңізді сипаттаңыз..."
                      : "Describe your question or issue in detail..."
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-y"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={contactSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                leftIcon={contactSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              >
                {contactSubmitting
                  ? (locale === "ru" ? "Отправка..." : locale === "kk" ? "Жіберілуде..." : "Sending...")
                  : (locale === "ru" ? "Жіберу (Отправить)" : locale === "kk" ? "Жіберу" : "Submit Issue")}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* ── 9. FINAL CALL TO ACTION (START MANAGING) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-blue-50/40 to-teal-50/40 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {locale === "ru"
                ? "Управляйте лицензиями прозрачно и безопасно"
                : locale === "kk"
                ? "Лицензияларды ашық әрі қауіпсіз басқарыңыз"
                : "Manage Your Software Licenses with Confidence"}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {locale === "ru"
                ? "Создайте учётную запись FleXora и начните выпуск криптографических лицензий уже сегодня."
                : locale === "kk"
                ? "FleXora есептік жазбасын ашып, криптографиялық лицензияларды бүгіннен бастап беріңіз."
                : "Create your FleXora account to issue, track, and verify digital software licenses."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button variant="primary" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {locale === "ru" ? "Создать аккаунт" : locale === "kk" ? "Тіркелу" : "Create Account"}
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                {locale === "ru" ? "Войти в кабинет" : locale === "kk" ? "Кіру" : "Sign In"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
